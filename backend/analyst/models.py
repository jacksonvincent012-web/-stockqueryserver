import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class StockResponse(BaseModel):
    symbol: str = Field(..., example="AAPL")
    price: float = Field(..., example=191.25)
    volume: int = Field(..., example=12000)
    change_percent: float = Field(..., example=1.2)
    market_cap: Optional[float] = Field(default=None, example=3000000000000.0)


class AnalyticsResponse(BaseModel):
    top_gainers: List[str] = Field(..., example=["NVDA", "TSLA"])
    top_losers: List[str] = Field(..., example=["INTC", "IBM"])
    most_active: List[str] = Field(..., example=["AAPL", "AMZN"])
    sector_performance: Optional[Dict[str, Any]] = Field(default=None)


class AlertRuleCreate(BaseModel):
    symbol: str = Field(..., example="TSLA")
    condition: str = Field(..., description="Condition: ABOVE, BELOW, VOLUME_SPIKE, PERCENT_CHANGE", example="ABOVE")
    threshold: float = Field(..., example=250.0)


class AlertRule(BaseModel):
    rule_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    symbol: str = Field(..., example="TSLA")
    condition: str = Field(..., example="ABOVE")
    threshold: float = Field(..., example=250.0)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    status: str = Field(default="ACTIVE")


class AlertResponse(BaseModel):
    symbol: str = Field(..., example="TSLA")
    alert: str = Field(..., example="Price crossed above 250")
    status: str = Field(default="TRIGGERED", example="TRIGGERED")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")


class SearchRequest(BaseModel):
    query: str = Field(..., example="AA")
    limit: int = Field(default=10, le=50)


class CacheStatsResponse(BaseModel):
    hits: int = Field(..., example=120)
    misses: int = Field(..., example=15)
    capacity: int = Field(..., example=500)
    size: int = Field(..., example=45)
    hit_ratio: str = Field(..., example="88.89%")
