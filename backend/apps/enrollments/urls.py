from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet, EnrollmentViewSet

# 라우터 객체 생성
router = DefaultRouter()

# 라우터에 우리가 만든 뷰셋들을 꽂아줍니다!
router.register(r'carts', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'list', EnrollmentViewSet, basename='enrollment') # /api/enrollments/list/ 로 매핑

urlpatterns = [
    # 라우터가 자동 생성한 URL들을 깔끔하게 포함시킵니다.
    path('', include(router.urls)),
]
