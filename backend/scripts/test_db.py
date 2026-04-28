import urllib.request
import json
import urllib.error

url = "http://127.0.0.1:8000/api/accounts/login/"
data = {
    "login_id": "testuser",
    "password": "Testuser123!"
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        with open("login_result.txt", "w", encoding="utf-8") as f:
            f.write("Status 200: " + response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    with open("login_result.txt", "w", encoding="utf-8") as f:
        f.write("Status " + str(e.code) + ": " + e.read().decode('utf-8'))
except Exception as ex:
    with open("login_result.txt", "w", encoding="utf-8") as f:
        f.write("Exception: " + str(ex))
