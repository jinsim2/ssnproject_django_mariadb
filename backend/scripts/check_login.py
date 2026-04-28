import urllib.request
import json

url = "http://127.0.0.1:8000/api/accounts/login/"
data = {
    "login_id": "testuser",
    "password": "Testuser123!"
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print("Login Success:", response.read().decode('utf-8'))
except Exception as e:
    print("Login Failed:", e)
