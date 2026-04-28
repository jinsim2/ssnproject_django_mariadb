import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, CourseSession

courses = Course.objects.all()
for c in courses:
    # 1강: W3Schools 표준 토끼 애니메이션
    CourseSession.objects.update_or_create(
        course=c,
        session_number=1,
        defaults={
            'session_name': '1강. 무료 오픈소스 샘플 영상 (토끼)',
            'video_url': 'https://www.w3schools.com/html/mov_bbb.mp4',
            'duration_minutes': 10
        }
    )
    # 2강: MDN Web Docs 표준 꽃 영상
    CourseSession.objects.update_or_create(
        course=c,
        session_number=2,
        defaults={
            'session_name': '2강. 심화 학습 영상 (꽃)',
            'video_url': 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            'duration_minutes': 15
        }
    )

print("✅ 모든 강좌에 테스트용 영상 차시(Session) 2개씩이 주입(또는 업데이트) 되었습니다!")
