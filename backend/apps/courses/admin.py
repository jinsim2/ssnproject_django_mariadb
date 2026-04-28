from django.contrib import admin
from .models import Course

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_code', 'course_name', 'course_type', 'category', 'course_status')
    list_filter = ('course_type', 'category', 'course_status')
    search_fields = ('course_code', 'course_name')
