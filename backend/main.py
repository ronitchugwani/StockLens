import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stocks, insights, reports, scheduler

load_dotenv()


def _get_cors_origins() -> list[str]:
    raw_origins = os.getenv("FRONTEND_URL", "")
    origins = [origin.strip().rstrip("/") for origin in raw_origins.split(",") if origin.strip()]
    if not origins:
        origins = ["http://localhost:5173"]
    return origins

app = FastAPI(
    title="StockLens API",
    description="Automated Financial Reporting & Analytics System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    # Accept any localhost or 127.0.0.1 dev server port so Vite can auto-switch
    # without breaking browser preflight requests.
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
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
