from django.db import models
from django.conf import settings
from courses.models import Course

class Cart(models.Model):
    cart_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='carts', db_column='user_id')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='cart_items', db_column='course_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'carts'

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]
    METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('bank_soodong', 'Bank Soodong')
    ]

    order_id = models.BigAutoField(primary_key=True)
    order_no = models.CharField(max_length=50, unique=True, help_text="고유 주문번호(YYYYMMDD-uniqueid)")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='orders', db_column='user_id')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # 구매자 정보 스냅샷
    payer_name = models.CharField(max_length=100, null=True, blank=True)
    payer_phone = models.CharField(max_length=20, null=True, blank=True)
    payer_email = models.CharField(max_length=100, null=True, blank=True)
    company_name = models.CharField(max_length=100, null=True, blank=True)
    
    payment_method = models.CharField(max_length=50, choices=METHOD_CHOICES)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_column='upload_at') # 기존 컬럼명 유지

    class Meta:
        db_table = 'orders'


class OrderItem(models.Model):
    order_item_id = models.BigAutoField(primary_key=True, db_column='order_time_id') # 오타 보정
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', db_column='order_id')
    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name='order_items', db_column='course_id')
    schedule_id = models.BigIntegerField(null=True, blank=True, help_text="오프라인 강의 일정 ID")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_items'


class Enrollment(models.Model):
    ENROLLMENT_TYPES = [('individual', 'Individual'), ('group', 'Group')]
    ENROLLMENT_STATUS = [
        ('pending', 'Pending'), ('approved', 'Approved'), 
        ('rejected', 'Rejected'), ('waiting', 'Waiting'), ('cancelled', 'Cancelled')
    ]
    COMPLETION_STATUS = [
        ('in_progress', 'In Progress'), ('completed', 'Completed'), ('failed', 'Failed')
    ]

    enrollment_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments', db_column='user_id')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments', db_column='course_id')
    # 임시로 BigIntegerField로 설계 (추후 OfflineSchedule 연동 대비)
    schedule_id = models.BigIntegerField(null=True, blank=True)
    
    enrollment_type = models.CharField(max_length=20, choices=ENROLLMENT_TYPES, default='individual')
    enrollment_status = models.CharField(max_length=20, choices=ENROLLMENT_STATUS, default='pending')
    
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_enrollments', db_column='approved_by')
    approved_at = models.DateTimeField(null=True, blank=True)
    enrollment_date = models.DateTimeField(auto_now_add=True)
    
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    
    is_completed = models.BooleanField(default=False)
    completion_status = models.CharField(max_length=20, choices=COMPLETION_STATUS, default='in_progress')

    # 단체 신청의 경우 어떤 주문을 통해 들어왔는지 추적 (기존 PHP에 있던 order_id 암묵적 연동)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='enrollments', db_column='order_id')

    class Meta:
        db_table = 'enrollments'


class Payment(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed'),
        ('cancelled', 'Cancelled'), ('refunded', 'Refunded')
    ]
    
    payment_id = models.BigAutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments', db_column='order_id')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments', db_column='enrollment_id')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='payments', db_column='user_id')
    
    payment_method = models.CharField(max_length=50, choices=Order.METHOD_CHOICES)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_gateway = models.CharField(max_length=50, null=True, blank=True)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    confirmed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='confirmed_payments', db_column='confirmed_by')
    bank_account_info = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'


class Refund(models.Model):
    REFUND_STATUS = [
        ('requested', 'Requested'), ('approved', 'Approved'),
        ('rejected', 'Rejected'), ('completed', 'Completed')
    ]

    refund_id = models.BigAutoField(primary_key=True)
    payment = models.ForeignKey(Payment, on_delete=models.PROTECT, related_name='refunds', db_column='payment_id')
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2)
    refund_reason = models.TextField(null=True, blank=True)
    
    refund_bank_name = models.CharField(max_length=100, null=True, blank=True)
    refund_account_number = models.CharField(max_length=100, null=True, blank=True)
    refund_account_holder = models.CharField(max_length=100, null=True, blank=True)
    
    refund_status = models.CharField(max_length=20, choices=REFUND_STATUS, default='requested')
    
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='requested_refunds', db_column='requested_by')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_refunds', db_column='approved_by')
    
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'refunds'

class LearningProgress(models.Model):
    """
    수강생이 특정 강좌의 '특정 차시(Session)'를 얼마나 시청했는지 진도율을 저장합니다.
    """
    progress_id = models.BigAutoField(primary_key=True)
    # 어떤 수강증(Enrollment)으로 보고 있는가?
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='progresses')
    # 몇 강(Session)을 보고 있는가? ('앱이름.모델명' 으로 순환 참조 방지)
    session = models.ForeignKey('courses.CourseSession', on_delete=models.CASCADE, related_name='progresses')
    
    # 이어보기 및 퍼센트
    progress_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="진도율 (0~100)")
    last_position = models.IntegerField(default=0, help_text="마지막 시청 위치(초 단위)")
    
    # 완강 여부
    is_completed = models.BooleanField(default=False)
    
    # 시간 기록
    last_accessed_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'learning_progress'
        # 한 수강권 안에서 1강 진도는 딱 1줄만 존재해야 하므로 중복 방지
        unique_together = ('enrollment', 'session')

class LearningLog(models.Model):
    """
    수강생이 재생/일시정지 등을 눌렀을 때의 세부 로그 기록용 테이블 (법정 의무교육 등 엄격한 추적용)
    """
    log_id = models.BigAutoField(primary_key=True)
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    session = models.ForeignKey('courses.CourseSession', on_delete=models.CASCADE)
    
    event_type = models.CharField(max_length=50, help_text="play, pause, complete 등")
    position_seconds = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'learning_logs'
