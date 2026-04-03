import yfinance as yf
import pandas as pd


def _normalize_history_frame(df: pd.DataFrame) -> pd.DataFrame:
    if not isinstance(df.columns, pd.MultiIndex):
        return df

    normalized_columns = []
    for column in df.columns.to_flat_index():
        parts = [str(part) for part in column if part not in ("", None)]
        if not parts:
            normalized_columns.append("")
            continue

        primary = parts[0]
        if primary in {"Date", "Datetime", "Open", "Close", "High", "Low", "Volume", "Adj Close"}:
            normalized_columns.append(primary)
        else:
            normalized_columns.append(parts[-1])

    normalized = df.copy()
    normalized.columns = normalized_columns
    return normalized


def _download_history(ticker: str, period: str) -> pd.DataFrame:
    tk = yf.Ticker(ticker)
    try:
        df = tk.history(period=period, interval="1mo")
        if not df.empty:
            return df
    except Exception:
        pass

    df = yf.download(
        tickers=ticker,
        period=period,
        interval="1mo",
        progress=False,
        auto_adjust=False,
        threads=False,
    )
    return df


def get_history(ticker: str, period: str = "1y") -> list:
    df = _download_history(ticker, period)
    if df.empty:
        raise ValueError(f"No historical data found for {ticker}")

    df = df.reset_index()
    df = _normalize_history_frame(df)

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
    info = {}
    fast_info = {}

    try:
        info = tk.info or {}
    except Exception:
        info = {}

    try:
        fast_info = dict(tk.fast_info or {})
    except Exception:
        fast_info = {}

    return {
        "name": info.get("longName") or info.get("shortName") or ticker,
        "sector": info.get("sector", "N/A"),
        "market_cap": info.get("marketCap") or fast_info.get("market_cap", 0),
        "pe_ratio": info.get("trailingPE") or fast_info.get("trailing_pe", 0),
        "52w_high": info.get("fiftyTwoWeekHigh") or fast_info.get("year_high", 0),
        "52w_low": info.get("fiftyTwoWeekLow") or fast_info.get("year_low", 0),
        "currency": info.get("currency") or fast_info.get("currency") or "USD",
    }
