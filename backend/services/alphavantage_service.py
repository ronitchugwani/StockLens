import os

import httpx

BASE = "https://www.alphavantage.co/query"


def get_monthly(ticker: str) -> list:
    key = os.getenv("ALPHA_VANTAGE_API_KEY", "demo")
    params = {
        "function": "TIME_SERIES_MONTHLY_ADJUSTED",
        "symbol": ticker,
        "apikey": key,
    }
    r = httpx.get(BASE, params=params, timeout=15)
    r.raise_for_status()
    raw = r.json().get("Monthly Adjusted Time Series", {})
    result = []
    for date_str, vals in sorted(raw.items())[-12:]:
        result.append({
            "month": date_str[:7],
            "open": float(vals["1. open"]),
            "close": float(vals["5. adjusted close"]),
            "high": float(vals["2. high"]),
            "low": float(vals["3. low"]),
            "vol": int(vals["6. volume"]),
        })
    return result
