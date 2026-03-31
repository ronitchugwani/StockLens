from fastapi import APIRouter

router = APIRouter()


@router.get("/ping")
def ping():
    return {"status": "scheduler router ready"}
