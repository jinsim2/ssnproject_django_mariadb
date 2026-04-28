from django.db import models
from django.contrib.auth import get_user_model

# Accounts 앱의 User 테이블을 외래키로 편하게 땡겨오기 위한 고급 비법
User = get_user_model()

class Institution(models.Model):
    # DB 스키마의 institution_type enum을 장고 TextChoices로 변환
    class InstitutionType(models.TextChoices):
        CENTRAL = 'central', '중앙'
        PROVINCIAL = 'provincial', '도/광역시'
        DISTRICT = 'district', '시/군/구'
        FACILITY = 'facility', '시설'

    class Status(models.TextChoices):
        ACTIVE = 'active', '활성'
        SUSPENDED = 'suspended', '정지'
        DELETED = 'deleted', '삭제'

    institution_id = models.BigAutoField(primary_key=True)
    institution_name = models.CharField(max_length=200)
    ceo_name = models.CharField(max_length=50, null=True, blank=True, help_text="대표자 성명")
    institution_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    registration_number = models.CharField(max_length=50, null=True, blank=True)
    
    address = models.CharField(max_length=255, null=True, blank=True)
    address_detail = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    fax = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(max_length=100, null=True, blank=True)
    
    institution_type = models.CharField(max_length=20, choices=InstitutionType.choices)
    region = models.CharField(max_length=20, null=True, blank=True)
    zipcode = models.CharField(max_length=10, null=True, blank=True)
    
    # 본인 테이블을 재귀적으로 참조 (상위 기관) - 문자열 형태였던 걸 강력한 진짜 관계형 외래키 지정으로 바꿨습니다!
    parent_institution = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='child_institutions')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    employee_count = models.IntegerField(default=0)
    allowed_ips = models.CharField(max_length=255, null=True, blank=True)
    
    # 파일 경로
    biz_license_file_path = models.CharField(max_length=255, null=True, blank=True)
    logo_file_path = models.CharField(max_length=255, null=True, blank=True)
    staff_file_path = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'institutions'
        verbose_name = 'Institution'
        verbose_name_plural = 'Institutions'

    def __str__(self):
        return f"{self.institution_name} ({self.get_institution_type_display()})"


class UserInstitution(models.Model):
    user_institution_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='institution_mappings')
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='user_mappings')
    
    department = models.CharField(max_length=100, null=True, blank=True)
    position = models.CharField(max_length=100, null=True, blank=True)
    district = models.CharField(max_length=100, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_institutions'


class Employee(models.Model):
    employee_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='employee_profiles')
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='employees')
    
    employee_number = models.CharField(max_length=50, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'employees'

class InstitutionApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', '대기중'
        APPROVED = 'approved', '승인됨'
        REJECTED = 'rejected', '반려됨'

    application_id = models.BigAutoField(primary_key=True, help_text="신청 고유 번호")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, help_text="처리 상태")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='institution_apps', help_text="신청자 ID")
    
    rejection_reason = models.TextField(null=True, blank=True, help_text="반려 사유")
    processed_at = models.DateTimeField(null=True, blank=True, help_text="처리 일시")
    processed_by = models.BigIntegerField(null=True, blank=True, help_text="처리한 관리자 ID")
    
    institution_name = models.CharField(max_length=200, help_text="기관명")
    registration_number = models.CharField(max_length=50, help_text="사업자등록번호")
    ceo_name = models.CharField(max_length=50, help_text="대표자 성명")
    institution_type = models.CharField(max_length=20, choices=Institution.InstitutionType.choices, help_text="기관 유형")
    
    region = models.CharField(max_length=20, help_text="지역")
    zipcode = models.CharField(max_length=10, help_text="우편번호")
    address = models.CharField(max_length=255, help_text="주소")
    address_detail = models.CharField(max_length=255, null=True, blank=True, help_text="상세주소")
    phone = models.CharField(max_length=20, help_text="대표 전화번호")
    fax = models.CharField(max_length=20, null=True, blank=True, help_text="대표 팩스")
    email = models.EmailField(max_length=100, help_text="대표 이메일")
    employee_count = models.IntegerField(default=0, help_text="직원 수")
    allowed_ips = models.CharField(max_length=255, null=True, blank=True, help_text="접속 허용 IP 목록")
    
    biz_license_file_name = models.CharField(max_length=255, null=True, blank=True)
    biz_license_file_path = models.CharField(max_length=255, null=True, blank=True)
    logo_file_name = models.CharField(max_length=255, null=True, blank=True)
    logo_file_path = models.CharField(max_length=255, null=True, blank=True)
    staff_file_name = models.CharField(max_length=255, null=True, blank=True)
    staff_file_path = models.CharField(max_length=255, null=True, blank=True)
    
    mgr_name = models.CharField(max_length=50, help_text="담당자 성명")
    mgr_dept = models.CharField(max_length=50, null=True, blank=True, help_text="담당자 부서")
    mgr_position = models.CharField(max_length=50, null=True, blank=True, help_text="직급")
    mgr_phone = models.CharField(max_length=20, help_text="휴대폰 번호")
    mgr_email = models.EmailField(max_length=100, help_text="담당자 이메일")
    
    is_privacy_policy_agreed = models.BooleanField(default=False)
    
    emp_proof_file_name = models.CharField(max_length=255, null=True, blank=True)
    emp_proof_file_path = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'institution_applications'
