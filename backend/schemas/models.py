"""
Pydantic models for API request/response schemas.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
import uuid


class ChatRequest(BaseModel):
    """Request model for chat endpoint."""
    query: str = Field(..., description="User's question or message")
    session_id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Session ID for conversation memory"
    )


class Citation(BaseModel):
    """Individual citation/source reference."""
    source: str = Field(..., description="Source name (filename or 'Tavily Search')")
    page: Optional[int] = Field(None, description="Page number if from PDF")
    url: Optional[str] = Field(None, description="URL if from web search")
    text: str = Field(..., description="Exact text snippet")
    doc_id: Optional[str] = Field(None, description="Document ID")
    chunk_index: Optional[int] = Field(None, description="Chunk index in document")


class ChatResponse(BaseModel):
    """Response model for chat endpoint."""
    answer: str = Field(..., description="AI-generated answer")
    trace: List[str] = Field(
        default_factory=list,
        description="Sources used: 'Web Search', 'Vector Store'"
    )
    citations: List[Citation] = Field(
        default_factory=list,
        description="List of citations with source metadata"
    )
    session_id: str = Field(..., description="Session ID for follow-up queries")


class DocumentStatus(BaseModel):
    """Document processing status."""
    doc_id: str
    filename: str
    status: str = Field(..., description="'processing', 'ready', or 'error'")
    chunks: Optional[int] = Field(None, description="Number of chunks if ready")
    error: Optional[str] = Field(None, description="Error message if failed")


class UploadResponse(BaseModel):
    """Response for document upload."""
    doc_id: str
    filename: str
    message: str


class DocumentListResponse(BaseModel):
    """Response for listing all documents."""
    documents: List[DocumentStatus]
