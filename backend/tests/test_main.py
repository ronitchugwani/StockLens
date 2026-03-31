from fastapi.testclient import TestClient
import os
import sys

import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from main import app
from services import yfinance_service

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


def test_get_history_parses_string_dates(monkeypatch):
    class FakeTicker:
        def history(self, period: str, interval: str):
            assert period == "1y"
            assert interval == "1mo"
            return pd.DataFrame(
                {
                    "Date": ["2025-01-31", "2025-02-28"],
                    "Open": [100, 105],
                    "Close": [105, 110],
                    "High": [106, 111],
                    "Low": [99, 104],
                    "Volume": [1_000_000, 1_500_000],
                }
            ).set_index("Date")

    monkeypatch.setattr(yfinance_service.yf, "Ticker", lambda _: FakeTicker())

    result = yfinance_service.get_history("AAPL", "1y")

    assert result == [
        {
            "month": "Jan 25",
            "open": 100.0,
            "close": 105.0,
            "high": 106.0,
            "low": 99.0,
            "vol": 1_000_000,
        },
        {
            "month": "Feb 25",
            "open": 105.0,
            "close": 110.0,
            "high": 111.0,
            "low": 104.0,
            "vol": 1_500_000,
        },
    ]
