import requests
from django.conf import settings
from django.db import transaction
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Cart, Order, Enrollment
from .serializers import CartSerializer, OrderSerializer, EnrollmentSerializer

class CartViewSet(viewsets.ModelViewSet):
    """
    장바구니(Cart) 관리를 위한 뷰셋입니다.
    - 사용자는 '자신의' 장바구니 목록만 볼 수 있고, 삭제할 수 있어야 합니다.
    """
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated] # 로그인한 유저만 장바구니 사용 가능!

    def get_queryset(self):
        # 1. 프론트에서 GET 요청이 오면 실행됩니다.
        # 2. 모든 장바구니를 주지 않고, "현재 요청을 보낸 로그인 유저"의 장바구니만 필터링해서 줍니다.
        return Cart.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # 3. 프론트에서 POST 요청(장바구니 담기)이 오면 실행됩니다.
        user = self.request.user
        course = serializer.validated_data['course']
        
        # [방어 로직 1] 이미 장바구니에 담긴 강좌인지 확인
        if Cart.objects.filter(user=user, course=course).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"message": "이미 장바구니에 담긴 강좌입니다."})

        # [방어 로직 2] 이미 수강 권한(Enrollment)을 보유한 강좌인지 확인
        from .models import Enrollment
        if Enrollment.objects.filter(user=user, course=course, enrollment_status='approved').exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"message": "이미 수강 중인 강좌입니다."})

        # 4. 통과 시, 저장할 때 user_id를 현재 로그인한 유저로 강제 고정하여 보안을 높입니다.
        serializer.save(user=user)

