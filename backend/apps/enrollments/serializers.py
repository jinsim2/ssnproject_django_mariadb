from rest_framework import serializers
from .models import Cart, Order, OrderItem, Payment, Refund, Enrollment, LearningProgress, LearningLog
from courses.serializers import CourseListSerializer

class CartSerializer(serializers.ModelSerializer):
    # 장바구니에서 가장 중요한 건 "내가 담은 강좌 이름과 가격"입니다.
    course_title = serializers.CharField(source='course.course_name', read_only=True)
    course_price = serializers.DecimalField(source='course.price', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['cart_id', 'user', 'course', 'course_title', 'course_price', 'created_at']
        read_only_fields = ['user']

class OrderItemSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.course_name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['order_item_id', 'course', 'course_title', 'schedule_id', 'price']

class OrderSerializer(serializers.ModelSerializer):
    # 주문 1개 안에 들어있는 상품(강좌) 배열을 한 번에 보여줍니다.
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'order_id', 'order_no', 'user', 'total_amount', 'status', 
            'payer_name', 'payer_phone', 'payer_email', 'company_name', 
            'payment_method', 'notes', 'created_at', 'items'
        ]
        # 사용자가 함부로 고칠 수 없는(서버가 찍어주는) 필드들
        read_only_fields = ['order_no', 'user', 'status', 'total_amount']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    # LMS 내 강의실 및 관리자 페이지에서 렌더링하기 편하도록 부가정보를 추가합니다.
    course_title = serializers.CharField(source='course.course_name', read_only=True)
    course_type = serializers.CharField(source='course.course_type', read_only=True)
    learner_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ['user', 'enrollment_date']

class LearningProgressSerializer(serializers.ModelSerializer):
    """수강생의 차시별 누적 진도율과 마지막 시청 위치를 변환합니다."""
    class Meta:
        model = LearningProgress
        fields = '__all__'

class LearningLogSerializer(serializers.ModelSerializer):
    """재생/일시정지 등의 세부 비디오 조작 로그를 변환합니다."""
    class Meta:
        model = LearningLog
        fields = '__all__'

