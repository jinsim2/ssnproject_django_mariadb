from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, login_id, password=None, **extra_fields):
        if not login_id:
            raise ValueError('The Login ID must be set')
        user = self.model(login_id=login_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, login_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(login_id, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = [
        ('general', '일반 회원'),
        ('instructor', '강사'),
        ('institution_staff', '기관 담당자'),
        ('foreign', '외국인'),
    ]
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    # 기본 필드
    login_id = models.CharField(max_length=50, unique=True, db_index=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, db_index=True)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255, null=True, blank=True)
    user_type = models.CharField(max_length=50, choices=USER_TYPE_CHOICES, db_index=True)
    
    # 인증 및 부가정보
    is_verified = models.BooleanField(default=False)
    ci = models.CharField(max_length=255, null=True, blank=True)
    
    # 보호자 동의 (14세 미만)
    is_under_14 = models.BooleanField(default=False)
    guardian_consent = models.BooleanField(default=False)
    guardian_name = models.CharField(max_length=100, null=True, blank=True)
    guardian_phone = models.CharField(max_length=20, null=True, blank=True)
    guardian_relationship = models.CharField(max_length=50, null=True, blank=True)
    
    # 활성 상태 및 로깅 (password, last_login은 AbstractBaseUser에 내장)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False) # Django Admin 접근용
    last_activity = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # 개인정보
    birthdate = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    
    # 소속 회사/기관 정보
    company_name = models.CharField(max_length=100, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    position = models.CharField(max_length=100, null=True, blank=True)
    biz_reg_no = models.CharField(max_length=50, null=True, blank=True)
    company_phone = models.CharField(max_length=20, null=True, blank=True)
    company_email = models.EmailField(max_length=100, null=True, blank=True)
    company_zipcode = models.CharField(max_length=10, null=True, blank=True)
    company_address = models.CharField(max_length=255, null=True, blank=True)
    
    # 기타 정보
    serial_no = models.CharField(max_length=50, null=True, blank=True)
    affiliation_council = models.IntegerField(null=True, blank=True)
    care_bank_inst = models.IntegerField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'login_id'
    REQUIRED_FIELDS = ['full_name', 'email', 'phone', 'user_type']

    class Meta:
        db_table = 'users' # PHP의 기존 테이블 이름 'users'와 동일하게 매핑
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.full_name} ({self.login_id})"

class Administrator(models.Model):
    ADMIN_TYPE_CHOICES = [
        ('super_admin', '최고 관리자'),
        ('upper_admin', '상위 관리자'),
        ('lower_admin', '하위 관리자'),
    ]

    admin_id = models.BigAutoField(primary_key=True)
    # MUL: 한 유저 당 여러 관리자 권한을 가질 수도 있는 여지를 위해 ForeignKey 사용 (1:1 보장시 OneToOneField 권장)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id', related_name='admin_profiles')
    # 외부 Institution 테이블과 연동 (현재 모델이 없으므로 BigIntegerField로 임시 매핑)
    # institutions 테이블이 생성되었으므로 수정한다.
    # (외래키로 완벽하게 연결! 앱 간 순환 참조 방지를 위해 문자열 형태로 참조한다.)
    # 마이그레이션 충돌 방지 및 '최고 관리자'의 유연성을 위해 null=True 허용
    institution = models.ForeignKey('institutions.Institution', on_delete=models.CASCADE, db_column='institution_id', related_name='administrators', null=True, blank=True)
    admin_type = models.CharField(max_length=20, choices=ADMIN_TYPE_CHOICES, db_index=True)
    # longtext 타입 매핑. JSON 형식으로 권한을 담을 것을 대비.
    permissions = models.JSONField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    allowed_ips = models.CharField(
        max_length=255, 
        null=True, 
        blank=True, 
        help_text="접속 허용 IP 목록(콤마로 구분, 비어있으면 모두 허용)"
    )

    class Meta:
        db_table = 'administrators'
        verbose_name = 'Administrator'
        verbose_name_plural = 'Administrators'

    def __str__(self):
        return f"{self.user.full_name} - {self.get_admin_type_display()} (Inst: {self.institution_id})"
