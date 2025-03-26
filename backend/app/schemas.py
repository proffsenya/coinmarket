from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    nickname: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: str
    nickname: str
    is_active: bool

    class Config:
        orm_mode = True



class PortfolioBase(BaseModel):
    name: str

class PortfolioCreate(PortfolioBase):
    pass

class PortfolioCryptoCreate(BaseModel):
    crypto_symbol: str
    quantity: float
    purchase_price: float

class Portfolio(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# schemas.py
class PortfolioCrypto(BaseModel):
    crypto_symbol: str
    quantity: float
    purchase_price: float
    purchase_date: datetime

    class Config:
        orm_mode = True

class PortfolioDetail(Portfolio):
    cryptos: list[PortfolioCrypto] = []