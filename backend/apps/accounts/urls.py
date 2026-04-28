from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, RetrieveUserView, check_id, check_email, verify_identity, get_concurrent_users, AdminTokenObtainPairView

urlpatterns = [
    # 회원가입 및 내 정보
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', RetrieveUserView.as_view(), name='user_me'),

    # 동시 접속자 수 확인
    path('concurrent-users/', get_concurrent_users, name='concurrent_users'),
    
    # 아이디/이메일 중복확인
    path('check-id/', check_id, name='check_id'),
    path('check-email/', check_email, name='check_email'),
    
    # 본인인증 (포트원) 정보 조회
    path('verify-identity/', verify_identity, name='verify_identity'),
    
    # JWT 로그인 및 토큰 재발급 (FastAPI OAuth2PasswordBearer 토큰 발급에 대응)
    # --- 기본 일반유저 API ---
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # --- 관리자(Admin) 전용 API ---
    path('admin/login/', AdminTokenObtainPairView.as_view(), name='admin_token_obtain_pair'),
    path('admin/token/refresh/', TokenRefreshView.as_view(), name='admin_token_refresh'),
]
