"""
FinSync Pro - FastAPI Backend
Agentic RAG Platform with Hybrid Search
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from config import HOST, PORT, CORS_ORIGINS, UPLOAD_DIR
from schemas.models import (
    ChatRequest,
    ChatResponse,
    DocumentStatus,
    DocumentListResponse,
    UploadResponse
)
from agents.rag_agent import run_agent
from ingestion.document_processor import (
    process_document,
    get_document_status,
    get_all_documents,
    ensure_upload_dir
)
from retrievers.vector_store import add_documents, initialize_vector_store
from retrievers.hybrid_retriever import update_bm25_corpus


# Initialize FastAPI app
app = FastAPI(
    title="FinSync Pro API",
    description="Agentic RAG Platform with Hybrid Search",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    """Initialize services on startup."""
    ensure_upload_dir()
    # Vector store initializes lazily when first document is uploaded
    print("✨ FinSync Pro initialized")


# ═══════════════════════════════════════════════════════════════════════════════
# CHAT ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main RAG chat endpoint.
    
    The agent automatically decides whether to use:
    - Web Search (for current/live information)
    - Vector Store (for uploaded documents)
    - Both (for comparative queries)
    """
    try:
        result = await run_agent(
            query=request.query,
            session_id=request.session_id or str(uuid.uuid4())
        )
        
        return ChatResponse(
            answer=result["answer"],
            trace=result["trace"],
            citations=result["citations"],
            session_id=result["session_id"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════════
# DOCUMENT UPLOAD ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF document for indexing.
    
    The document will be:
    1. Saved to uploads directory
    2. Chunked with metadata
    3. Indexed in FAISS (semantic) and BM25 (keyword)
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    try:
        # Save file
        ensure_upload_dir()
        file_path = Path(UPLOAD_DIR) / f"{uuid.uuid4()}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process document
        doc_id, documents = process_document(str(file_path), file.filename)
        
        # Add to vector stores
        add_documents(documents)
        update_bm25_corpus(documents)
        
        return UploadResponse(
            doc_id=doc_id,
            filename=file.filename,
            message=f"Successfully indexed {len(documents)} chunks"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents", response_model=DocumentListResponse)
async def list_documents():
    """List all indexed documents with their status."""
    documents = get_all_documents()
    return DocumentListResponse(
        documents=[
            DocumentStatus(
                doc_id=doc["doc_id"],
                filename=doc["filename"],
                status=doc["status"],
                chunks=doc.get("chunks"),
                error=doc.get("error")
            )
            for doc in documents
        ]
    )


@app.get("/api/documents/{doc_id}/status", response_model=DocumentStatus)
async def get_status(doc_id: str):
    """Get processing status of a specific document."""
    status = get_document_status(doc_id)
    
    if status.get("status") == "not_found":
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentStatus(
        doc_id=doc_id,
        filename=status.get("filename", "Unknown"),
        status=status["status"],
        chunks=status.get("chunks"),
        error=status.get("error")
    )


# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/health")
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "FinSync Pro"}


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
