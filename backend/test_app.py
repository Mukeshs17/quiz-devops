import unittest
import threading
import time
import urllib.request
import urllib.error
import json
import app

class TestOnlineQuizApp(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.port = 8089
        cls.server_thread = threading.Thread(target=app.run_server, kwargs={'port': cls.port}, daemon=True)
        cls.server_thread.start()
        time.sleep(1)
        cls.base_url = f"http://127.0.0.1:{cls.port}"

    def test_1_root_endpoint(self):
        req = urllib.request.urlopen(f"{self.base_url}/")
        self.assertEqual(req.status, 200)

    def test_2_healthz_endpoint(self):
        req = urllib.request.urlopen(f"{self.base_url}/healthz")
        self.assertEqual(req.status, 200)
        data = json.loads(req.read().decode())
        self.assertEqual(data.get("status"), "ok")

    def test_3_questions_endpoint(self):
        req = urllib.request.urlopen(f"{self.base_url}/api/questions")
        self.assertEqual(req.status, 200)
        data = json.loads(req.read().decode())
        self.assertEqual(len(data), 8)

    def test_4_submit_endpoint(self):
        payload = json.dumps({"answers": {"1": 0, "2": 1}}).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/api/submit",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode())
            self.assertEqual(data.get("score"), 2)

    def test_5_metrics_endpoint(self):
        req = urllib.request.urlopen(f"{self.base_url}/metrics")
        self.assertEqual(req.status, 200)
        data = json.loads(req.read().decode())
        self.assertIn("requests", data)
        self.assertIn("errors", data)

    def test_6_fail_endpoint_simulation(self):
        try:
            urllib.request.urlopen(f"{self.base_url}/fail")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 500)

if __name__ == '__main__':
    unittest.main()
