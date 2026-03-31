from nsetools import Nse

nse = Nse()


def get_quote(symbol: str) -> dict:
    q = nse.get_quote(symbol.upper())
    if not q:
        raise ValueError(f"No NSE data for {symbol}")
    return {
        "symbol": q.get("symbol"),
        "companyName": q.get("companyName"),
        "lastPrice": q.get("lastPrice"),
        "change": q.get("change"),
        "pChange": q.get("pChange"),
        "open": q.get("open"),
        "high": q.get("dayHigh"),
        "low": q.get("dayLow"),
        "previousClose": q.get("previousClose"),
        "totalTradedVolume": q.get("totalTradedVolume"),
    }
