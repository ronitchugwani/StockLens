from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import TickerRequest, CompareRequest
from services import yfinance_service, alphavantage_service
from services.yfinance_service import get_info
import pandas as pd
import io

router = APIRouter()


def _fetch_monthly_history(ticker: str, period: str, source: str) -> tuple[list, str]:
    if source == "alphavantage":
        try:
            return alphavantage_service.get_monthly(ticker), "alphavantage"
        except Exception:
            # Fall back to Yahoo monthly history so the dashboard remains usable.
            return yfinance_service.get_history(ticker, period), "yahoo"

    if source == "nse":
        return yfinance_service.get_history(ticker, period), "yahoo"

    return yfinance_service.get_history(ticker, period), "yahoo"


@router.post("/fetch")
async def fetch_stock(req: TickerRequest):
    try:
        data, source_used = _fetch_monthly_history(req.ticker, req.period, req.source)
        return {"ticker": req.ticker, "data": data, "source_used": source_used}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/compare")
async def compare_stocks(req: CompareRequest):
    results = {}
    for ticker in req.tickers:
        results[ticker] = yfinance_service.get_history(ticker, req.period)
    return {"tickers": req.tickers, "data": results}


@router.get("/info/{ticker}")
async def stock_info(ticker: str):
    try:
        return get_info(ticker)
    except Exception:
        return {
            "name": ticker,
            "sector": "N/A",
            "market_cap": 0,
            "pe_ratio": 0,
            "52w_high": 0,
            "52w_low": 0,
            "currency": "USD",
        }


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        df.columns = [c.lower().strip() for c in df.columns]
        return {
            "rows": len(df),
            "columns": list(df.columns),
            "data": df.head(100).to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {e}")
