"""
Interview Truth Analyzer — FastAPI Application
"""

import json
import os
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from config import UPLOAD_DIR
from database import get_db, init_db
from models import AnalysisResult
from schemas import AnalysisResponse, AnalysisListResponse
from analyzers.facial_analyzer import analyze_video
from analyzers.voice_analyzer import analyze_audio
from analyzers.nlp_analyzer import analyze_text
from scoring.truth_scorer import compute_truth_score


# ---- Lifespan ----

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    init_db()
    yield
    # cleanup if needed


# ---- App ----

app = FastAPI(
    title="Interview Truth Analyzer",
    description=(
        "AI-powered backend that analyzes interview video, audio, and transcript "
        "to generate a Truth Score and Confidence Score with behavioral flags."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Helpers ----

def _save_upload(upload: UploadFile, prefix: str) -> str:
    """Save an uploaded file to disk and return the path."""
    ext = os.path.splitext(upload.filename or "file")[1] or ".bin"
    filename = f"{prefix}_{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(upload.file.read())
    return path


def _cleanup(*paths: str):
    """Delete temporary files."""
    for p in paths:
        try:
            os.remove(p)
        except OSError:
            pass


def _row_to_response(row: AnalysisResult) -> dict:
    """Convert a DB row to a response dict."""
    return {
        "id": row.id,
        "candidate_name": row.candidate_name,
        "truth_score": row.truth_score,
        "confidence_score": row.confidence_score,
        "classification": row.classification,
        "behavioral_flags": row.get_behavioral_flags(),
        "detailed_analysis": row.get_detailed_analysis(),
        "created_at": row.created_at,
    }


# ---- Endpoints ----

@app.post("/analyze-interview", response_model=AnalysisResponse)
async def analyze_interview(
    candidate_name: str = Form(default="Unknown Candidate"),
    transcript: str = Form(default=""),
    video: UploadFile | None = File(default=None),
    audio: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    """
    Upload interview data (video, audio, and/or transcript) and receive
    a Truth Score, Confidence Score, and behavioral flags.
    """
    video_path = None
    audio_path = None

    try:
        # Save uploads
        if video is not None and video.filename:
            video_path = _save_upload(video, "video")
        if audio is not None and audio.filename:
            audio_path = _save_upload(audio, "audio")

        # Run analyzers
        facial_result = analyze_video(video_path) if video_path else None
        voice_result = analyze_audio(audio_path) if audio_path else None
        nlp_result = analyze_text(transcript) if transcript.strip() else None

        # Compute scores
        result = compute_truth_score(facial_result, voice_result, nlp_result)

        # Store in database
        db_row = AnalysisResult(
            candidate_name=candidate_name,
            truth_score=result["truth_score"],
            confidence_score=result["confidence_score"],
            classification=result["classification"],
            behavioral_flags=json.dumps(result["behavioral_flags"]),
            detailed_analysis=json.dumps(result["detailed_analysis"]),
        )
        db.add(db_row)
        db.commit()
        db.refresh(db_row)

        return _row_to_response(db_row)

    finally:
        # Cleanup uploaded files
        if video_path:
            _cleanup(video_path)
        if audio_path:
            _cleanup(audio_path)


@app.get("/results", response_model=AnalysisListResponse)
async def get_results(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Retrieve all analysis results with pagination."""
    total = db.query(AnalysisResult).count()
    rows = (
        db.query(AnalysisResult)
        .order_by(AnalysisResult.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {
        "total": total,
        "results": [_row_to_response(r) for r in rows],
    }


@app.get("/results/{result_id}", response_model=AnalysisResponse)
async def get_result(result_id: int, db: Session = Depends(get_db)):
    """Retrieve a single analysis result by ID."""
    row = db.query(AnalysisResult).filter(AnalysisResult.id == result_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Result not found")
    return _row_to_response(row)


@app.get("/")
async def root():
    """Health check / welcome endpoint."""
    return {
        "service": "Interview Truth Analyzer",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "POST /analyze-interview",
            "GET /results",
            "GET /results/{id}",
        ],
    }
