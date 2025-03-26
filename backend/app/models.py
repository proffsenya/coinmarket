from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from datetime import datetime
from .database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Добавьте отношение с каскадным удалением
    cryptos = relationship("PortfolioCrypto", backref="portfolio", cascade="all, delete")

class PortfolioCrypto(Base):
    __tablename__ = "portfolio_crypto"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey('portfolios.id'))
    crypto_symbol = Column(String)
    quantity = Column(Float)
    purchase_price = Column(Float)
    purchase_date = Column(DateTime, default=datetime.utcnow)