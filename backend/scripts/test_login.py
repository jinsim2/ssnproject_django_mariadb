import urllib.request
import json
import urllib.error

url = 'http://127.0.0.1:8000/api/accounts/login/'
data = {
    "login_id": "testuser",
    "password": "Testuser123!"
}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
req.add_header('Content-Type', 'application/json')

try:
    response = urllib.request.urlopen(req)
    print("STATUS:", response.status)
    print("BODY:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("ERROR STATUS:", e.code)
    print("ERROR BODY:", e.read().decode('utf-8'))
except Exception as ex:
    print("FATAL ERROR:", ex)