class OrderViewSet(viewsets.ModelViewSet):
    """
    주문(Order) 관리를 위한 뷰셋입니다. (결제 내역, 영수증 역할)
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 1. 일반 유저는 결제 내역 조회 시 '내 결제 건'만 나와야 하지만,
        # 2. 시스템 관리자(admin)나 기관 그룹 관리자는 모든 사람의 결제 내역을 볼 수 있어야 합니다!
        user = self.request.user
        if user.is_staff or getattr(user, 'user_type', '') in ['admin', 'institution_admin']:
            return Order.objects.all().order_by('-created_at')
        
        return Order.objects.filter(user=user).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='process_free')
    def process_free(self, request):
        """0원(무료) 장바구니 결제를 PG사 없이 즉시 승인(Enrollment 생성) 처리합니다."""
        user = request.user
        # 1. 장바구니 조회
        from .models import Cart, Order, OrderItem, Enrollment
        cart_items = Cart.objects.filter(user=user)
        
        if not cart_items.exists():
            return Response({"error": "장바구니가 비어 있습니다."}, status=status.HTTP_400_BAD_REQUEST)
            
        # 2. 진짜 0원이 맞는지 백엔드에서 2차 검증 (보안)
        total_amount = sum(item.course.price for item in cart_items)
        if total_amount > 0:
            return Response({"error": "무료 강좌가 아닙니다. 정상 결제를 진행해주세요."}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.utils import timezone
        
        # 3. 0원짜리 주문서(Order) 생성
        order_no = f"FREE_{timezone.now().strftime('%Y%m%d%H%M%S')}_{user.id}"
        order = Order.objects.create(
            order_no=order_no,
            user=user,
            total_amount=0,
            status='completed', # 즉시 결제 완료 처리
            payment_method='credit_card' # 형식상 카드 결제로 기입
        )
        
        # 4. 수강권(Enrollment) 즉시 발급 및 장바구니 비우기
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order, course=cart_item.course, price=0
            )
            Enrollment.objects.create(
                user=user,
                course=cart_item.course,
                enrollment_status='approved', # 즉시 수강 승인
                order=order
            )
            
        cart_items.delete() # 발급 끝났으니 장바구니 초기화
        
        return Response({"success": True, "message": "무료 수강신청 완료"})


    @action(detail=False, methods=['post'], url_path='verify')
    def verify_payment(self, request):
        """
        포트원에서 넘어온 결제 기록을 검증하고, 문제가 없으면 수강신청을 확정합니다.
        호출 주소: POST /api/enrollments/orders/verify/
        """
        imp_uid = request.data.get('imp_uid')
        merchant_uid = request.data.get('merchant_uid')

        if not imp_uid or not merchant_uid:
            return Response({"success": False, "message": "결제 번호가 누락되었습니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. 포트원 접근 액세스 토큰 발급 (settings.py에 둔 키 활용)
        token_url = "https://api.iamport.kr/users/getToken"
        token_req = requests.post(token_url, json={
            "imp_key": settings.PORTONE_REST_API_KEY,
            "imp_secret": settings.PORTONE_REST_API_SECRET
        })
        token_data = token_req.json()

        if token_data['code'] != 0:
            return Response({"success": False, "message": "포트원 토큰 발급에 실패했습니다."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        access_token = token_data['response']['access_token']

        # 2. imp_uid를 이용해 포트원의 실제 결제 내역(영수증) 조회
        payment_url = f"https://api.iamport.kr/payments/{imp_uid}"
        headers = {"Authorization": access_token}
        payment_req = requests.get(payment_url, headers=headers)
        payment_info = payment_req.json()['response']

        # ----------------- 결제 취소(환불) 유틸리티 함수 선언 -----------------
        def cancel_payment(reason_msg):
            cancel_url = "https://api.iamport.kr/payments/cancel"
            requests.post(cancel_url, headers=headers, json={
                "imp_uid": imp_uid,
                "reason": reason_msg
            })
        # -----------------------------------------------------------------

        # 3. 내 장바구니에서 진짜 지불해야 하는 가격 계산
        user = request.user
        carts = Cart.objects.filter(user=user)
        if not carts.exists():
            cancel_payment("장바구니 데이터 없음 (위변조 또는 비정상 접근)")
            return Response({"success": False, "message": "장바구니가 비어있어 승인된 결제를 자동 취소했습니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 장바구니 총합 (백엔드의 진짜 가격 데이터!)
        total_price_to_pay = sum(cart.course.price for cart in carts)
        
        # 4. 해커 검증 (금액이 조작되지 않았는지 대조)
        if float(payment_info['amount']) != float(total_price_to_pay):
            cancel_payment(f"결제 금액 위변조 감지 (요청액: {payment_info['amount']}, 실제액: {total_price_to_pay})")
            return Response({"success": False, "message": "결제금액 불일치로 인하여 승인된 결제를 자동 취소했습니다."}, status=status.HTTP_400_BAD_REQUEST)

        if payment_info['status'] != 'paid':
            return Response({"success": False, "message": "성공적으로 결제된 정상 내역이 아닙니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 5. 모든 검증을 통과! DB 트랜잭션으로 주문과 수강을 확정합니다.
        with transaction.atomic():
            # 주문서(Order) 생성
            order = Order.objects.create(
                order_no=merchant_uid,
                user=user,
                total_amount=total_price_to_pay,
                status='completed',
                payer_name=payment_info.get('buyer_name'),
                payer_phone=payment_info.get('buyer_tel'),
                payer_email=payment_info.get('buyer_email'),
                payment_method='credit_card',
            )

            # 주문서의 상품 목록 저장, 및 강의 수강권한 동시에 생성
            # 맨 위에서 from .models import OrderItem, Payment 등을 불러와야 할 수 있습니다. 
            for cart in carts:
                # 주문내역에 저장 
                # (주의: OrderItem 모델의 app import 확인 필)
                # enrollments_models 에서 OrderItem과 Payment 객체를 import했는지 꼭 체크해주세요!
                cart.order_item = order.items.create(
                    course=cart.course,
                    price=cart.course.price
                )

                # 결제 완료 수강 등록
                from .models import Enrollment, Payment # (만약 파일 맨위에 없다면 인라인 임포트)
                enrollment = Enrollment.objects.create(
                    user=user,
                    course=cart.course,
                    enrollment_status='approved',
                    order=order,
                    start_date=timezone.now().date()
                )

            # 결제(Payment) 객체 생성
            Payment.objects.create(
                order=order,
                user=user,
                payment_amount=total_price_to_pay,
                payment_status='completed',
                payment_gateway='portone',
                transaction_id=imp_uid
            )

            # 이수강생의 장바구니 싹 비우기
            carts.delete()

        return Response({"success": True, "message": "결제가 성공적으로 확정되었습니다!"})



class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    실제 LMS 수강 권한(Enrollment) 관리 뷰셋입니다. (나의 강의실 및 수강생 관리 렌더링용)
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # 관리자: B2B 수강생 관리 메뉴에서 모든 데이터를 봅니다.
        if user.is_staff or getattr(user, 'user_type', '') in ['admin', 'institution_admin']:
            return Enrollment.objects.all().order_by('-enrollment_date')
        
        # 일반 학습자: '나의 강의실' 메뉴에서 내 수강 목록만 봅니다.
        return Enrollment.objects.filter(user=user).order_by('-enrollment_date')

    @action(detail=True, methods=['get'], url_path='player_info')
    def player_info(self, request, pk=None):
        """
        플레이어 화면 접속 시 우측에 띄워줄 '전체 목차'와 '나의 진도율'을 합쳐서 반환합니다.
        호출 주소: GET /api/enrollments/enrollments/<수강권번호>/player_info/
        """
        enrollment = self.get_object()
        course = enrollment.course
        # 이 강좌의 모든 차시(Session)를 순서대로 가져옴
        sessions = course.sessions.all().order_by('session_number')

        from .models import LearningProgress
        
        session_data = []
        for session in sessions:
            # 이 유저가 해당 차시를 본 적이 있는지(진도 테이블) 확인
            progress = LearningProgress.objects.filter(enrollment=enrollment, session=session).first()
            
            session_data.append({
                "session_id": session.session_id,
                "session_name": session.session_name,
                "video_url": session.video_url,  # 추후 여기에 MP4 링크를 연결!
                "progress_rate": progress.progress_rate if progress else 0,
                "last_position": progress.last_position if progress else 0,
                "is_completed": progress.is_completed if progress else False,
            })

        return Response({
            "course_title": course.course_name,
            "sessions": session_data
        })

    @action(detail=True, methods=['post'], url_path='update_progress')
    def update_progress(self, request, pk=None):
        """
        동영상 플레이어에서 5~10초 단위로 쏘는 진도율 저장(Ping) 요청을 처리합니다.
        호출 주소: POST /api/enrollments/enrollments/<수강권번호>/update_progress/
        """
        enrollment = self.get_object()
        session_id = request.data.get('session_id')
        last_position = request.data.get('last_position', 0)
        progress_rate = request.data.get('progress_rate', 0)
        is_completed = request.data.get('is_completed', False)

        if not session_id:
            return Response({"error": "session_id가 누락되었습니다."}, status=status.HTTP_400_BAD_REQUEST)

        from .models import LearningProgress
        
        # 1. 기존 진도율 정보가 있는지 확인, 없으면 새로 생성 (Upsert 패턴)
        progress, created = LearningProgress.objects.get_or_create(
            enrollment=enrollment,
            session_id=session_id,
            defaults={
                'last_position': last_position,
                'progress_rate': progress_rate,
                'is_completed': is_completed
            }
        )

        # 2. 이미 존재하는 데이터라면? 상황에 맞게 덮어쓰기! 
        if not created:
            # 진도율(%)은 꼼수(뒤로가기) 방지를 위해 기존보다 높거나 같을 때만 갱신
            if float(progress_rate) > float(progress.progress_rate):
                progress.progress_rate = progress_rate
            
            # 이어보기 위치(초)는 유저가 영상을 앞으로 돌려볼 수도 있으니 현재 위치로 무조건 덮어씀
            progress.last_position = last_position
            
            # 완강 처리 (한 번 완강되면 계속 유지)
            if is_completed and not progress.is_completed:
                from django.utils import timezone
                progress.is_completed = True
                progress.completed_at = timezone.now()
            
            progress.save()

        # 3. 학습 로그(LearningLog) 기록 남기기 (시청 이력 추적용)
        from .models import LearningLog
        LearningLog.objects.create(
            enrollment=enrollment,
            session_id=session_id,
            event_type='playing', # models.py 정의에 맞춤
            position_seconds=last_position # models.py 정의에 맞춤
        )

        return Response({
            "success": True,
            "message": "진도가 성공적으로 세이브되었습니다.",
            "current_rate": progress.progress_rate,
            "last_position": progress.last_position
        })


