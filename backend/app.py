import logging
import os
from pathlib import Path

from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

_env_dir = Path(__file__).resolve().parent
_cwd = Path.cwd()
for path in [
    _env_dir / ".env",
    _env_dir / ".env.local",
    _cwd / ".env",
    _cwd / ".env.local",
    _cwd / "backend" / ".env",
    _cwd / "backend" / ".env.local",
]:
    if path.exists():
        load_dotenv(path, override=False)

from backend.routers import thumbnail

app = FastAPI(title="ContentForge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(thumbnail.router)
