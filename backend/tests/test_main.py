from fastapi.testclient import TestClient
import os
import sys

import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from main import app
from routers import stocks as stocks_router
from services import alphavantage_service, yfinance_service

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


def test_cors_preflight_allows_local_vite_ports():
    res = client.options(
        "/api/stocks/fetch",
        headers={
            "Origin": "http://localhost:5174",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert res.status_code == 200
    assert res.headers["access-control-allow-origin"] == "http://localhost:5174"


def test_fetch_stock_falls_back_to_yahoo_when_alphavantage_fails(monkeypatch):
    def raise_alpha_error(_: str):
        raise ValueError("Alpha Vantage rate limit")

    expected = [
        {
            "month": "Jan 25",
            "open": 100.0,
            "close": 105.0,
            "high": 106.0,
            "low": 99.0,
            "vol": 1_000_000,
        }
    ]

    monkeypatch.setattr(alphavantage_service, "get_monthly", raise_alpha_error)
    monkeypatch.setattr(yfinance_service, "get_history", lambda ticker, period: expected)

    res = client.post(
        "/api/stocks/fetch",
        json={"ticker": "MSFT", "period": "1y", "source": "alphavantage"},
    )

    assert res.status_code == 200
    assert res.json() == {
        "ticker": "MSFT",
        "data": expected,
        "source_used": "yahoo",
    }


def test_stock_info_returns_fallback_payload_when_lookup_fails(monkeypatch):
    def raise_info_error(_: str):
        raise RuntimeError("metadata unavailable")

    monkeypatch.setattr(stocks_router, "get_info", raise_info_error)

    res = client.get("/api/stocks/info/MSFT")

    assert res.status_code == 200
    assert res.json() == {
        "name": "MSFT",
        "sector": "N/A",
        "market_cap": 0,
        "pe_ratio": 0,
        "52w_high": 0,
        "52w_low": 0,
        "currency": "USD",
    }


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


def test_get_info_uses_fast_info_when_info_lookup_breaks(monkeypatch):
    class FakeTicker:
        @property
        def info(self):
            raise RuntimeError("info endpoint failed")

        @property
        def fast_info(self):
            return {
                "market_cap": 3_000_000,
                "year_high": 220.0,
                "year_low": 150.0,
                "currency": "USD",
            }

    monkeypatch.setattr(yfinance_service.yf, "Ticker", lambda _: FakeTicker())

    result = yfinance_service.get_info("MSFT")

    assert result == {
        "name": "MSFT",
        "sector": "N/A",
        "market_cap": 3_000_000,
        "pe_ratio": 0,
        "52w_high": 220.0,
        "52w_low": 150.0,
        "currency": "USD",
    }
