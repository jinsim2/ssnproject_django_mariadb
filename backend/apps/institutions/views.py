from rest_framework import viewsets
from .models import Institution, Employee, InstitutionApplication
from .serializers import InstitutionSerializer, EmployeeSerializer, InstitutionApplicationSerializer
from .permissions import IsInstitutionManager

class InstitutionViewSet(viewsets.ModelViewSet):
    """
    [GET, POST, PUT, DELETE] 모두 지원하는 마법의 기관 API 뷰
    """
    queryset = Institution.objects.all().order_by('-created_at')
    serializer_class = InstitutionSerializer
    # 든든하게 권한 검문소를 장착!
    permission_classes = [IsInstitutionManager]

    def get_queryset(self):
        # 목록을 뿌려줄 때, 자기가 볼 수 있는 데이터만 필터링합니다. (PHP의 복잡한 WHERE절 대체)
        user = self.request.user
        if user.admin_profiles.filter(admin_type='super_admin', is_active=True).exists():
            return super().get_queryset()  # 최고 관리자는 전부 출력
            
        # 일반 관리자는 자기가 담당하는 기관 소속 데이터만 출력
        allowed_institutions = user.admin_profiles.filter(is_active=True).values_list('institution_id', flat=True)
        return super().get_queryset().filter(institution_id__in=allowed_institutions)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    소속 직원(Employee) 전용 API 뷰
    """
    # select_related를 써주면 가벼운 쿼리 1방으로 외래키 연관 정보까지 성능 좋게 가져옵니다. (Query N+1 문제 해결)
    queryset = Employee.objects.all().select_related('user', 'institution').order_by('-created_at')
    serializer_class = EmployeeSerializer
    permission_classes = [IsInstitutionManager]

    def get_queryset(self):
        user = self.request.user
        if user.admin_profiles.filter(admin_type='super_admin', is_active=True).exists():
            return super().get_queryset()
            
        allowed_institutions = user.admin_profiles.filter(is_active=True).values_list('institution_id', flat=True)
        return super().get_queryset().filter(institution_id__in=allowed_institutions)


class InstitutionApplicationViewSet(viewsets.ModelViewSet):
    """
    기관 가입 신청(Application) 전용 API 뷰
    """
    queryset = InstitutionApplication.objects.all().select_related('user').order_by('-created_at')
    serializer_class = InstitutionApplicationSerializer
    permission_classes = [IsInstitutionManager]
