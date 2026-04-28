from rest_framework import serializers
from .models import (
    Course, Instructor, InstructorAttachment, CourseCurriculum,
    CourseSession, CourseMaterial, CourseInstructor, CoursePackageItem,
    CourseReview, CourseStatistic
)
from datetime import date
from django.contrib.auth import get_user_model

User = get_user_model()

# =========================================================================
# 1. 서브 모델 시리얼라이저 (작은 부품들)
# =========================================================================

class InstructorSerializer(serializers.ModelSerializer):
    # 강사의 User 계정 이름(full_name)을 훔쳐옵니다!
    instructor_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Instructor
        fields = ['instructor_id', 'instructor_name', 'bio', 'specialization', 'profile_image']

class CourseCurriculumSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCurriculum
        fields = ['curriculum_id', 'chapter_name', 'description', 'instructor_name', 'running_time', 'display_order']

class CourseSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseSession
        fields = ['session_id', 'session_number', 'session_name', 'duration_minutes', 'video_url']

# =========================================================================
# 2. 강좌 목록용 시리얼라이저 (가벼운 버전 + 프론트 호환성 100% 유지)
# =========================================================================

class CourseListSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='course_code', read_only=True) # 프론트엔드가 쓰던 'id' 유지!
    title = serializers.CharField(source='course_name', read_only=True) # 기존 'title' 유지!
    thumbnailUrl = serializers.SerializerMethodField() # 기존 로직 살리기
    status = serializers.SerializerMethodField()       # 기존 로직 살리기
    
    # 누가 만들었나? 기관 이름은 뭔가? (외래키 활용)
    institution_name = serializers.CharField(source='institution.institution_name', read_only=True)
    
    class Meta:
        model = Course
        fields = ['course_id', 'id', 'title', 'category', 'description', 'thumbnailUrl', 'status', 'institution_name', 'course_status', 'price']
        
    def get_thumbnailUrl(self, obj):
        # 기존 레거시: 실제 파일이 있으면 그걸 주고 아니면 더미를 줘라! (완벽 보존)
        if obj.thumbnail_image:
             request = self.context.get('request')
             if request is not None:
                 return request.build_absolute_uri(obj.thumbnail_image.url)
             return obj.thumbnail_image.url
             
        if '직무교육' in obj.category:
            return f"@/assets/images/thumbnail/job/{obj.course_code}.png"
        return f"@/assets/images/thumbnail/legal/{obj.course_code}.png"
        
    def get_status(self, obj):
        # 기존 레거시: 날짜 계산해서 프론트에 프렌들리한 상태 반환하라! (완벽 보존)
        today = date.today()
        start = obj.application_start_date
        end = obj.application_end_date
        
        if start and end:
            if start <= today <= end:
                return 'reception'
            elif today > end:
                return 'closed'
            elif today < start:
                return 'upcoming'
        
        if obj.course_status == 'published':
            return 'reception'
        
        return 'upcoming'

# =========================================================================
# 3. 강좌 상세용 시리얼라이저 (무거운 버전 - 우주선급)
# =========================================================================

class CourseDetailSerializer(CourseListSerializer):
    """
    강좌 하나를 클릭해 디테일에 들어갔을 때, 
    그 강좌에 달린 목차, 기수, 강사 정보 배열을 전부 끌고오는 엄청난 시리얼라이저입니다.
    """
    # 💥 놀라운 매직 포인트: 이 강좌에 파생된 자식들을 통째로 배열(JSON Array)로 내어줍니다!
    curriculums = CourseCurriculumSerializer(many=True, read_only=True)
    sessions = CourseSessionSerializer(many=True, read_only=True)
    
    # 다대다 관계인 강사들도 끌어옵니다!
    instructors = serializers.SerializerMethodField()

    class Meta(CourseListSerializer.Meta):
        # List의 필드들에다가 자식배열들을 추가!
        fields = CourseListSerializer.Meta.fields + [
            'target_audience', 'education_time', 'curriculums', 'sessions', 'instructors'
        ]

    def get_instructors(self, obj):
        # 다대다 중간 테이블(CourseInstructor)을 통해 진짜 강사 객체들을 뽑아옵니다.
        # obj.course_instructors.all() 은 현재 강좌와 매핑된 "연결 객체 배열" 입니다.
        instructor_objects = [mapping.instructor for mapping in obj.course_instructors.all()]
        return InstructorSerializer(instructor_objects, many=True).data

