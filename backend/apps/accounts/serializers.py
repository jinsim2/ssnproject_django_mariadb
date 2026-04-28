from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Administrator

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    FastAPI의 Pydantic Schema에 해당하는 Django REST Framework의 Serializer입니다.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    # 접속 IP를 계산해서 내보내기 위한 커스텀 필드
    current_ip = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'login_id', 'password', 'full_name', 'email', 'phone', 'address', 'user_type',
            'is_verified', 'ci', 'is_under_14', 'guardian_consent', 'guardian_name',
            'guardian_phone', 'guardian_relationship', 'created_at', 'updated_at',
            'last_login', 'is_active', 'birthdate', 'gender', 'company_name',
            'department', 'position', 'biz_reg_no', 'company_phone', 'company_email',
            'company_zipcode', 'company_address', 'serial_no', 'affiliation_council',
            'care_bank_inst', 'is_superuser', 'is_admin', 'current_ip'
        ]
        # 클라이언트에서 임의로 수정할 수 없는(Read Only) 필드들을 선언합니다.
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login', 'is_active']

    def get_is_admin(self, obj) -> bool:
        # 로그인한 사용자가 활성화된 관리자 권한(Administrator 테이블)을 가지고 있는지 확인
        return obj.admin_profiles.filter(is_active=True).exists()

    # current_ip 필드의 값을 만들어내는 함수
    def get_current_ip(self, obj) -> str:
        request = self.context.get('request')
        if request:
            # HTTP_X_FORWARDED_FOR는 프록시나 로드밸런서를 거친 클라이언트의 실제 IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                # 여러 IP가 콤마로 구분되어 있을 경우, 첫 번째 IP를 실제 클라이언트 IP로 간주
                return x_forwarded_for.split(',')[0].strip()
            else:
                # 로컬(127.0.0.1)이나 프록시가 없을 때의 IP
                ip = request.META.get('REMOTE_ADDR') 
            # 그 외의 경우(로컬 개발 등)에는 REMOTE_ADDR 사용
            return ip
        return 'Unknown(알 수 없음)'

    def create(self, validated_data):
        # UserManager의 create_user를 호출하여 패스워드 암호화 후 생성
        user = User.objects.create_user(**validated_data)
        return user

class AdministratorSerializer(serializers.ModelSerializer):
    # 💡 꿀팁 1: 'super_admin' 대신 '최고 관리자' 같은 한글 명칭을 프론트로 같이 보내주면 화면에 뿌리기 편합니다.
    admin_type_display = serializers.CharField(source='get_admin_type_display', read_only=True)
    
    # 💡 꿀팁 2: ForeignKey로 연결된 User 테이블의 이름과 아이디도 같이 꺼내서 보내주면(Nested) 프론트엔드가 API를 두 번 호출할 필요가 없습니다.
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_login_id = serializers.CharField(source='user.login_id', read_only=True)
    class Meta:
        model = Administrator
        fields = [
            'admin_id',
            'user',              # users 테이블의 PK 값 (id)
            'user_name',         # user 테이블에서 가져온 이름
            'user_login_id',     # user 테이블에서 가져온 로그인 ID
            'institution_id',
            'admin_type',
            'admin_type_display',
            'permissions',
            'is_active',
            'allowed_ips',
            'created_at',
            'updated_at'
        ]
        # 프론트엔드에서 수정하면 안 되는 '읽기 전용' 필드들 보호
        read_only_fields = ['admin_id', 'created_at', 'updated_at']