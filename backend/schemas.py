"""
Pydantic schemas for request and response validation.
These models define the shape of the data coming in and going out of the API.
"""

from pydantic import BaseModel, Field
from typing import Optional


class AnalysisOptions(BaseModel):
    """
    Options to control which analyses to run.
    All options are True by default.
    """

    analyze_narrative: bool = Field(
        default=True,
        description="Extract entities and build a knowledge graph to track narrative consistency."
    )
    analyze_structure: bool = Field(
        default=True,
        description="Detect passive voice and analyze sentence structure."
    )
    analyze_theme: bool = Field(
        default=True,
        description="Calculate thematic drift and overall coherence using vector embeddings."
    )
    analyze_tone: bool = Field(
        default=True,
        description="Classify tone (formal vs informal) using an SVM classifier."
    )
    suggest_enhancements: bool = Field(
        default=True,
        description="Generate a prioritized list of improvement suggestions."
    )
    transform_style: bool = Field(
        default=False,
        description="Transform the text style to the target tone."
    )
    target_tone: str = Field(
        default="formal",
        description="Target tone for style transformation. Either 'formal' or 'informal'."
    )


class AnalyzeRequest(BaseModel):
    """
    Request body for the full text analysis endpoint.
    """

    text: str = Field(
        description="The text you want to analyze. Minimum 10 characters.",
        min_length=10
    )
    options: AnalysisOptions = Field(
        default_factory=AnalysisOptions,
        description="Options to control which modules to run."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Yeah, so basically this project is gonna be super cool. We're gonna use AI and stuff. The system was designed by the team. A lot of features were implemented.",
                "options": {
                    "analyze_narrative": True,
                    "analyze_structure": True,
                    "analyze_theme": True,
                    "analyze_tone": True,
                    "suggest_enhancements": True
                }
            }
        }


class TransformRequest(BaseModel):
    """
    Request body for the style transformation endpoint.
    """

    text: str = Field(
        description="The text you want to transform.",
        min_length=10
    )
    target_tone: str = Field(
        default="formal",
        description="The target tone. Use 'formal' to make text more professional, or 'informal' to make it more casual."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Yeah so basically we're gonna implement this cool algorithm.",
                "target_tone": "formal"
            }
        }


class QuickAnalysisRequest(BaseModel):
    """
    Request body for the quick analysis endpoint.
    Returns a short plain-text summary instead of the full JSON.
    """

    text: str = Field(
        description="The text to quickly analyze.",
        min_length=10
    )

    class Config:
        json_schema_extra = {
            "example": {
                "text": "The research demonstrates significant improvements in model performance."
            }
        }


class ExportGraphRequest(BaseModel):
    """
    Request body for the knowledge graph export endpoint.
    """

    text: str = Field(
        description="The text to extract a knowledge graph from.",
        min_length=10
    )

    class Config:
        json_schema_extra = {
            "example": {
                "text": "John Smith is the CEO of TechCorp. He founded the company in 2015 in Silicon Valley."
            }
        }


class HealthResponse(BaseModel):
    """
    Response model for the health check endpoint.
    """

    status: str = Field(description="Service health status.")
    service: str = Field(description="Name of the service.")
    version: str = Field(description="Current API version.")
