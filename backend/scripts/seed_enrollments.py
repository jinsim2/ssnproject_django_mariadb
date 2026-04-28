import os
import sys
import django
from datetime import date, timedelta

# Django 환경 설정 (당해 스크립트가 실행될 때 backend 폴더를 시스템 경로에 임시로 추가)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 장고 엔진 시동 🚀
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course
from institutions.models import Institution
from enrollments.models import Enrollment

User = get_user_model()

def seed_enrollments():
    print("[Info] 가상 수강신청 데이터(5개) 파종을 시작합니다...")

    # 1. 테스트용 학습자(유저) 획득 또는 생성
    user, created = User.objects.get_or_create(
        login_id='testuser', 
        defaults={
            'full_name': '김테스트',
            'email': 'test@ssn.com',
            'phone': '010-1234-5678',
            'user_type': 'general',
            'is_active': True,
        }
    )
    if created:
        user.set_password('password123!')
        user.save()
        print(f"[Success] 테스트 유저 '{user.full_name}' 님이 안전하게 생성되었습니다.")

    # 2. 테스트용 강좌 2개 생성 (온라인 / 오프라인 각각 1개)
    institution, _ = Institution.objects.get_or_create(
        institution_name="[테스트] SSN 관리공단",
        defaults={'registration_number': '123-45-67890'}
    )

    course_online, _ = Course.objects.get_or_create(
        course_code='CRS-D01',
        defaults={
            'course_name': '[2026] 직장인 필수 법정의무교육',
            'course_type': 'online',
            'price': 50000,
            'institution': institution,
            'course_status': 'published',
            'created_by': user,
        }
    )

    course_offline, _ = Course.objects.get_or_create(
        course_code='CRS-D02',
        defaults={
            'course_name': '[VOD] 신입사원 온보딩 패키지 (단체)',
            'course_type': 'offline',
            'price': 150000,
            'institution': institution,
            'course_status': 'published',
            'created_by': user,
        }
    )

    # 3. 데이터 중복 방지를 위해 기존 테스트 신청 내역은 깔끔하게 지워줍니다.
    Enrollment.objects.filter(user=user).delete()

    # 4. 5개의 다양한 상태를 가진 수강신청 상황극 연출
    dummy_data = [
        # 개별 신청 건
        {'course': course_online, 'type': 'individual', 'status': 'approved', 'completed': True, 'days_ago': 30},
        {'course': course_online, 'type': 'individual', 'status': 'pending', 'completed': False, 'days_ago': 1},
        {'course': course_offline, 'type': 'individual', 'status': 'cancelled', 'completed': False, 'days_ago': 10},
        
        # 단체 신청 건 (장바구니 거쳐서 들어옴)
        {'course': course_offline, 'type': 'group', 'status': 'approved', 'completed': False, 'days_ago': 5},
        {'course': course_offline, 'type': 'group', 'status': 'waiting', 'completed': False, 'days_ago': 0},
    ]

    for data in dummy_data:
        # DB에 입력 (Enrollment 테이블)
        e = Enrollment.objects.create(
            user=user,
            course=data['course'],
            enrollment_type=data['type'],
            enrollment_status=data['status'],
            is_completed=data['completed']
        )
        # 날짜가 모두 오늘로 찍히면 재미없으니 과거로 약간씩 시간을 돌립니다.
        past_date = date.today() - timedelta(days=data['days_ago'])
        Enrollment.objects.filter(pk=e.pk).update(enrollment_date=past_date)

    print("========================================")
    print("[Success] 통신 성공! 가상 데이터 5건이 데이터베이스에 예쁘게 심어졌습니다!")
    print("========================================")

if __name__ == '__main__':
    seed_enrollments()
