import csv
from django.core.management.base import BaseCommand
from courses.models import Course

class Command(BaseCommand):
    help = 'CSV 파일로부터 과정(Course) 데이터를 데이터베이스에 일괄 등록/업데이트 합니다.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='가져올 CSV 파일의 경로 (예: data.csv)')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']

        try:
            with open(csv_file_path, mode='r', encoding='utf-8-sig') as file:
                reader = csv.DictReader(file)
                created_count = 0
                updated_count = 0

                for row in reader:
                    # 필수 데이터 추출 (빈 문자열 처리)
                    course_code = row.get('course_code', '').strip()
                    if not course_code:
                        self.stdout.write(self.style.WARNING("course_code가 없는 행은 건너뜁니다."))
                        continue

                    # update_or_create: course_code를 기준으로 찾고, 없으면 생성, 있으면 딕셔너리 값으로 업데이트
                    obj, created = Course.objects.update_or_create(
                        course_code=course_code,
                        defaults={
                            'course_name': row.get('course_name', ''),
                            'course_type': row.get('course_type', 'online'),
                            'category': row.get('category', ''),
                            'sub_category': row.get('sub_category', ''),
                            'description': row.get('description', ''),
                            'thumbnail_image': row.get('thumbnail_image', ''),
                            'course_status': row.get('course_status', 'published')
                        }
                    )

                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

                self.stdout.write(self.style.SUCCESS(
                    f"데이터 등록 완료! (신규 생성: {created_count}건, 업데이트: {updated_count}건)"
                ))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"파일을 찾을 수 없습니다: {csv_file_path}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"오류가 발생했습니다: {str(e)}"))
