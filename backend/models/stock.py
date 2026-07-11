from typing import Optional
from pydantic import BaseModel, Field


class StockMetadata(BaseModel):
    symbol: str
    company_name: str
    sector: str
    industry: str
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    beta: Optional[float] = None
    eps: Optional[float] = None
    dividend_yield: Optional[float] = None
    exchange: str = "NASDAQ"
    is_active: bool = True


class Stock(BaseModel):
    symbol: str
    name: str
    last_price: float = 0.0
    change: float = 0.0
    change_percent: float = 0.0
    volume: int = 0
    high_52w: float = 0.0
    low_52w: float = 0.0
