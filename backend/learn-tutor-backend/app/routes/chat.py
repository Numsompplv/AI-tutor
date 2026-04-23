from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.database import conversations_collection, notebooks_collection, documents_collection
from app.utils.auth import get_current_user
from app.rag import rag_answer, free_learning_answer

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class MessageRequest(BaseModel):
    question: str
    notebook_id: Optional[str] = None
    topic: Optional[str] = None
    conversation_id: Optional[str] = None
    mode: Optional[str] = "explain"  # explain, quiz, feedback


class FeedbackRequest(BaseModel):
    question: str
    student_answer: str
    correct_answer: Optional[str] = None
    conversation_id: Optional[str] = None


def serialize_conversation(c) -> dict:
    return {
        "id": str(c["_id"]),
        "user_id": c["user_id"],
        "notebook_id": c.get("notebook_id"),
        "title": c.get("title", "New conversation"),
        "mode": c.get("mode", "free"),
        "messages": c.get("messages", []),
        "created_at": c.get("created_at", datetime.utcnow()).isoformat(),
    }


def route_to_agent(question: str, mode: str, notebook_id: str = None) -> dict:
    """Route request to appropriate agent based on mode."""
    try:
        from app.agents import run_explanation_crew, run_quiz_crew

        q_lower = question.lower()

        if mode == "quiz" or any(w in q_lower for w in ["quiz me", "test me", "give me questions", "practice questions"]):
            topic = question.replace("quiz me on", "").replace("quiz me about", "").replace("test me on", "").strip()
            return run_quiz_crew(topic or question, notebook_id)

        return run_explanation_crew(question, notebook_id)

    except Exception as e:
        print(f"Agent error, falling back to RAG: {e}")
        if notebook_id:
            return rag_answer(notebook_id, question)
        else:
            return free_learning_answer("general knowledge", question)


# ── GET conversations for a notebook ──
@router.get("/notebooks/{nb_id}/conversations")
async def get_conversations(nb_id: str, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    cursor = conversations_collection.find(
        {"notebook_id": nb_id, "user_id": user_id}
    ).sort("created_at", -1)
    convos = await cursor.to_list(length=50)
    return [serialize_conversation(c) for c in convos]


# ── POST send a message ──
@router.post("/message")
async def send_message(data: MessageRequest, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    now = datetime.utcnow()

    has_notebook = bool(data.notebook_id)

    if has_notebook:
        nb = await notebooks_collection.find_one({
            "_id": ObjectId(data.notebook_id),
            "user_id": user_id
        })
        if not nb:
            raise HTTPException(status_code=404, detail="Notebook not found")

        doc_count = await documents_collection.count_documents({"notebook_id": data.notebook_id})

        if doc_count > 0:
            result = route_to_agent(data.question, data.mode or "explain", data.notebook_id)
        else:
            result = free_learning_answer(data.topic or nb["name"], data.question)
    else:
        result = route_to_agent(data.question, data.mode or "explain", None)

    user_message = {
        "role": "user",
        "content": data.question,
        "time": now.strftime("%H:%M"),
        "timestamp": now.isoformat(),
    }
    assistant_message = {
        "role": "assistant",
        "content": result["answer"],
        "time": now.strftime("%H:%M"),
        "timestamp": now.isoformat(),
        "citations": result.get("citations", []),
        "mode": result.get("mode", "general"),
    }

    if data.conversation_id:
        await conversations_collection.update_one(
            {"_id": ObjectId(data.conversation_id)},
            {"$push": {"messages": {"$each": [user_message, assistant_message]}}}
        )
        convo_id = data.conversation_id
    else:
        title = data.question[:50] + "..." if len(data.question) > 50 else data.question
        convo = {
            "user_id": user_id,
            "notebook_id": data.notebook_id,
            "title": title,
            "mode": "rag" if has_notebook else "free",
            "messages": [user_message, assistant_message],
            "created_at": now,
        }
        result_db = await conversations_collection.insert_one(convo)
        convo_id = str(result_db.inserted_id)

        if has_notebook:
            await notebooks_collection.update_one(
                {"_id": ObjectId(data.notebook_id)},
                {"$inc": {"convos": 1}}
            )

    return {
        "conversation_id": convo_id,
        "answer": assistant_message["content"],
        "citations": assistant_message["citations"],
        "mode": assistant_message["mode"],
        "time": assistant_message["time"],
    }


# ── POST feedback on student answer ──
@router.post("/feedback")
async def get_feedback(data: FeedbackRequest, user=Depends(get_current_user)):
    try:
        from app.agents import run_feedback_crew
        result = run_feedback_crew(data.question, data.student_answer, data.correct_answer)
    except Exception as e:
        from app.rag import ask_ollama
        prompt = f"Evaluate this student answer.\nQuestion: {data.question}\nAnswer: {data.student_answer}\nProvide constructive feedback."
        result = {"answer": ask_ollama(prompt), "mode": "feedback", "citations": []}

    return {
        "feedback": result["answer"],
        "mode": result["mode"],
    }


# ── GET single conversation ──
@router.get("/conversations/{convo_id}")
async def get_conversation(convo_id: str, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    convo = await conversations_collection.find_one({
        "_id": ObjectId(convo_id),
        "user_id": user_id
    })
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return serialize_conversation(convo)