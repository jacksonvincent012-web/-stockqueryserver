from datetime import datetime
from typing import Any, Dict
from pydantic import BaseModel, Field


class Candle(BaseModel):
    symbol: str
    timeframe: str = "1m"
    open: float
    high: float
    low: float
    close: float
    volume: int = 0
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

    def __getitem__(self, item: str) -> Any:
        """Allow dictionary-style access: candle['high']"""
        return getattr(self, item)

    def __setitem__(self, key: str, value: Any) -> None:
        """Allow dictionary-style assignment: candle['high'] = max(...)"""
        setattr(self, key, value)

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()


class OHLCCandle(Candle):
    """Extended OHLCV Candle model with technical indicator support"""
    vwap: float = 0.0
    trades_count: int = 1
