from rest_framework import permissions

class IsInstitutionManager(permissions.BasePermission):
    """
    🏢 기관 관리자 전용 권한 검문소
    - 원칙 1: 최고 관리자('super_admin')는 프리패스 (모든 기관 열람/수정 가능)
    - 원칙 2: 일반 기관 관리자('upper', 'lower')는 오직 자신이 소속된 기관의 데이터만 만질 수 있음!
    """

    def has_permission(self, request, view):
        # 1차 검문: 일단 로그인 한 상태여야 하고, '활성화된 관리자 단말기(Profile)'가 최소 1개 이상 존재해야만 이 구역을 통과함.
        if not request.user or not request.user.is_authenticated:
            return False
            
        return request.user.admin_profiles.filter(is_active=True).exists()

    def has_object_permission(self, request, view, obj):
        # 2차 검문: 리스트가 아니라 특정 1개의 데이터(예: A기관 직원 명세서)를 콕 집어서 보거나 수정하려 할 때 발동!

        # 1. 묻지도 따지지도 않고 열어주는 프리패스 (최고 관리자)
        if request.user.admin_profiles.filter(admin_type='super_admin', is_active=True).exists():
            return True
            
        # 2. 이 데이터(obj)가 도대체 어느 기관(id) 소속인지 파악하기
        if hasattr(obj, 'institution_id'): 
            # obj가 Institution(기관) 객체 본인일 경우
            target_institution_id = obj.institution_id
        elif hasattr(obj, 'institution'):
            # obj가 Employee(직원) 등 기관 아래에 매달린 객체일 경우
            target_institution_id = obj.institution_id
        else:
            # 기관과 전혀 상관없는 데이터를 건드리려고 하면 무조건 차단
            return False 
            
        # 3. 최종 심사: 내 주머니(admin_profiles) 속에 있는 기관 신분증(institution_id)과 
        #    지금 만지려는 데이터의 소속 기관 번호가 똑같은지 비교!
        return request.user.admin_profiles.filter(is_active=True, institution_id=target_institution_id).exists()
