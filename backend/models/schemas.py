from pydantic import BaseModel
from typing import Optional, List


class TickerRequest(BaseModel):
    ticker: str
    period: Optional[str] = "1y"
    source: Optional[str] = "yahoo"  # yahoo | alphavantage | nse


class CompareRequest(BaseModel):
    tickers: List[str]
    period: Optional[str] = "1y"


class InsightRequest(BaseModel):
    ticker: str
    summary_data: dict


class ReportRequest(BaseModel):
    ticker: str
    period: Optional[str] = "1y"
    format: Optional[str] = "pdf"


class SchedulerRequest(BaseModel):
    email: str
    ticker: str
    frequency: str  # daily | weekly | monthly
