"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # OpenAPI 3.0 스키마 생성 (JSON/YAML)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # Swagger UI 프론트엔드 (FastAPI의 /docs 처럼 동작)
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # Redoc UI 프론트엔드 (FastAPI의 /redoc 처럼 동작)
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # 커스텀 API 라우터 (FastAPI의 API Router Include 역할)
    path('connect/', include('common.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),

    path('api/institutions/', include('institutions.urls')),

    # 새 커머스/수강 엔진으로 가는 진입로 개통!
    path('api/enrollments/', include('enrollments.urls')),

]

# 개발 모드(DEBUG=True)일 때만 장고 서버가 정적/미디어 파일을 서빙하도록 처리
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

