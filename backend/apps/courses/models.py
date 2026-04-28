from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
import uuid
import os

User = get_user_model() # 유저 모델을 편하게 가져오기

# 강사 프로필 이미지 저장 경로 설정
def instructor_profile_upload_path(instance, filename):
    # 파일 확장자 추출
    ext = filename.split('.')[-1]
    # UUID를 이용한 랜덤 파일명 생성
    filename = f'{uuid.uuid4().hex}.{ext}'
    return os.path.join('instructors/profiles/', filename)

# 강사 첨부파일(자격증 등) 저장 경로 설정
def instructor_attachment_upload_path(instance, filename):
    return os.path.join(f'instructors/attachments/instructor_{instance.instructor_id}/', filename)

# -------------------------------------------------------
# [1] 강사(Instructor) 핵심 마스터 테이블
# -------------------------------------------------------
class Instructor(models.Model):
    instructor_id = models.BigAutoField(primary_key=True)
    
    # 1. 자연인(User) 계정과 1:1에 가깝게 연결
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='instructor_profiles', db_column='user_id')
    
    # 2. 특정 소속 기관이 있으면 연결 (아니면 null)
    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, null=True, blank=True, related_name='instructors', db_column='institution_id')
    
    affiliation = models.CharField(max_length=100, null=True, blank=True, help_text="소속(협의회 등)")
    affiliation_detail = models.CharField(max_length=255, null=True, blank=True, help_text="소속 상세 직접입력")
    
    bio = models.TextField(null=True, blank=True, help_text="자기소개/셀프어필")
    specialization = models.CharField(max_length=255, null=True, blank=True, help_text="전공 분야")
    experience_years = models.IntegerField(null=True, blank=True, help_text="경력 연수")
    certification = models.CharField(max_length=255, null=True, blank=True, help_text="보유 자격증 텍스트")
    
    profile_image = models.ImageField(upload_to=instructor_profile_upload_path, null=True, blank=True)
    region = models.CharField(max_length=255, null=True, blank=True, help_text="강의 가능 지역")
    
    agreed_marketing = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'instructors'
    def __str__(self):
        return f"[강사] {self.user.full_name}"

# -----------------------------------------------------------------
# [2] 강사 첨부파일 (InstructorAttachment) 테이블
# -----------------------------------------------------------------
class InstructorAttachment(models.Model):
    attachment_id = models.BigAutoField(primary_key=True)
    
    # 어떤 강사의 증명서인가? (종속 외래키)
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE, related_name='attachments')
    
    file_type = models.CharField(max_length=50, help_text="문서 종류(certificate, profile_pdf 등)")
    file_path = models.FileField(upload_to=instructor_attachment_upload_path)
    original_name = models.CharField(max_length=255)
    file_size = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'instructor_attachments'

def course_thumbnail_upload_path(instance, filename):
    # 파일 확장자 추출
    ext = filename.split('.')[-1]
    # UUID를 이용한 랜덤 파일명 생성
    filename = f'{uuid.uuid4().hex}.{ext}'
    # 해당 날짜를 기반으로 폴더 트리 생성 (thumbnails/courses/2026/03/파일명.png) 
    # created_at이 아직 없는 객체 생성 시점일 수 있으므로 이를 처리
    if instance.created_at:
        folder_path = instance.created_at.strftime('%Y/%m')
    else:
        from django.utils import timezone
        folder_path = timezone.now().strftime('%Y/%m')
    return os.path.join('thumbnails/courses/', folder_path, filename)

