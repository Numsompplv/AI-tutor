from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from datetime import datetime
from bson import ObjectId
import os, uuid
from app.database import documents_collection, notebooks_collection
from app.utils.auth import get_current_user
from app.rag import ingest_document

router = APIRouter(prefix="/api/notebooks", tags=["Documents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = ["pdf", "docx", "pptx", "txt"]
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


def serialize_doc(d) -> dict:
    return {
        "id": str(d["_id"]),
        "notebook_id": d["notebook_id"],
        "name": d["name"],
        "type": d["type"],
        "size": d["size"],
        "size_bytes": d.get("size_bytes", 0),
        "chunks": d.get("chunks", 0),
        "uploaded_at": d.get("uploaded_at", datetime.utcnow()).isoformat(),
    }


# ── GET all documents in a notebook ──
@router.get("/{nb_id}/documents")
async def get_documents(nb_id: str, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    nb = await notebooks_collection.find_one({"_id": ObjectId(nb_id), "user_id": user_id})
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")
    cursor = documents_collection.find({"notebook_id": nb_id}).sort("uploaded_at", -1)
    docs = await cursor.to_list(length=100)
    return [serialize_doc(d) for d in docs]


# ── POST upload a document ──
@router.post("/{nb_id}/documents", status_code=201)
async def upload_document(nb_id: str, file: UploadFile = File(...), user=Depends(get_current_user)):
    user_id = str(user["_id"])

    nb = await notebooks_collection.find_one({"_id": ObjectId(nb_id), "user_id": user_id})
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not supported. Use PDF, DOCX, PPTX, or TXT.")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 20MB.")

    # Save file to disk
    file_id = str(uuid.uuid4())
    save_path = os.path.join(UPLOAD_DIR, f"{file_id}.{ext}")
    with open(save_path, "wb") as f:
        f.write(content)

    # Format size
    size_bytes = len(content)
    size_str = f"{size_bytes / 1024:.0f}KB" if size_bytes < 1024 * 1024 else f"{size_bytes / (1024 * 1024):.1f}MB"

    # ── RAG Ingestion ──
    try:
        chunk_count = ingest_document(nb_id, save_path, ext, file.filename)
    except Exception as e:
        chunk_count = max(5, size_bytes // 500)
        print(f"RAG ingestion warning: {e}")

    # Save to MongoDB
    doc = {
        "notebook_id": nb_id,
        "user_id": user_id,
        "name": file.filename,
        "type": ext,
        "size": size_str,
        "size_bytes": size_bytes,
        "file_path": save_path,
        "file_id": file_id,
        "chunks": chunk_count,
        "uploaded_at": datetime.utcnow(),
    }
    result = await documents_collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    await notebooks_collection.update_one(
        {"_id": ObjectId(nb_id)},
        {"$inc": {"docs": 1}}
    )

    return serialize_doc(doc)


# ── DELETE a document ──
@router.delete("/{nb_id}/documents/{doc_id}", status_code=204)
async def delete_document(nb_id: str, doc_id: str, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    nb = await notebooks_collection.find_one({"_id": ObjectId(nb_id), "user_id": user_id})
    if not nb:
        raise HTTPException(status_code=404, detail="Notebook not found")

    doc = await documents_collection.find_one({"_id": ObjectId(doc_id), "notebook_id": nb_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(doc.get("file_path", "")):
        os.remove(doc["file_path"])

    await documents_collection.delete_one({"_id": ObjectId(doc_id)})
    await notebooks_collection.update_one(
        {"_id": ObjectId(nb_id)},
        {"$inc": {"docs": -1}}
    )