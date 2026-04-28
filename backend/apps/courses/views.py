from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Course, Instructor
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, InstructorSerializer
)
from .permissions import IsCourseAdminOrReadOnly

class CourseViewSet(viewsets.ModelViewSet):
    """
    [강좌 관리 메인 API]
    - GET /api/courses/courses/ : 전체 강좌 목록 조회 (가벼운 시리얼라이저)
    - GET /api/courses/courses/{id}/ : 상세 조회 (목차, 기수, 강사가 묶인 거대한 JSON 우주선 반환!)
    - POST /api/courses/courses/ : 신규 강좌 개설 (관리자 전용)
    """
    # 💥 프론트엔드 폭파 방지(N+1 Query 억제): 외래키 객체를 미리 조인해서 꺼내둠!
    queryset = Course.objects.all().select_related('institution', 'created_by')
    permission_classes = [IsCourseAdminOrReadOnly]
    
    # 강력한 검색 및 필터링 기능 기본 장착
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'course_status', 'course_type']
    search_fields = ['course_name', 'course_code', 'target_audience']
    ordering_fields = ['created_at', 'price']
    
    def get_serializer_class(self):
        # 사용자의 요청이 '단건 상세 조회(retrieve)'라면? 무거운 우주선 시리얼라이저 발동!
        if self.action == 'retrieve':
            return CourseDetailSerializer
        # 전체 리스트 조회라면? 가볍고 빠른 목록 시리얼라이저 발동!
        return CourseListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        # 과거 프론트엔드의 ?category=직무교육 파라미터 검색 로직 완벽 보존
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        return queryset

class InstructorViewSet(viewsets.ModelViewSet):
    """
    [강사 관리 메인 API]
    - 강사진 목록과 정보를 조회하고 추가/수정합니다.
    """
    queryset = Instructor.objects.all().select_related('user', 'institution')
    serializer_class = InstructorSerializer
    permission_classes = [IsCourseAdminOrReadOnly]
