"""
Online Quiz App - tiny web app for a DevOps mini project.
Uses ONLY the Python standard library (no pip install needed).

Pages / APIs
  GET  /               -> quiz web page
  GET  /api/questions  -> questions (without answers)
  POST /api/submit     -> send answers, get score
  GET  /healthz        -> health check (used by monitoring)
  GET  /metrics        -> simple counters (requests, errors, latency)
  GET  /fail           -> makes a fake error on purpose (to test alerts)
"""
import json
import os
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

APP_VERSION = os.environ.get("APP_VERSION", "v1")
START_TIME = time.time()

QUESTIONS = [
    {"q": "What does CI stand for?",
     "options": ["Code Insurance", "Continuous Integration", "Cloud Internet", "Compile Instantly"], "answer": 1},
    {"q": "Which tool puts an app inside a container?",
     "options": ["Docker", "Excel", "Paint", "Notepad"], "answer": 0},
    {"q": "Which service stores code history and teamwork?",
     "options": ["Git and GitHub", "Calculator", "Camera", "Clock"], "answer": 0},
    {"q": "What does a health check tell us?",
     "options": ["The weather", "If the app is alive", "The price of food", "The time"], "answer": 1},
    {"q": "What does 'rollback' mean?",
     "options": ["Delete the internet", "Go back to the older working version", "Make the screen bigger", "Turn off the laptop"], "answer": 1},
    {"q": "Which Google Cloud service runs containers without managing servers?",
     "options": ["Cloud Run", "Google Maps", "Gmail", "YouTube"], "answer": 0},
    {"q": "What does CD usually mean in CI/CD?",
     "options": ["Compact Disc", "Continuous Delivery or Deployment", "Computer Desk", "Code Doctor"], "answer": 1},
    {"q": "Monitoring helps us to...",
     "options": ["Watch the app and find problems early", "Draw pictures", "Play music", "Print paper"], "answer": 0},
]

# ---------- very small metrics store ----------
_lock = threading.Lock()
METRICS = {"requests_total": 0, "errors_total": 0, "submissions_total": 0, "latency_sum_seconds": 0.0}


def log(severity, message, **extra):
    """JSON logs: Google Cloud Logging understands 'severity' and 'message'."""
    print(json.dumps({"severity": severity, "message": message, "version": APP_VERSION, **extra}), flush=True)


PAGE = """<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DevOps Quiz</title>
<style>body{font-family:Arial,sans-serif;max-width:720px;margin:20px auto;padding:0 14px}
.q{border:1px solid #bbb;border-radius:8px;padding:10px;margin:10px 0}label{display:block;margin:4px 0}
button{padding:10px 18px;font-size:16px}#result{font-size:20px;font-weight:bold;margin-top:14px}
.ok{color:green}.bad{color:#b00020}small{color:#666}</style></head><body>
<h1>DevOps Online Quiz</h1><small id="ver"></small><div id="quiz">Loading...</div>
<button id="go" style="display:none">Submit answers</button><div id="result"></div>
<script>
let total=0;
fetch('/api/questions').then(r=>r.json()).then(d=>{
  document.getElementById('ver').textContent='App version: '+d.version;
  const box=document.getElementById('quiz'); box.textContent=''; total=d.questions.length;
  d.questions.forEach((q,i)=>{
    const div=document.createElement('div'); div.className='q';
    const t=document.createElement('b'); t.textContent=(i+1)+'. '+q.q; div.appendChild(t);
    q.options.forEach((o,j)=>{
      const l=document.createElement('label'); const r=document.createElement('input');
      r.type='radio'; r.name='q'+i; r.value=j; l.appendChild(r); l.appendChild(document.createTextNode(' '+o)); div.appendChild(l);});
    box.appendChild(div);});
  document.getElementById('go').style.display='inline-block';
});
document.getElementById('go').onclick=()=>{
  const answers=[]; for(let i=0;i<total;i++){const c=document.querySelector('input[name=q'+i+']:checked'); answers.push(c?parseInt(c.value):-1);}
  fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers})})
  .then(r=>r.json()).then(d=>{const el=document.getElementById('result');
    el.textContent='Your score: '+d.score+' / '+d.total+' ('+d.percent+'%)'; el.className=d.percent>=50?'ok':'bad';});
};
</script></body></html>"""


class Handler(BaseHTTPRequestHandler):
    server_version = "QuizApp"

    def log_message(self, *args):      # silence default logging; we write our own JSON logs
        pass

    def _send(self, code, body, ctype="application/json"):
        if isinstance(body, (dict, list)):
            body = json.dumps(body)
        data = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _route(self, method):
        start = time.time()
        code = 200
        try:
            if method == "GET" and self.path == "/":
                self._send(200, PAGE, "text/html")
            elif method == "GET" and self.path == "/healthz":
                self._send(200, {"status": "ok", "version": APP_VERSION, "uptime_seconds": int(time.time() - START_TIME)})
            elif method == "GET" and self.path == "/api/questions":
                qs = [{"q": q["q"], "options": q["options"]} for q in QUESTIONS]
                self._send(200, {"version": APP_VERSION, "questions": qs})
            elif method == "GET" and self.path == "/metrics":
                with _lock:
                    m = dict(METRICS)
                text = "".join("quiz_%s %s\n" % (k, v) for k, v in m.items())
                self._send(200, text, "text/plain")
            elif method == "GET" and self.path == "/fail":
                raise RuntimeError("Deliberate test error from /fail")
            elif method == "POST" and self.path == "/api/submit":
                code = self._submit()
            else:
                code = 404
                self._send(404, {"error": "not found"})
        except Exception as exc:       # error detection: log it and return 500
            code = 500
            log("ERROR", "request failed", path=self.path, error=str(exc))
            try:
                self._send(500, {"error": "server error"})
            except Exception:
                pass
        took = time.time() - start
        with _lock:
            METRICS["requests_total"] += 1
            METRICS["latency_sum_seconds"] += took
            if code >= 500:
                METRICS["errors_total"] += 1
        if self.path != "/healthz":
            log("INFO", "request", method=method, path=self.path, status=code, latency_ms=round(took * 1000, 2))

    def _submit(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length) or b"{}")
            answers = body["answers"]
            ok = (isinstance(answers, list) and len(answers) == len(QUESTIONS)
                  and all(isinstance(a, int) and -1 <= a <= 3 for a in answers))
        except (ValueError, KeyError, TypeError):
            ok = False
        if not ok:
            self._send(400, {"error": "send JSON like {\"answers\": [0,1,...]} with one number per question"})
            return 400
        score = sum(1 for a, q in zip(answers, QUESTIONS) if a == q["answer"])
        with _lock:
            METRICS["submissions_total"] += 1
        self._send(200, {"score": score, "total": len(QUESTIONS), "percent": round(100 * score / len(QUESTIONS))})
        return 200

    def do_GET(self):
        self._route("GET")

    def do_POST(self):
        self._route("POST")


def make_server(port):
    return ThreadingHTTPServer(("0.0.0.0", port), Handler)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    log("INFO", "starting quiz app", port=port)
    make_server(port).serve_forever()
