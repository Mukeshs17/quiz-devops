import os
import sys
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

APP_VERSION = os.environ.get("APP_VERSION", "v1.0.0")
START_TIME = time.time()

# SRE in-memory telemetry counters
METRICS = {
    "requests": 0,
    "errors": 0,
    "submissions": 0,
    "total_response_time_ms": 0.0
}

QUESTIONS = [
    {"id": 1, "question": "Which tool is primarily used for Containerization?", "options": ["Docker", "Git", "Jenkins", "Terraform"]},
    {"id": 2, "question": "Which tool is widely used for Container Orchestration?", "options": ["Ansible", "Kubernetes", "Nagios", "Swarm"]},
    {"id": 3, "question": "Which command saves Git changes locally?", "options": ["git push", "git commit", "git pull", "git checkout"]},
    {"id": 4, "question": "Which tool handles Continuous Integration (CI)?", "options": ["Jenkins", "Docker", "Prometheus", "Grafana"]},
    {"id": 5, "question": "What format is typically used for Docker orchestration?", "options": ["YAML", "XML", "JSON", "INI"]},
    {"id": 6, "question": "Which cloud registry stores Docker images?", "options": ["GHCR", "NPM", "PyPI", "Maven"]},
    {"id": 7, "question": "What is the standard Linux command to check working directory?", "options": ["pwd", "ls", "cd", "top"]},
    {"id": 8, "question": "Which HTTP status code signifies a healthy endpoint?", "options": ["200", "404", "500", "503"]}
]

ANSWERS = {1: 0, 2: 1, 3: 1, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0}

class QuizHandler(BaseHTTPRequestHandler):
    def log_json(self, status, duration_ms, severity="INFO"):
        log_entry = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "path": self.path,
            "status": status,
            "duration_ms": round(duration_ms, 2),
            "severity": severity,
            "version": APP_VERSION
        }
        print(json.dumps(log_entry), flush=True)

    def do_GET(self):
        start = time.time()
        METRICS["requests"] += 1

        if self.path == "/healthz":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            uptime = int(time.time() - START_TIME)
            payload = json.dumps({"status": "ok", "version": APP_VERSION, "uptime_seconds": uptime})
            self.wfile.write(payload.encode())
            duration = (time.time() - start) * 1000
            METRICS["total_response_time_ms"] += duration
            self.log_json(200, duration)

        elif self.path == "/metrics":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            payload = json.dumps(METRICS)
            self.wfile.write(payload.encode())
            duration = (time.time() - start) * 1000
            METRICS["total_response_time_ms"] += duration
            self.log_json(200, duration)

        elif self.path == "/fail":
            METRICS["errors"] += 1
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Simulated deliberate server error"}).encode())
            duration = (time.time() - start) * 1000
            METRICS["total_response_time_ms"] += duration
            self.log_json(500, duration, severity="ERROR")

        elif self.path == "/api/questions":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(QUESTIONS).encode())
            duration = (time.time() - start) * 1000
            METRICS["total_response_time_ms"] += duration
            self.log_json(200, duration)

        elif self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            html = f"""<!DOCTYPE html>
<html>
<head><title>DevOps Online Quiz</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 40px auto; background: #0f172a; color: #fff;">
  <h2>DevOps Online Quiz Application</h2>
  <p>Version: <span style="color: #38bdf8;">{APP_VERSION}</span></p>
  <p>Status: All systems operational</p>
</body>
</html>"""
            self.wfile.write(html.encode())
            duration = (time.time() - start) * 1000
            METRICS["total_response_time_ms"] += duration
            self.log_json(200, duration)

        else:
            self.send_response(404)
            self.end_headers()
            duration = (time.time() - start) * 1000
            self.log_json(404, duration, severity="WARN")

    def do_POST(self):
        start = time.time()
        METRICS["requests"] += 1

        if self.path == "/api/submit":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode())
                user_answers = data.get("answers", {})
                score = sum(1 for q_id, opt in user_answers.items() if ANSWERS.get(int(q_id)) == opt)
                METRICS["submissions"] += 1
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"score": score, "total": len(QUESTIONS)}).encode())
                duration = (time.time() - start) * 1000
                METRICS["total_response_time_ms"] += duration
                self.log_json(200, duration)
            except Exception:
                METRICS["errors"] += 1
                self.send_response(400)
                self.end_headers()
                duration = (time.time() - start) * 1000
                self.log_json(400, duration, severity="ERROR")
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=None):
    if port is None:
        port = int(os.environ.get("PORT", 8080))
    server = HTTPServer(("0.0.0.0", port), QuizHandler)
    print(f"Quiz Server started on port {port} (Version: {APP_VERSION})", flush=True)
    server.serve_forever()

if __name__ == "__main__":
    run_server()
