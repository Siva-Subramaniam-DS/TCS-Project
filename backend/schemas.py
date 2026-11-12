from pydantic import BaseModel, Field


class RegisterIn(BaseModel):
    email: str
    password: str = Field(min_length=6)
    name: str


class LoginIn(BaseModel):
    email: str
    password: str


class ValuesIn(BaseModel):
    climate: float = Field(ge=0, le=5)
    water: float = Field(ge=0, le=5)
    energy: float = Field(ge=0, le=5)
    social: float = Field(ge=0, le=5)
    governance: float = Field(ge=0, le=5)


class RecommendIn(BaseModel):
    values: ValuesIn
    age: int = 22
    horizon_years: int = 5
    monthly_savings: float = 100
    drop_reaction: str = "hold"
    amount_gbp: float = 1000
    name: str | None = None


class AllocationIn(BaseModel):
    fund_id: int
    allocation_pct: float


class SavePortfolioIn(BaseModel):
    user_id: int | None = None
    name: str = "My Impact Portfolio"
    amount_gbp: float = 1000
    risk_profile: str | None = None
    allocations: list[AllocationIn]


class GreenwashIn(BaseModel):
    text: str = Field(min_length=8)
    fund_id: int | None = None
    fund_name: str | None = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatIn(BaseModel):
    message: str
    history: list[ChatMessage] = []
    context: str | None = None
