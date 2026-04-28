import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

tables_to_drop = [
    'django_admin_log',
    'auth_group_permissions',
    'auth_user_user_permissions',
    'auth_user_groups',
    'auth_permission',
    'auth_group',
    'auth_user',
    'django_content_type',
    'django_session',
    'django_migrations',
]

print("Dropping initial django tables to resolve AUTH_USER_MODEL conflict...")
with connection.cursor() as cursor:
    for table in tables_to_drop:
        try:
            # Oracle 문법: CASCADE CONSTRAINTS을 통해 외래 키 무시하고 드롭
            cursor.execute(f"DROP TABLE {table} CASCADE CONSTRAINTS")
            print(f"Dropped {table}")
        except Exception as e:
            # 테이블이 존재하지 않으면 패스
            pass

print("Cleanup complete.")
