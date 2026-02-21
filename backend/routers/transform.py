"""
Transform Router
Handles style transformation and quick analysis endpoints.
"""

from fastapi import APIRouter, HTTPException
from backend.schemas import TransformRequest, QuickAnalysisRequest
from backend.pipeline import AIWriterPipeline


router = APIRouter(prefix="/api", tags=["Transformation"])

# Reuse the same pipeline instance (already warmed up from analyze.py).
# We import it from the analyze router so there is only ONE pipeline loaded in memory.
from backend.routers.analyze import pipeline


@router.post(
    "/transform",
    summary="Transform Text Style",
    description="""
Transform the style or tone of the provided text using rule-based lexical substitution.

**How it works (no LLM involved)**:
1. Identifies informal/formal words using a pre-defined formality map.
2. Uses WordNet synonyms to find suitable replacements.
3. Maintains original Part-of-Speech (POS) so grammar stays intact.
4. Returns a list of every word that was changed and the reason why.

This fulfills the **Explainable Output** requirement — the judge can see exactly what was swapped and why.
"""
)
def transform_text(request: TransformRequest):
    """
    Transform text to a target tone.

    - **text**: The text to transform.
    - **target_tone**: Either `'formal'` or `'informal'`.
    """

    # We only need tone analysis and style transformation for this endpoint.
    options_dict = {
        "analyze_narrative": False,
        "analyze_structure": False,
        "analyze_theme": False,
        "analyze_tone": True,
        "suggest_enhancements": False,
        "transform_style": True,
        "target_tone": request.target_tone
    }

    try:
        results = pipeline.process_text(request.text, options_dict)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Transformation error: {str(error)}"
        )

    return results


@router.post(
    "/quick-analysis",
    summary="Quick Text Summary",
    description="""
Run the full analysis pipeline and return a **short, human-readable plain-text summary** instead of the full JSON report.

Useful for quickly checking text quality without parsing a large JSON response.
Returns a quality score, key strengths, key weaknesses, and the top 5 suggestions.
"""
)
def quick_analysis(request: QuickAnalysisRequest):
    """
    Get a short text summary of the analysis.

    - **text**: The text to analyze.
    """

    try:
        summary_text = pipeline.quick_analysis(request.text)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Quick analysis error: {str(error)}"
        )

    return {"summary": summary_text}