class Course(models.Model):
    # Enums Definition
    class CourseType(models.TextChoices):
        ONLINE = 'online', 'Online'
        OFFLINE = 'offline', 'Offline'
        PACKAGE = 'package', 'Package'

    class LunchProvided(models.TextChoices):
        YES = 'Y', 'Yes'
        NO = 'N', 'No'
        
    class AccommodationProvided(models.TextChoices):
        YES = 'Y', 'Yes'
        NO = 'N', 'No'

    class CourseStatus(models.TextChoices):
        PUBLISHED = 'published', 'Published'
        PRIVATE = 'private', 'Private'
        DRAFT = 'draft', 'Draft'
        DELETED = 'deleted', 'Deleted'

    class AccessType(models.TextChoices):
        PERIOD = 'period', 'Period'
        DAYS = 'days', 'Days'

    course_id = models.BigAutoField(primary_key=True)
    course_code = models.CharField(max_length=50, unique=True)
    course_name = models.CharField(max_length=255)
    course_type = models.CharField(max_length=20, choices=CourseType.choices)
    
    # In legacy, category_id points to categories table, but we will store it as integer for now
    category_id = models.BigIntegerField(null=True, blank=True)
    education_area = models.CharField(max_length=255, null=True, blank=True)
    category = models.CharField(max_length=100)
    sub_category = models.CharField(max_length=100, null=True, blank=True)
    edu_classification = models.CharField(max_length=50, null=True, blank=True)
    client_code = models.CharField(max_length=50, null=True, blank=True)
    
    description = models.TextField(null=True, blank=True)
    education_goal = models.TextField(null=True, blank=True)
    curriculum_summary = models.TextField(null=True, blank=True)
    target_audience = models.CharField(max_length=255, null=True, blank=True)
    education_location = models.CharField(max_length=255, null=True, blank=True)
    education_time = models.CharField(max_length=100, null=True, blank=True)
    lunch_time = models.CharField(max_length=100, null=True, blank=True)
    
    lunch_provided = models.CharField(max_length=1, choices=LunchProvided.choices, default=LunchProvided.NO)
    accommodation_provided = models.CharField(max_length=1, choices=AccommodationProvided.choices, default=AccommodationProvided.NO)
    stay_days = models.IntegerField(default=0)
    accommodation_period = models.CharField(max_length=100, null=True, blank=True)
    
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    learning_days = models.IntegerField(default=0)
    access_period_days = models.IntegerField(default=30)
    
    total_sessions = models.IntegerField(null=True, blank=True)
    max_students = models.IntegerField(null=True, blank=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_rate = models.IntegerField(default=0)
    completion_rate = models.IntegerField(default=90)
    
    is_free = models.BooleanField(default=False)
    is_approval_required = models.BooleanField(default=False)
    
    remark = models.TextField(null=True, blank=True)
    thumbnail_image = models.ImageField(upload_to=course_thumbnail_upload_path, null=True, blank=True)
    video_url = models.CharField(max_length=500, null=True, blank=True)
    view_count = models.IntegerField(default=0)
    
    course_status = models.CharField(max_length=20, choices=CourseStatus.choices, default=CourseStatus.DRAFT)
    
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    application_start_date = models.DateField(null=True, blank=True)
    application_end_date = models.DateField(null=True, blank=True)
    
    # 외래키 연결
    institution = models.ForeignKey('institutions.Institution', on_delete=models.SET_NULL, null=True, blank=True, db_column='institution_id', related_name='courses')
    
    # 설문조사 기능은 아직 없으므로 일단 나둔다.
    pre_survey_id = models.BigIntegerField(null=True, blank=True)
    post_survey_id = models.BigIntegerField(null=True, blank=True)
    satisfaction_survey_id = models.BigIntegerField(null=True, blank=True)
    
    # 생성자 또한 진짜 글로벌 User 테이블을 바라보게 묶어준다.
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, db_column='created_by', related_name='created_courses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    access_type = models.CharField(max_length=20, choices=AccessType.choices, default=AccessType.DAYS)
    retake_discount_rate = models.IntegerField(default=0)

    class Meta:
        db_table = 'courses'
        # 최신 등록순이 아닌, 등록된 순서(또는 과정 코드순)대로 출력되게 하려면 '-' 를 뺍니다.
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.course_code}] {self.course_name}"

# ----------------------------------------------------------------
# [3] 강좌 목차(CourseCurriculum) - 1강, 2강, 3강...
# ----------------------------------------------------------------
class CourseCurriculum(models.Model):
    curriculum_id = models.BigAutoField(primary_key=True)
    
    # 이 목차가 어떤 강좌에 소속되어 있는가! (종속 외래키)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='curriculums')
    
    chapter_name = models.CharField(max_length=255, help_text="목차명/주제")
    description = models.TextField(null=True, blank=True, help_text="상세 내용")
    instructor_name = models.CharField(max_length=100, null=True, blank=True, help_text="담당 강사명(옵션)")
    running_time = models.IntegerField(null=True, blank=True, help_text="소요시간(분)")
    display_order = models.IntegerField(default=0, help_text="표시 순서")
    
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'course_curriculums'
        # 장고가 알아서 순서(display_order)대로 정렬해서 뽑아줍니다!
        ordering = ['display_order', 'curriculum_id']
