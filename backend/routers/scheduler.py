from fastapi import APIRouter, HTTPException
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from models.schemas import SchedulerRequest
from services import email_service

router = APIRouter()
scheduler = BackgroundScheduler()
scheduler.start()

JOBS: dict = {}


def _job_id(email: str, ticker: str) -> str:
    return f"{email}::{ticker}"


@router.post("/add")
def add_schedule(req: SchedulerRequest):
    try:
        job_id = _job_id(req.email, req.ticker)
        if job_id in JOBS:
            scheduler.remove_job(job_id)

        triggers = {
            "daily": CronTrigger(hour=7, minute=0),
            "weekly": CronTrigger(day_of_week="mon", hour=7, minute=0),
            "monthly": CronTrigger(day=1, hour=7, minute=0),
        }
        trigger = triggers.get(req.frequency)
        if not trigger:
            raise ValueError(f"Invalid frequency: {req.frequency}")

        scheduler.add_job(
            email_service.send_report_email,
            trigger=trigger,
            args=[req.email, req.ticker],
            id=job_id,
            replace_existing=True,
        )
        JOBS[job_id] = {"email": req.email, "ticker": req.ticker, "frequency": req.frequency}
        return {"message": f"Scheduled {req.frequency} report for {req.ticker} to {req.email}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/remove")
def remove_schedule(email: str, ticker: str):
    job_id = _job_id(email, ticker)
    if job_id in JOBS:
        scheduler.remove_job(job_id)
        del JOBS[job_id]
        return {"message": "Schedule removed"}
    raise HTTPException(status_code=404, detail="Schedule not found")


@router.get("/list")
def list_schedules():
    return {"schedules": list(JOBS.values())}


@router.post("/send-now")
async def send_now(req: SchedulerRequest):
    try:
        email_service.send_report_email(req.email, req.ticker)
        return {"message": f"Report sent to {req.email}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ping")
def ping():
    return {"status": "scheduler router ready"}
