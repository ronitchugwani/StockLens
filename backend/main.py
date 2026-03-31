import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stocks, insights, reports, scheduler

load_dotenv()

app = FastAPI(
    title="StockLens API",
    description="Automated Financial Reporting & Analytics System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router, prefix="/api/stocks", tags=["Stocks"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(scheduler.router, prefix="/api/scheduler", tags=["Scheduler"])


@app.get("/")
def root():
    return {"status": "StockLens API is running"}
