"""
SQLAlchemy ORM models.
"""

import json
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    candidate_name = Column(String(255), nullable=False, default="Unknown")
    truth_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    classification = Column(String(50), nullable=False)
    behavioral_flags = Column(Text, nullable=False, default="[]")       # JSON list
    detailed_analysis = Column(Text, nullable=False, default="{}")      # JSON dict
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # ----- helpers -----
    def get_behavioral_flags(self) -> list:
        return json.loads(self.behavioral_flags)

    def get_detailed_analysis(self) -> dict:
        return json.loads(self.detailed_analysis)

    def __repr__(self):
        return (
            f"<AnalysisResult(id={self.id}, candidate='{self.candidate_name}', "
            f"truth={self.truth_score:.1f}, confidence={self.confidence_score:.1f})>"
        )
