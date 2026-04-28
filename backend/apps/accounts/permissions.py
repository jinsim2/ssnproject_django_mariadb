from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    일반 회원이 아닌, 현재 활성화된 관리자(Administrator) 정보가 있는 유저만 접근을 허용하는 권한 검문소 코드입니다.
    FastAPI의 get_current_admin (Dependency) 역할을 완벽히 대체합니다!
    """

    # 권한이 없을 때(403 Forbidden) 프론트엔드로 내려갈 기본 에러 메시지
    message = "관리자 권한이 없습니다. 관리자에게 승인 문의를 진행해 주세요."

    def has_permission(self, request, view):
        # 1. 1차 관문: 로그인이 아예 안 되어있으면 차단 (인증 실패)
        if not bool(request.user and request.user.is_authenticated):
            return False
            
        # 2. 2차 관문: 로그인한 유저에게 '활성화(is_active=True)된 Administrator' 데이터가 있는지 검사
        # 아까 models.py에서 related_name='admin_profiles' 로 연결해두었기 때문에 매우 코드가 짧아집니다.
        has_admin_profile = request.user.admin_profiles.filter(is_active=True).exists()
        
        # 관리자 데이터가 발견되면 True(통과), 일반 유저거나 비활성화 상태면 False(차단)
        return has_admin_profile
