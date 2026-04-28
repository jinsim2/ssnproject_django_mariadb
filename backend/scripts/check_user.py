import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

exists = User.objects.filter(login_id='testuser').exists()
with open('result.txt', 'w') as f:
    f.write(f'testuser exists: {exists}\n')

if exists:
    user = User.objects.get(login_id='testuser')
    with open('result.txt', 'a') as f:
        f.write(f'user.check_password("Testuser123!"): {user.check_password("Testuser123!")}\n')
        f.write(f'user.is_active: {user.is_active}\n')

