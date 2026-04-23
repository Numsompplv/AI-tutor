from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.database import notebooks_collection
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/notebooks", tags=["Notebooks"])


# ── Models ──
class NotebookCreate(BaseModel):
    name: str
    desc: Optional[str] = ""
    color: Optional[str] = "#3b82f6"


class NotebookUpdate(BaseModel):
    name: Optional[str] = None
    desc: Optional[str] = None
    color: Optional[str] = None


def serialize(nb) -> dict:
    return {
        "id": str(nb["_id"]),
        "name": nb["name"],
        "desc": nb.get("desc", ""),
        "color": nb.get("color", "#3b82f6"),
        "docs": nb.get("docs", 0),
        "convos": nb.get("convos", 0),
        "user_id": nb["user_id"],
        "created_at": nb.get("created_at", datetime.utcnow()).isoformat(),
    }


# ── GET all notebooks for current user ──
@router.get("")
async def get_notebooks(user=Depends(get_current_user)):
    user_id = str(user["_id"])
    cursor = notebooks_collection.find({"user_id": user_id}).sort("created_at", -1)
    nbs = await cursor.to_list(length=100)
    return [serialize(n) for n in nbs]


# ── POST create notebook ──
@router.post("", status_code=201)
async def create_notebook(data: NotebookCreate, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    nb = {
        "user_id": user_id,
        "name": data.name.strip(),
        "desc": data.desc.strip() if data.desc else "",
        "color": data.color or "#3b82f6",
        "docs": 0,
        "convos": 0,
        "created_at": datetime.utcnow(),
    }
    result = await notebooks_collection.insert_one(nb)
    nb["_id"] = result.inserted_id
    return serialize(nb)


# ── PUT update notebook ──
@router.put("/{nb_id}")
async def update_notebook(nb_id: str, data: NotebookUpdate, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    nb = await notebooks_collection.find_one({"_id": ObjectId(nb_id), "user_id": user_id})
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")
    updates = {k: v for k, v in data.dict().items() if v is not None}
    await notebooks_collection.update_one({"_id": ObjectId(nb_id)}, {"$set": updates})
    nb.update(updates)
    return serialize(nb)


# ── DELETE notebook ──
@router.delete("/{nb_id}", status_code=204)
async def delete_notebook(nb_id: str, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    nb = await notebooks_collection.find_one({"_id": ObjectId(nb_id), "user_id": user_id})
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")
    await notebooks_collection.delete_one({"_id": ObjectId(nb_id)})
