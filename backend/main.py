import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.strategy import router as strategy_router
from core.config import settings
from computation.engine import get_backend

logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize computation backend on startup
    backend = get_backend()
    logger = logging.getLogger(__name__)
    if await backend.is_alive():
        logger.info(f"Initialized Wolfram backend in mode: {settings.wolfram_mode}")
    else:
        logger.warning("Wolfram backend initialization failed or is degraded")
    yield
    # Cleanup on shutdown if needed
    pass

app = FastAPI(title="Axiom API", version="1.0.0", lifespan=lifespan)

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
