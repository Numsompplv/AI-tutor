# LearnTutor Backend — FastAPI

## Prerequisites
- Python 3.10+
- MongoDB (local or Atlas)
- Ollama (optional, for AI features later)

## Setup

1. **Install MongoDB:**
   - Windows: https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Or use MongoDB Atlas (free cloud): https://www.mongodb.com/atlas

2. **Create virtual environment:**
   ```bash
   cd learn-tutor-backend
   python -m venv venv

   # Windows:
   venv\Scripts\activate

   # Mac/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Edit `.env` file** — update JWT_SECRET to something random.

5. **Start the server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

6. **Open API docs:** http://localhost:8000/docs

## API Endpoints

### Auth
```
POST /api/auth/register  — Create new account (email/phone)
POST /api/auth/login     — Login (returns JWT token)
POST /api/auth/google    — Google sign-in (auto-creates account)
GET  /api/auth/me        — Get current user (requires token)
PUT  /api/auth/me        — Update profile (requires token)
```

### Health
```
GET  /                   — API info
GET  /api/health         — Health check
```

## Project Structure
```
app/
├── main.py          — FastAPI app entry point
├── config.py        — Environment settings
├── database.py      — MongoDB connection
├── models/
│   └── user.py      — Pydantic schemas
├── routes/
│   └── auth.py      — Auth endpoints
└── utils/
    └── auth.py      — JWT + password hashing
```

## Testing with curl

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"123456"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"john@test.com","password":"123456"}'
```

**Get profile (use token from login):**
```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
