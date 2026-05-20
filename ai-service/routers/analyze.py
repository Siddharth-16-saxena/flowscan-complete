from fastapi import APIRouter, HTTPException
from models.schemas import AnalysisRequest, AnalysisResponse
from services.detector import analyze
from datetime import datetime
import logging

logger = logging.getLogger("flowscan")
router = APIRouter(prefix="", tags=["Analysis"])


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_workflow(request: AnalysisRequest):
    """
    Analyze a workflow task list and return bottleneck detection results.

    - Computes task durations
    - Identifies outlier tasks (bottlenecks)
    - Detects idle gaps between tasks
    - Returns metrics, messages, and suggestions
    """
    tasks = [t.model_dump() for t in request.tasks]

    if not tasks:
        raise HTTPException(status_code=422, detail="Task list cannot be empty.")

    logger.info(f"Analyzing {len(tasks)} tasks...")

    try:
        result = analyze(tasks)
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

    return AnalysisResponse(
        metrics=result["metrics"],
        bottlenecks=result["bottlenecks"],
        idle_info=result["idle_info"],
        suggestions=result["suggestions"],
        analyzed_at=datetime.utcnow().isoformat(),
    )


@router.post("/analyze/batch")
async def analyze_batch(requests: list[AnalysisRequest]):
    """Analyze multiple workflows in one call."""
    results = []
    for req in requests:
        tasks = [t.model_dump() for t in req.tasks]
        results.append(analyze(tasks))
    return {"results": results, "count": len(results)}
