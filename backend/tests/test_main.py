from fastapi.testclient import TestClient
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from main import app

client = TestClient(app)


def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "StockLens API is running"


def test_insights_ping():
    res = client.get("/api/insights/ping")
    assert res.status_code == 200


def test_reports_ping():
    res = client.get("/api/reports/ping")
    assert res.status_code == 200
