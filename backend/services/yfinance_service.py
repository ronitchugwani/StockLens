import yfinance as yf
import pandas as pd


def get_history(ticker: str, period: str = "1y") -> list:
    tk = yf.Ticker(ticker)
    df = tk.history(period=period, interval="1mo")
    if df.empty:
        raise ValueError(f"No historical data found for {ticker}")

    df = df.reset_index()

    date_column = next(
        (column for column in ("Date", "Datetime", "index") if column in df.columns),
        None,
    )
    if not date_column:
        raise ValueError(f"Unexpected history format for {ticker}")

    df[date_column] = pd.to_datetime(df[date_column], errors="coerce")
    df = df.dropna(subset=[date_column])
    if df.empty:
        raise ValueError(f"No valid dated history found for {ticker}")

    df["Month"] = df[date_column].dt.strftime("%b %y")
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
