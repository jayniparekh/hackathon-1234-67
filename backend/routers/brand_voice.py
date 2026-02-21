"""
Brand Voice Router
All endpoints for the Brand Voice DNA system.
"""

from dataclasses import asdict
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.brand_voice_engine import brand_voice_engine, profile_store


router = APIRouter(prefix="/api/brand-voice", tags=["Brand Voice DNA"])


# ── Request / Response Models ────────────────────────────────────────────────

class CreateProfileRequest(BaseModel):
    profile_name: str = Field(description="Unique name for this brand voice profile", min_length=1, max_length=80)
    articles: List[str] = Field(description="List of article texts to train from (1–10)")

    class Config:
        json_schema_extra = {
            "example": {
                "profile_name": "AppleBlog",
                "articles": [
                    "Today we're excited to share something we've been working on for years...",
                    "Privacy is a fundamental human right. At Apple, it's also one of our core values."
                ]
            }
        }


class ScoreContentRequest(BaseModel):
    profile_name: str = Field(description="Name of the brand voice profile to score against")
    text: str = Field(description="Content to score", min_length=10)

    class Config:
        json_schema_extra = {
            "example": {
                "profile_name": "AppleBlog",
                "text": "Our product is revolutionary and will CHANGE THE WORLD! Buy now!!!"
            }
        }


class AutoCorrectRequest(BaseModel):
    profile_name: str = Field(description="Name of the brand voice profile to correct toward")
    text: str = Field(description="Content to auto-correct", min_length=10)


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post(
    "/profile",
    summary="Create Brand Voice Profile",
    description="Upload 1–10 articles to extract and save a brand voice DNA profile."
)
def create_profile(request: CreateProfileRequest):
    if not request.articles:
        raise HTTPException(status_code=422, detail="At least one article is required.")

    try:
        profile = brand_voice_engine.extract_brand_dna(
            articles=request.articles,
            profile_name=request.profile_name,
        )
        profile_store.save(profile)
        return {
            "success": True,
            "profile": asdict(profile),
            "message": f"Brand voice profile '{request.profile_name}' created successfully from {len(request.articles)} article(s)."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract brand DNA: {str(e)}")


@router.post(
    "/score",
    summary="Score Content Against Brand Voice",
    description="Score how well a piece of content matches a saved brand voice profile."
)
def score_content(request: ScoreContentRequest):
    profile = profile_store.get(request.profile_name)
    if not profile:
        raise HTTPException(
            status_code=404,
            detail=f"Profile '{request.profile_name}' not found. Create it first via POST /api/brand-voice/profile"
        )

    try:
        result = brand_voice_engine.score_content(request.text, profile)
        return {
            "success": True,
            "profile_name": request.profile_name,
            "result": asdict(result),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


@router.post(
    "/correct",
    summary="Auto-Correct Content to Brand Voice",
    description="Rewrite content to align with a brand voice profile. Returns original + corrected text with scores."
)
def auto_correct(request: AutoCorrectRequest):
    profile = profile_store.get(request.profile_name)
    if not profile:
        raise HTTPException(
            status_code=404,
            detail=f"Profile '{request.profile_name}' not found. Create it first via POST /api/brand-voice/profile"
        )

    try:
        result = brand_voice_engine.auto_correct(request.text, profile)
        return {
            "success": True,
            "profile_name": request.profile_name,
            "result": asdict(result),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-correction failed: {str(e)}")


@router.get(
    "/profiles",
    summary="List Brand Voice Profiles",
    description="List all saved brand voice profiles."
)
def list_profiles():
    return {
        "profiles": profile_store.all_profiles(),
        "total": len(profile_store.list_names()),
    }


@router.delete(
    "/profile/{profile_name}",
    summary="Delete Brand Voice Profile",
)
def delete_profile(profile_name: str):
    deleted = profile_store.delete(profile_name)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Profile '{profile_name}' not found.")
    return {"success": True, "message": f"Profile '{profile_name}' deleted."}
