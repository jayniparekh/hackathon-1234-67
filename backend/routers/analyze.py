"""
Analyze Router
Handles the full text analysis endpoint.
This is the main endpoint that runs all NLP modules.
"""

from fastapi import APIRouter, HTTPException
from backend.schemas import AnalyzeRequest
from backend.pipeline import AIWriterPipeline


# Create the router. All routes here will have the /api prefix.
router = APIRouter(prefix="/api", tags=["Analysis"])

# We create one pipeline instance and reuse it for all requests.
# Creating it here means it loads once when the server starts.
pipeline = AIWriterPipeline()


@router.post(
    "/analyze",
    summary="Analyze Text",
    description="""
Run the full NLP analysis pipeline on the provided text.

This endpoint runs all enabled modules:

- **Narrative Analysis**: Extracts named entities, builds a knowledge graph using NetworkX, and detects potential contradictions.
- **Structure Analysis**: Uses spaCy dependency parsing to detect passive voice sentences and calculate sentence complexity.
- **Thematic Coherence**: Generates Sentence-BERT embeddings for each paragraph and calculates cosine similarity to detect topic drift.
- **Tone Detection**: Classifies the text as formal or informal using an SVM classifier, with SHAP-style word-level attribution.
- **Suggestion Engine**: Aggregates all findings and returns prioritized suggestions (high / medium / low severity).

Returns a detailed JSON report with a quality score out of 100.
"""
)
def analyze_text(request: AnalyzeRequest):


    # Convert the Pydantic options model to a plain dictionary
    # so the pipeline can use it the same way it did before.
    options_dict = request.options.model_dump()

    try:
        results = pipeline.process_text(request.text, options_dict)
    except Exception as error:
        # If anything goes wrong inside the pipeline, return a clear error.
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline error: {str(error)}"
        )

    return results
