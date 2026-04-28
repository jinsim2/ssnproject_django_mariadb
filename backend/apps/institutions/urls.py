from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstitutionViewSet, EmployeeViewSet, InstitutionApplicationViewSet

router = DefaultRouter()
# /api/institutions/list/ 와 같은 지저분한 주소를 장고 내부 통신 체계가 알아서 예쁘게 만들어줍니다.
router.register(r'institutions', InstitutionViewSet, basename='institution')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'applications', InstitutionApplicationViewSet, basename='application')

urlpatterns = [
    # 라우터가 계산명세서대로 만든 수십 개의 URL 규칙들을 한 번에 싹 밀어넣습니다.
    path('', include(router.urls)),
]
