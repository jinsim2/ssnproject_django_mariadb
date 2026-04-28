from rest_framework import permissions

class IsCourseAdminOrReadOnly(permissions.BasePermission):
    """
    안전보장 로직:
    1. 조회(GET)는 누구나 언제든 환영.
    2. 강좌 개설/수정/삭제(POST/PUT/DELETE)는 오직 관리자만.
    3. 특정 강좌를 건드릴 때는 반드시 '내 기관 소속' 강좌여야만 함.
    """
    
    def has_permission(self, request, view):
        # 1. 목록 화면 조회(GET)는 누구나 편의점처럼 들어올 수 있습니다.
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # 2. 쓰기 요청(POST 등)은 무조건 로그인이 되어있어야 합니다.
        if not request.user or not request.user.is_authenticated:
            return False
            
        # 3. 마스터(최고 관리자)는 프리패스!
        if request.user.is_superuser:
            return True
            
        # 4. 일반 B2B 기관 관리자(admin_profile 소유자)인지 확인!
        return hasattr(request.user, 'admin_profile')

    def has_object_permission(self, request, view, obj):
        # 1. 특정 강좌 내용 상세 조회(GET)는 누구나 가능.
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if request.user.is_superuser:
            return True
            
        # 2. 수정/삭제(PUT/DELETE)의 경우: 관리자 프로필을 가져옵니다.
        admin_profile = getattr(request.user, 'admin_profile', None)
        if not admin_profile:
            return False
            
        # 3. [가장 중요] 당신이 수정하려는 이 강좌가, 당신 소속 기관의 강좌가 맞는가?
        return obj.institution_id == admin_profile.institution_id
