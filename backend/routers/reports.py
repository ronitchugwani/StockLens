from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models.schemas import ReportRequest
from services import yfinance_service, gemini_service, pdf_service

router = APIRouter()


@router.post("/generate")
async def generate_report(req: ReportRequest):
    try:
        data = yfinance_service.get_history(req.ticker, req.period)
        insights = gemini_service.generate_insights(req.ticker, data)
        pdf = pdf_service.generate_pdf(req.ticker, data, insights)
        filename = f"{req.ticker}_report_{req.period}.pdf"
        return Response(
            content=pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ping")
def ping():
    return {"status": "reports router ready"}
