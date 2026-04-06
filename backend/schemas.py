"""
Pydantic schemas for request validation and response serialization.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ---------- Response schemas ----------

class ModuleResult(BaseModel):
    """Result from a single analysis module."""
    score: float = Field(..., ge=0, le=100, description="Module score (0-100)")
    flags: list[str] = Field(default_factory=list, description="Behavioral flags detected")
    details: dict = Field(default_factory=dict, description="Module-specific details")


class AnalysisResponse(BaseModel):
    """Full analysis response returned to the client."""
    id: int
    candidate_name: str
    truth_score: float = Field(..., ge=0, le=100)
    confidence_score: float = Field(..., ge=0, le=100)
    classification: str
    behavioral_flags: list[str]
    detailed_analysis: dict
    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisListResponse(BaseModel):
    """Wrapper for listing multiple results."""
    total: int
    results: list[AnalysisResponse]


# ---------- Internal data transfer ----------

class FacialAnalysisResult(BaseModel):
    expression_score: float = Field(default=50.0, ge=0, le=100)
    eye_movement_score: float = Field(default=50.0, ge=0, le=100)
    combined_score: float = Field(default=50.0, ge=0, le=100)
    flags: list[str] = Field(default_factory=list)
    details: dict = Field(default_factory=dict)


class VoiceAnalysisResult(BaseModel):
    voice_stress_score: float = Field(default=50.0, ge=0, le=100)
    speech_rate_score: float = Field(default=50.0, ge=0, le=100)
    combined_score: float = Field(default=50.0, ge=0, le=100)
    flags: list[str] = Field(default_factory=list)
    details: dict = Field(default_factory=dict)


class NLPAnalysisResult(BaseModel):
    sentiment_score: float = Field(default=50.0, ge=0, le=100)
    hedging_score: float = Field(default=50.0, ge=0, le=100)
    diversity_score: float = Field(default=50.0, ge=0, le=100)
    combined_score: float = Field(default=50.0, ge=0, le=100)
    flags: list[str] = Field(default_factory=list)
    details: dict = Field(default_factory=dict)
