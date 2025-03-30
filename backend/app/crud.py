from sqlalchemy.orm import Session
from . import models, schemas, auth
from fastapi import HTTPException

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        nickname=user.nickname,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# crud.py
def delete_portfolio(db: Session, portfolio_id: int, user_id: int):
    portfolio = db.query(models.Portfolio).filter(
        models.Portfolio.id == portfolio_id,
        models.Portfolio.user_id == user_id
    ).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Портфель не найден")
    
    db.delete(portfolio)
    db.commit()
    return {"status": "success", "message": "Портфель удален"}


def create_portfolio(db: Session, portfolio: schemas.PortfolioCreate, user_id: int):
    count = db.query(models.Portfolio).filter(models.Portfolio.user_id == user_id).count()
    if count >= 5:
        raise HTTPException(status_code=400, detail="Можно создать только 5 портфелей")
    
    db_portfolio = models.Portfolio(**portfolio.dict(), user_id=user_id)
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

def add_crypto_to_portfolio(db: Session, portfolio_id: int, crypto: schemas.PortfolioCryptoCreate):
    db_crypto = models.PortfolioCrypto(**crypto.dict(), portfolio_id=portfolio_id)
    db.add(db_crypto)
    db.commit()
    db.refresh(db_crypto)
    return db_crypto


# crud.py
def delete_crypto_from_portfolio(
    db: Session, 
    portfolio_id: int, 
    crypto_id: int, 
    user_id: int
):
    # Проверка принадлежности портфеля
    portfolio = db.query(models.Portfolio).filter(
        models.Portfolio.id == portfolio_id,
        models.Portfolio.user_id == user_id
    ).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Портфель не найден")
    
    # Поиск и удаление криптовалюты
    crypto = db.query(models.PortfolioCrypto).filter(
        models.PortfolioCrypto.id == crypto_id,
        models.PortfolioCrypto.portfolio_id == portfolio_id
    ).first()
    
    if not crypto:
        raise HTTPException(status_code=404, detail="Криптовалюта не найдена")
    
    db.delete(crypto)
    db.commit()
    return {"status": "success"}