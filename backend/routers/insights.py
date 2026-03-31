from fastapi import APIRouter, HTTPException
from models.schemas import InsightRequest
from services import gemini_service

router = APIRouter()


@router.post("/generate")
async def generate_insights(req: InsightRequest):
    try:
        text = gemini_service.generate_insights(req.ticker, req.summary_data.get("data", []))
        return {"ticker": req.ticker, "insights": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ping")
def ping():
    return {"status": "insights router ready"}
