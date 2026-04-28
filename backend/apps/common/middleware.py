from django.utils.timezone import now
from rest_framework_simplejwt.authentication import JWTAuthentication

class ActiveUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 헤더에 Authorization (Bearer 토큰)이 있는 경우만 검문
        if 'HTTP_AUTHORIZATION' in request.META:
            try:
                # 1. JWT 토큰을 해석하여 현재 유저가 누구인지 파악합니다.
                jwt_auth = JWTAuthentication()
                auth_tuple = jwt_auth.authenticate(request)
                
                if auth_tuple is not None:
                    user, token = auth_tuple
                    
                    # 2. 성능 최적화: 매번 DB를 수정하면 느려질 수 있으므로, 
                    # 마지막으로 갱신한 지 1분(60초)이 지났을 때만 새로 갱신합니다.
                    if not user.last_activity or (now() - user.last_activity).total_seconds() > 60:
                        user.last_activity = now()
                        # update_fields를 쓰면 last_activity 컬럼만 가볍게 딱 덮어씌웁니다.
                        user.save(update_fields=['last_activity'])
            except Exception:
                # 토큰이 만료되었거나 잘못된 경우 조용히 넘어갑니다.
                pass
                
        # 3. 데이터베이스 갱신 후, 원래 가려던 길(화면/API)로 마저 보냅니다.
        response = self.get_response(request)
        return response
