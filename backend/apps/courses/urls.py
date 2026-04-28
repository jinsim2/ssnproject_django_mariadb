from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, InstructorViewSet

# DefaultRouter가 GET/POST/PUT/DELETE 에 해당하는 URL 경로들을 알아서 무한 복사해줍니다.
router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'instructors', InstructorViewSet, basename='instructor')

urlpatterns = [
    # 라우터가 만들어낸 수십 개의 URL 경로들을 프로젝트에 꽂아 넣습니다.
    path('', include(router.urls)),
]