# -----------------------------------------------------------------
# [4] 강좌 운영 기수 (CourseSession) - 3월 반, 4월 반...
# -----------------------------------------------------------------
class CourseSession(models.Model):
    session_id = models.BigAutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    
    session_number = models.IntegerField(db_index=True)
    session_name = models.CharField(max_length=255)
    session_description = models.TextField(null=True, blank=True)
    video_url = models.CharField(max_length=500, null=True, blank=True)
    
    duration_minutes = models.IntegerField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    materials = models.TextField(null=True, blank=True) # JSON 텍스트나 긴 문자열 담을 용도
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'course_sessions'
        ordering = ['session_number']
# -----------------------------------------------------------------
# [5] 강좌 자료실 (CourseMaterial) - PPT, PDF 교재
# -----------------------------------------------------------------
class CourseMaterial(models.Model):
    class MaterialType(models.TextChoices):
        SYLLABUS = 'syllabus', '강의계획서'
        HANDOUT = 'handout', '유인물'
        DOCUMENT = 'document', '문서'
        VIDEO = 'video', '영상'
        ETC = 'etc', '기타'
    material_id = models.BigAutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    
    material_type = models.CharField(max_length=20, choices=MaterialType.choices)
    material_name = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500, null=True, blank=True)
    file_size = models.BigIntegerField(null=True, blank=True)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'course_materials'

# -----------------------------------------------------------------
# [6] 강좌-강사 다대다 맵핑 (CourseInstructor)
# -----------------------------------------------------------------
class CourseInstructor(models.Model):
    course_instructor_id = models.BigAutoField(primary_key=True)
    
    # 어떤 강좌에?
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='course_instructors')
    # 어떤 강사가 투입되나?
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE, related_name='course_mappings')
    
    is_primary = models.BooleanField(default=False, help_text="대표/메인 강사 여부")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'course_instructors'
        # [방어 로직] 한 강좌에 똑같은 강사가 실수로 중복 배정되는 것을 원천 차단!
        unique_together = ('course', 'instructor')
# -----------------------------------------------------------------
# [7] 패키지 강좌 묶음 (CoursePackageItem)
# -----------------------------------------------------------------
class CoursePackageItem(models.Model):
    package_item_id = models.BigAutoField(primary_key=True)
    
    # 아빠 강좌 (패키지 본체, parent)
    package = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='child_courses', help_text="패키지(상위) 강좌")
    # 자식 강좌 (패키지 안에 포함된 낱개 단과, child)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='package_parents', help_text="포함된(하위) 강좌")
    
    sort_order = models.IntegerField(default=0, help_text="패키지 내 강의 노출 순서")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'course_package_items'
        # [방어 로직] 동일한 패키지에 똑같은 단과 강좌가 두 번 담기는 것을 방지 (복합PK 효과 달성!)
        unique_together = ('package', 'course')
        ordering = ['sort_order']
# -----------------------------------------------------------------
# [8] 수강 후기 (CourseReview)
# -----------------------------------------------------------------
class CourseReview(models.Model):
    review_id = models.BigAutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    
    # 어떤 회원이 남긴 후기인가?
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_reviews')
    
    rating = models.IntegerField(default=5, help_text="별점(1~5)")
    comment = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'course_reviews'
        ordering = ['-created_at']
# -----------------------------------------------------------------
# [9] 강좌 일별 누적 통계 (CourseStatistic)
# -----------------------------------------------------------------
class CourseStatistic(models.Model):
    stat_id = models.BigAutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='statistics')
    
    stat_date = models.DateField(db_index=True)
    total_enrollments = models.IntegerField(default=0)
    completed_enrollments = models.IntegerField(default=0)
    average_progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = 'course_statistics'
        # 한 강좌에 대해 같은 날짜의 통계 데이터는 오직 1줄만 존재해야 함!
        unique_together = ('course', 'stat_date')
        ordering = ['-stat_date']