import json, os, sys, threading, unittest, urllib.request, urllib.error
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "app"))
import app


class QuizTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.srv = app.make_server(0)                  # port 0 = any free port
        cls.port = cls.srv.server_address[1]
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()

    def call(self, path, data=None):
        url = "http://127.0.0.1:%d%s" % (self.port, path)
        req = urllib.request.Request(url, data=None if data is None else json.dumps(data).encode(),
                                     headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req) as r:
                return r.status, r.read().decode()
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode()

    def test_health(self):
        code, body = self.call("/healthz")
        self.assertEqual(code, 200)
        self.assertEqual(json.loads(body)["status"], "ok")

    def test_questions_hide_answers(self):
        code, body = self.call("/api/questions")
        self.assertEqual(code, 200)
        for q in json.loads(body)["questions"]:
            self.assertNotIn("answer", q)
        self.assertEqual(len(json.loads(body)["questions"]), len(app.QUESTIONS))

    def test_perfect_score(self):
        code, body = self.call("/api/submit", {"answers": [q["answer"] for q in app.QUESTIONS]})
        self.assertEqual(code, 200)
        self.assertEqual(json.loads(body)["percent"], 100)

    def test_zero_score(self):
        wrong = [(q["answer"] + 1) % 4 for q in app.QUESTIONS]
        code, body = self.call("/api/submit", {"answers": wrong})
        self.assertEqual(json.loads(body)["score"], 0)

    def test_bad_input(self):
        self.assertEqual(self.call("/api/submit", {"answers": [1]})[0], 400)

    def test_fail_endpoint_gives_500(self):
        self.assertEqual(self.call("/fail")[0], 500)

    def test_metrics(self):
        self.call("/healthz")
        code, body = self.call("/metrics")
        self.assertEqual(code, 200)
        self.assertIn("quiz_requests_total", body)

    def test_unknown_page(self):
        self.assertEqual(self.call("/nope")[0], 404)


if __name__ == "__main__":
    unittest.main()
