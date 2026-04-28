from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Institution, UserInstitution, Employee, InstitutionApplication

User = get_user_model()

# ---------------------------------------------------------
# 1. 가벼운 유저 정보 시리얼라이저 (Nested 활용 용도)
# ---------------------------------------------------------
class SimpleUserSerializer(serializers.ModelSerializer):
    """
    직원이나 기관 가입 신청자 정보를 넘겨줄 때,
    해당 유저의 모든 정보(비밀번호 등)를 넘기면 보안에 매우 취약합니다.
    따라서 이름, 이메일 등 필요한 최소한의 정보만 뽑아서 넘겨주는 깔끔한 시리얼라이저입니다.
    """
    class Meta:
        model = User
        fields = ['id', 'login_id', 'full_name', 'email', 'phone']


# ---------------------------------------------------------
# 2. 기관(Institution) 시리얼라이저
# ---------------------------------------------------------
class InstitutionSerializer(serializers.ModelSerializer):
    # Enum(간단한 영문 코드)으로 저장된 타입과 상태를 프론트 화면에 그리기 쉽도록
    # 자동으로 한글 텍스트('중앙', '활성' 등)로 변환해 주는 커스텀 필드를 추가합니다.
    institution_type_display = serializers.CharField(source='get_institution_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Institution
        fields = '__all__'
        # 클라이언트가 함부로 수정하면 안 되는 필드들 강력 보호
        read_only_fields = ['institution_id', 'created_at', 'updated_at', 'employee_count']


# ---------------------------------------------------------
# 3. 직원(Employee) 시리얼라이저
# ---------------------------------------------------------
class EmployeeSerializer(serializers.ModelSerializer):
    # 프론트엔드에서 React로 직원을 보여줄 때 "유저 이름"이나 "소속 기관 이름"을 알아야 하므로
    # 위에서 만든 시리얼라이저들을 가져와서 통째로 끼워 넣습니다. (객체 중첩 - Nested)
    user_info = SimpleUserSerializer(source='user', read_only=True)
    institution_info = InstitutionSerializer(source='institution', read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['employee_id', 'created_at', 'updated_at']


# ---------------------------------------------------------
# 4. 회원-기관 다대다 맵핑(UserInstitution) 시리얼라이저
# ---------------------------------------------------------
class UserInstitutionSerializer(serializers.ModelSerializer):
    user_info = SimpleUserSerializer(source='user', read_only=True)
    institution_info = InstitutionSerializer(source='institution', read_only=True)

    class Meta:
        model = UserInstitution
        fields = '__all__'
        read_only_fields = ['user_institution_id', 'created_at']


# ---------------------------------------------------------
# 5. 기관 가입/등록 신청서(InstitutionApplication) 시리얼라이저
# ---------------------------------------------------------
class InstitutionApplicationSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    institution_type_display = serializers.CharField(source='get_institution_type_display', read_only=True)
    user_info = SimpleUserSerializer(source='user', read_only=True)

    class Meta:
        model = InstitutionApplication
        fields = '__all__'
        read_only_fields = ['application_id', 'created_at', 'updated_at', 'processed_at', 'processed_by']
