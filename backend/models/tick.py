from datetime import datetime
from typing import Any, Dict, Union
from pydantic import BaseModel, Field


class TickCreate(BaseModel):
    symbol: str = Field(..., description="Stock ticker symbol, e.g., NVDA, AAPL")
    price: float = Field(..., gt=0, description="Execution price per share")
    volume: int = Field(..., gt=0, description="Number of shares traded")
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="ISO-8601 formatted UTC timestamp"
    )

    def __getitem__(self, item: str) -> Any:
        """Allow dictionary-style access: tick['symbol']"""
        return getattr(self, item)

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump()


class Tick(TickCreate):
    id: Union[int, None] = None

    class Config:
        from_attributes = True
