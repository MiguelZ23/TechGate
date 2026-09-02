from typing import Literal
from pydantic import BaseModel, Field

class AnalysisResponse(BaseModel):
    risk_level: Literal["low", "medium", "high"]
    score: int = Field(ge=0, le=100)
    summary: str
    reasons: list[str]
    actions: list[str]
    pipeline_version: str = "mock-v1"
