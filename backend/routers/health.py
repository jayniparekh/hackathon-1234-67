"""
Health Router
Provides a simple health check endpoint to verify the server is running.
"""

from fastapi import APIRouter
from backend.schemas import HealthResponse


# Create a router for health-related endpoints.
# The prefix means all routes here will start with /api.
router = APIRouter(prefix="/api", tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Check API Health",
    description="Returns the current health status of the API server. Use this to verify the server is running before sending analysis requests."
)
def get_health():
    """
    Simple health check.
    Returns 200 OK with service info if the server is running correctly.
    """
    response = HealthResponse(
        status="healthy",
        service="AI Writer API",
        version="1.0"
    )
    return response
