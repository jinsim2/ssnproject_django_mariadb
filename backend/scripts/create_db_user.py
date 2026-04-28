import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    try:
        # 기존 계정이 있다면 무시하도록 예외처리할 수도 있지만, 우선 단순 생성 시도합니다.
        try:
            cursor.execute("CREATE USER ssn_user IDENTIFIED BY ssn_password")
            cursor.execute("GRANT CONNECT, RESOURCE, DBA TO ssn_user")
            print("✅ 오라클 새 계정(ssn_user / ssn_password)이 성공적으로 생성되었습니다!")
            with open("new_db_user.txt", "w") as f:
                f.write("ssn_user")
        except Exception as e:
            error_msg = str(e)
            if "ORA-65096" in error_msg:  # Oracle 12c 이상의 공통 사용자 접두사 에러 시 대응
                cursor.execute("CREATE USER c##ssn_user IDENTIFIED BY ssn_password")
                cursor.execute("GRANT CONNECT, RESOURCE, DBA TO c##ssn_user")
                print("✅ 오라클 새 계정(c##ssn_user / ssn_password)이 공통사용자로 생성되었습니다!")
                with open("new_db_user.txt", "w") as f:
                    f.write("c##ssn_user")
            elif "ORA-01920" in error_msg: # 이미 존재하는 사용자명일 경우
                print("✅ 계정이 이미 존재합니다. 바로 해당 계정으로 권한만 추가 부여합니다.")
                cursor.execute("GRANT CONNECT, RESOURCE, DBA TO ssn_user")
                with open("new_db_user.txt", "w") as f:
                    f.write("ssn_user")
            else:
                raise e
    except Exception as exc:
        print("❌ 계정 생성 에러 발생:", exc)