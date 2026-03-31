import yfinance as yf


def get_history(ticker: str, period: str = "1y") -> list:
    tk = yf.Ticker(ticker)
    df = tk.history(period=period, interval="1mo")
    df = df.reset_index()
    df["Month"] = df["Date"].dt.strftime("%b %y")
    result = []
    for _, row in df.iterrows():
        result.append({
            "month": row["Month"],
            "open": round(float(row["Open"]), 2),
            "close": round(float(row["Close"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "vol": int(row["Volume"]),
        })
    return result


def get_info(ticker: str) -> dict:
    tk = yf.Ticker(ticker)
    info = tk.info
    return {
        "name": info.get("longName", ticker),
        "sector": info.get("sector", "N/A"),
        "market_cap": info.get("marketCap", 0),
        "pe_ratio": info.get("trailingPE", 0),
        "52w_high": info.get("fiftyTwoWeekHigh", 0),
        "52w_low": info.get("fiftyTwoWeekLow", 0),
        "currency": info.get("currency", "USD"),
    }
