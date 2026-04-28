from django.core.management.base import BaseCommand
from accounts.models import User, Administrator

class Command(BaseCommand):
    help = '특정 유저를 최고 관리자로 승격시킵니다.'

    # 인자값 정의
    def add_arguments(self, parser):
        parser.add_argument('login_id', type=str, help='승격시킬 유저의 로그인 ID')

    # 실제 실행될 로직
    def handle(self, *args, **kwargs):
        login_id = kwargs['login_id'] # 전달받은 인자값

        try:
            my_user = User.objects.get(login_id=login_id)
            
            admin_obj, created = Administrator.objects.get_or_create(
                user=my_user,
                defaults={
                    'institution_id': 1, 
                    'admin_type': 'super_admin', 
                    'is_active': True
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"성공: '{login_id}' 계정이 최고 관리자로 승격되었습니다."))
            else:
                self.stdout.write(self.style.WARNING(f"알림: '{login_id}' 계정은 이미 관리자로 등록되어 있습니다."))

        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"오류: '{login_id}' 아이디를 가진 유저를 찾을 수 없습니다."))