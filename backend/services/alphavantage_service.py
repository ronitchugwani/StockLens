import os
from datetime import datetime

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
    payload = r.json()

    if payload.get("Error Message"):
        raise ValueError(payload["Error Message"])

    if payload.get("Information"):
        raise ValueError(payload["Information"])

    if payload.get("Note"):
        raise ValueError(payload["Note"])

    raw = payload.get("Monthly Adjusted Time Series", {})
    if not raw:
        if key == "demo":
            raise ValueError(
                f"Alpha Vantage demo key does not provide monthly data for {ticker}. "
                "Use IBM or configure ALPHA_VANTAGE_API_KEY."
            )
        raise ValueError(f"Alpha Vantage returned no monthly data for {ticker}")

    result = []
    for date_str, vals in sorted(raw.items())[-12:]:
        month = datetime.strptime(date_str, "%Y-%m-%d").strftime("%b %y")
        result.append({
            "month": month,
            "open": float(vals["1. open"]),
            "close": float(vals["5. adjusted close"]),
            "high": float(vals["2. high"]),
            "low": float(vals["3. low"]),
            "vol": int(vals["6. volume"]),
        })
    return result
