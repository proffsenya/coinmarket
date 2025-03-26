from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from . import models, schemas, crud, auth
from .database import SessionLocal, engine, get_db
from sqlalchemy.orm import Session, joinedload
from fastapi import status



models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/register/", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/login/")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me/", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.get("/portfolios/", response_model=list[schemas.Portfolio])
def get_portfolios(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    portfolios = db.query(models.Portfolio).filter(models.Portfolio.user_id == current_user.id).all()
    return portfolios 

# Новые эндпоинты
@app.post("/portfolios/", response_model=schemas.Portfolio)
def create_portfolio(
    portfolio: schemas.PortfolioCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_portfolio(db=db, portfolio=portfolio, user_id=current_user.id)

@app.post("/portfolios/{portfolio_id}/crypto")
def add_crypto(
    portfolio_id: int,
    crypto: schemas.PortfolioCryptoCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(models.Portfolio).filter(
        models.Portfolio.id == portfolio_id,
        models.Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    return crud.add_crypto_to_portfolio(db=db, portfolio_id=portfolio_id, crypto=crypto)

# main.py
@app.delete("/portfolios/{portfolio_id}")
def delete_portfolio(
    portfolio_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.delete_portfolio(
        db=db,
        portfolio_id=portfolio_id,
        user_id=current_user.id
    )

# main.py
@app.get("/portfolios/{portfolio_id}", response_model=schemas.PortfolioDetail)
def get_portfolio(
    portfolio_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    # Получаем портфель с криптовалютами
    portfolio = (
        db.query(models.Portfolio)
        .filter(
            models.Portfolio.id == portfolio_id,
            models.Portfolio.user_id == current_user.id,
        )
        .options(joinedload(models.Portfolio.cryptos))  # Автоматическая подгрузка крипты
        .first()
    )
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Портфель не найден")
    
    return portfolio

