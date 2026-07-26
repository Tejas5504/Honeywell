"""
Report API endpoints.
Provides PDF report generation and download.
"""
import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.database import get_db
from app.services.report_generator import generate_report

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

# Directory to store generated reports
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reports")


@router.post("/generate")
async def create_report(request: dict = {}, db=Depends(get_db)):
    """
    Generate a comprehensive PDF security report.

    Request body (optional):
        include_threats (bool): Include threat summary section
        include_attacks (bool): Include attack distribution section
        include_risk_distribution (bool): Include risk distribution section
        include_model_performance (bool): Include model performance section
        include_recommendations (bool): Include recommendations section
    """
    os.makedirs(REPORTS_DIR, exist_ok=True)

    config = {
        "include_threats": request.get("include_threats", True),
        "include_attacks": request.get("include_attacks", True),
        "include_risk_distribution": request.get("include_risk_distribution", True),
        "include_model_performance": request.get("include_model_performance", True),
        "include_recommendations": request.get("include_recommendations", True),
    }

    report_id = str(uuid.uuid4())
    pdf_bytes = await generate_report(db, config)

    file_path = os.path.join(REPORTS_DIR, f"{report_id}.pdf")
    with open(file_path, "wb") as f:
        f.write(pdf_bytes)

    return {
        "status": "completed",
        "report_id": report_id,
        "message": f"Report generated successfully ({len(pdf_bytes)} bytes)",
    }


@router.get("/download/{report_id}")
async def download_report(report_id: str):
    """Download a previously generated PDF report."""
    file_path = os.path.join(REPORTS_DIR, f"{report_id}.pdf")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report not found")

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"CyberShield_Report_{report_id[:8]}.pdf",
    )
