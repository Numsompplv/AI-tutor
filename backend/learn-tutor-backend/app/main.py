from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routes import auth, notebooks, documents, chat

app = FastAPI(
    title="LearnTutor API",
    description="AI-Powered Personalized Learning Tutor Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notebooks.router)
app.include_router(documents.router)
app.include_router(chat.router)


@app.on_event("startup")
async def startup():
    await init_db()
    print("✅ Database initialized")
    print(f"✅ Server running on http://{settings.host}:{settings.port}")
    print(f"✅ API docs at http://{settings.host}:{settings.port}/docs")


@app.get("/")
async def root():
    return {"app": "LearnTutor API", "version": "1.0.0", "status": "running", "docs": "/docs"}


@app.get("/api/health")
async def health():
    return {"status": "ok"}