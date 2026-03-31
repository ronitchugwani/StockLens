from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import TickerRequest, CompareRequest
from services import yfinance_service, alphavantage_service, nse_service
import pandas as pd
import io

router = APIRouter()


@router.post("/fetch")
async def fetch_stock(req: TickerRequest):
    try:
        if req.source == "alphavantage":
            data = alphavantage_service.get_monthly(req.ticker)
        elif req.source == "nse":
            data = nse_service.get_quote(req.ticker)
        else:
            data = yfinance_service.get_history(req.ticker, req.period)
        return {"ticker": req.ticker, "data": data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/compare")
async def compare_stocks(req: CompareRequest):
    results = {}
    for ticker in req.tickers:
        results[ticker] = yfinance_service.get_history(ticker, req.period)
    return {"tickers": req.tickers, "data": results}


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
