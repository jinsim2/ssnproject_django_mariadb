from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from django.utils.timezone import now
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    회원가입 API (FastAPI의 POST /register 라우터에 해당)
    - 누구나 접근 가능 (AllowAny)
    - POST 요청으로 회원정보를 받아 DB에 저장
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class RetrieveUserView(generics.RetrieveAPIView):
    """
    내 정보 조회 API (FastAPI의 GET /users/me 라우터에 해당)
    - JWT 토큰으로 인증된 사람만 접근 가능 (IsAuthenticated)
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # 현재 인증된 유저 객체를 반환합니다. (URL 파라미터로 id를 받지 않아도 됨)
        return self.request.user

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
def check_id(request):
    """
    ID 중복 확인 API
    """
    login_id = request.data.get('login_id', '')
    if not login_id:
        return Response({'is_available': False, 'message': '아이디를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(login_id=login_id).exists():
        return Response({'is_available': False, 'message': '이미 사용 중인 아이디입니다.'}, status=status.HTTP_200_OK)
    return Response({'is_available': True, 'message': '사용 가능한 아이디입니다.'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def check_email(request):
    """
    이메일 중복 확인 API
    """
    email = request.data.get('email', '')
    if not email:
        return Response({'is_available': False, 'message': '이메일을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({'is_available': False, 'message': '이미 사용 중인 이메일입니다.'}, status=status.HTTP_200_OK)
    return Response({'is_available': True, 'message': '사용 가능한 이메일입니다.'}, status=status.HTTP_200_OK)

import requests

# PortOne API Credentials (실무에서는 환경 변수로 빼는 것이 좋다)
# 아임포트 관리자 콘솔 -> 내 정보 -> API Keys 에 있는 정보 (현재 테스트용 하드코딩)
PORTONE_REST_API_KEY = "0030075461151527" # 포트원의 실제 키로 교체해야 한다!
PORTONE_REST_API_SECRET = "mrILCnSTyqsiB7qBboPkCbA330XBRVAumX6xvj6rF1hefgKhbulGwsjeARegaRbSgGVmTKUeAXWYKpcG" # 본인의 Secret 키 입력

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_identity(request):
    """
    포트원(iamport) 본인인증 결과를 검증하고 실제 개인정보를 가져오는 API
    """
    imp_uid = request.data.get('imp_uid')
    if not imp_uid:
        return Response({'success': False, 'message': 'imp_uid가 누락되었습니다.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1. 포트원 API에 접속하기 위한 토큰 발급 요청
        token_url = "https://api.iamport.kr/users/getToken"
        token_payload = {
            "imp_key": PORTONE_REST_API_KEY,
            "imp_secret": PORTONE_REST_API_SECRET
        }
        
        token_res = requests.post(token_url, json=token_payload)
        token_data = token_res.json()
        
        if token_data['code'] != 0:
            return Response({'success': False, 'message': '포트원 토큰 발급 실패'}, status=status.HTTP_401_UNAUTHORIZED)
            
        access_token = token_data['response']['access_token']

        # 2. 발급받은 토큰으로 imp_uid에 해당하는 인증 정보 조회
        cert_url = f"https://api.iamport.kr/certifications/{imp_uid}"
        headers = {"Authorization": access_token}
        
        cert_res = requests.get(cert_url, headers=headers)
        cert_data = cert_res.json()
        
        if cert_data['code'] != 0:
             return Response({'success': False, 'message': '인증 정보를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
        
        # 3. 실제 유저 정보 추출 (이름, 전화번호, 생년월일, 성별 등)
        response_data = cert_data['response']
        
        # 포트원 데이터 포맷 가공 (생년월일 YYYYMMDD 등 프론트에 맞게)
        birth = response_data.get('birthday', '')
        if birth and len(birth) >= 10:
            # 보통 "1990-01-01" 형태로 옴 -> "19900101" 로 변환
            birth_formatted = birth.replace("-", "")
        else:
            birth_formatted = ""
            
        # 성별 매핑 ("male" / "female")
        gender_raw = response_data.get('gender')
        gender_mapped = "male" if gender_raw == "male" else "female" if gender_raw == "female" else ""

        user_info = {
            "name": response_data.get('name'),
            "mobile": response_data.get('phone'),
            "birthDate": birth_formatted,
            "gender": gender_mapped,
            "unique_key": response_data.get('unique_key'), # CI 값 (식별자)
        }
        
        return Response({
            'success': True,
            'userInfo': user_info
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Verify Identity Error: {str(e)}")
        return Response({'success': False, 'message': '서버 내부 통신 에러가 발생했습니다.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # 로그인한 사람(또는 관리자)만 볼 수 있게 보호
def get_concurrent_users(request):
    """
    최근 15분 이내에 활동이 있었던 동시 접속자 수를 반환해주는 API
    """
    # 지금 시간으로부터 15분을 뺌 (결과: 15분 전의 특정 시각)
    time_threshold = now() - timedelta(minutes=15)
    
    # User 테이블에서 마지막 활동(last_activity)이 '15분 전 시각'보다 더 크거나 같은(최근인) 사람의 수를 셉니다.
    active_count = User.objects.filter(last_activity__gte=time_threshold).count()
    
    return Response({'concurrent_users': active_count})

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import AuthenticationFailed

class AdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # 1. 1차 검증: 아이디/비밀번호가 맞는지부터 부모(SimpleJWT) 로직에 돌려 확인합니다.
        data = super().validate(attrs)
        
        # 2. 2차 검증: 아이디/비밀번호가 맞았다면, 이 유저가 관리자 테이블에 있는지 확인!
        has_admin_profile = self.user.admin_profiles.filter(is_active=True).exists()
        
        if not has_admin_profile:
            # 관리자가 아닌데 어드민 로그인 창에서 시도한 경우, 즉시 토큰 발급을 거절합니다.
            raise AuthenticationFailed("관리자 권한이 없습니다. 일반 유저 페이지를 이용해 주세요.")
            
        return data

class AdminTokenObtainPairView(TokenObtainPairView):
    # 우리가 방금 개조한 커스텀 시리얼라이저를 사용하도록 장착!
    serializer_class = AdminTokenObtainPairSerializer

