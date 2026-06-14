import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.strategy import router as strategy_router
from core.config import settings

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Axiom API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(strategy_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"service": "Axiom", "docs": "/docs"}
