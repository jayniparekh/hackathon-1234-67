"""
Main FastAPI Application Entry Point

This file creates the FastAPI app, registers all the routers,
and sets up CORS so the frontend HTML can talk to the API.

To run this server:
    uvicorn backend.app:app --reload --port 5000

Then open http://localhost:5000/docs to see the interactive API docs.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Import all routers
from backend.routers import health, analyze, transform, graph


# --- Create the FastAPI application ---
app = FastAPI(
    title="AI Writer API",
    description="""
## AI-Powered Content Enhancement System

A hackathon-winning NLP pipeline that enhances writing using **traditional NLP techniques**, not LLM wrappers.

### What makes this different from a ChatGPT wrapper?

| Feature | LLM Wrapper | This System |
|---|---|---|
| Narrative Tracking | "Check consistency" prompt | NetworkX knowledge graph |
| Coherence | Black-box judgment | Cosine similarity on Sentence-BERT |
| Tone Detection | GPT classification | Custom SVM + SHAP explainability |
| Style Transform | "Make it formal" prompt | WordNet lexical substitution |
| Explainability | None | Word-level attribution scores |

### Modules
- **Narrative Engine** — spaCy NER + NetworkX graphs
- **Structural Engine** — Dependency parsing, passive-to-active voice
- **Thematic Engine** — Sentence-BERT + FAISS + cosine similarity
- **Style Engine** — SVM classifier + SHAP + WordNet synonyms
- **Suggestion Engine** — Aggregates all findings into ranked suggestions
""",
    version="1.0.0",
    contact={
        "name": "AI Writer Project",
    },
    license_info={
        "name": "MIT",
    }
)


# --- CORS Middleware ---
# This allows the frontend HTML file to call the API from the browser.
# Without this, the browser blocks cross-origin requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow all origins (fine for development)
    allow_credentials=True,
    allow_methods=["*"],      # Allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)


# --- Register Routers ---
# Each router handles one group of related endpoints.
app.include_router(health.router)
app.include_router(analyze.router)
app.include_router(transform.router)
app.include_router(graph.router)


# --- Serve the Frontend HTML ---
# When someone visits http://localhost:5000/ we send them the HTML file.
@app.get("/", include_in_schema=False)
def serve_frontend():
    """Serve the frontend HTML file."""
    frontend_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "frontend",
        "index.html"
    )
    return FileResponse(frontend_path)


# --- Startup Event ---
# This runs once when the server first starts up.
@app.on_event("startup")
def on_startup():
    print("\n" + "=" * 60)
    print("  AI Writer API - FastAPI Server")
    print("=" * 60)
    print("  API:  http://localhost:5000")
    print("  Docs: http://localhost:5000/docs")
    print("  UI:   http://localhost:5000")
    print("=" * 60 + "\n")