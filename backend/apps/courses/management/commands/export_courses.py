import csv
from django.core.management.base import BaseCommand
from courses.models import Course

class Command(BaseCommand):
    help = '현재 데이터베이스의 과정(Course) 목록을 CSV 파일로 추출합니다.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='저장할 CSV 파일의 경로 및 이름 (예: export.csv)')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        
        # 내보낼 필드명 정의 (리스트)
        fieldnames = [
            'course_code', 'course_name', 'course_type', 'category', 'sub_category',
            'description', 'thumbnail_image', 'course_status'
        ]

        try:
            courses = Course.objects.all()
            
            with open(csv_file_path, mode='w', encoding='utf-8-sig', newline='') as file:
                writer = csv.DictWriter(file, fieldnames=fieldnames)
                
                # 헤더(첫 줄) 쓰기
                writer.writeheader()
                
                count = 0
                for course in courses:
                    writer.writerow({
                        'course_code': course.course_code,
                        'course_name': course.course_name,
                        'course_type': course.course_type,
                        'category': course.category,
                        'sub_category': course.sub_category if course.sub_category else '',
                        'description': course.description if course.description else '',
                        'thumbnail_image': course.thumbnail_image if course.thumbnail_image else '',
                        'course_status': course.course_status
                    })
                    count += 1
                    
            self.stdout.write(self.style.SUCCESS(f"총 {count}건의 과정 데이터 추출 완료! (저장경로: {csv_file_path})"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"오류가 발생했습니다: {str(e)}"))
