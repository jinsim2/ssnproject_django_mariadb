from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def connect(request):
    return Response({"message": "서버 연결 성공!"})
