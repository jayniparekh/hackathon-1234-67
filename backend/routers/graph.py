"""
Graph Router
Handles the knowledge graph export endpoint.
"""

from fastapi import APIRouter, HTTPException
from backend.schemas import ExportGraphRequest
from backend.routers.analyze import pipeline


router = APIRouter(prefix="/api", tags=["Knowledge Graph"])


@router.post(
    "/export-graph",
    summary="Export Knowledge Graph",
    description="""
Extract a **knowledge graph** from the text and return it as a JSON object.

**How it works**:
1. Uses spaCy Named Entity Recognition (NER) to find people, places, organisations, and dates.
2. Uses dependency parsing to extract Subject → Verb → Object triples.
3. Builds a directed graph using NetworkX.
4. Returns nodes (entities) and edges (relationships) that can be visualised.

This is one of the core **custom-built** components that demonstrates deep NLP engineering.
"""
)
def export_graph(request: ExportGraphRequest):
    """
    Extract and return a knowledge graph from the text.

    - **text**: The text to extract entities and relationships from.
    """

    try:
        # Step 1: extract the knowledge graph from the narrative engine
        pipeline.narrative_engine.extract_knowledge_graph(request.text)

        # Step 2: export it as a JSON-serialisable dictionary
        graph_data = pipeline.export_knowledge_graph(filepath=None)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Graph extraction error: {str(error)}"
        )

    return graph_data
