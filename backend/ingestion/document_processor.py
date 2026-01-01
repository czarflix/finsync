"""
Document Processing Pipeline.
Handles PDF ingestion, chunking, and embedding generation.
"""

import os
import uuid
from typing import Dict, List, Tuple
from pathlib import Path

from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_core.documents import Document

from config import (
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    EMBEDDING_MODEL,
    HF_TOKEN,
    UPLOAD_DIR
)


# Document status tracking
_document_status: Dict[str, Dict] = {}

# Cache embeddings model (loads once)
_embeddings_model = None


def get_text_splitter() -> RecursiveCharacterTextSplitter:
    """Get configured text splitter."""
    return RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )


def get_embeddings() -> HuggingFaceEndpointEmbeddings:
    """Get HuggingFace Inference API embeddings (cloud-based, no local download)."""
    global _embeddings_model
    if _embeddings_model is None:
        print(f"🔄 Initializing HF Embeddings with model: {EMBEDDING_MODEL}")
        _embeddings_model = HuggingFaceEndpointEmbeddings(
            model=EMBEDDING_MODEL,
            huggingfacehub_api_token=HF_TOKEN
        )
    return _embeddings_model


def extract_text_from_pdf(file_path: str) -> List[Tuple[str, int]]:
    """
    Extract text from PDF with page numbers.
    
    Args:
        file_path: Path to PDF file
        
    Returns:
        List of (text, page_number) tuples
    """
    reader = PdfReader(file_path)
    pages = []
    
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            pages.append((text, i + 1))
    
    return pages


def process_document(file_path: str, filename: str) -> Tuple[str, List[Document]]:
    """
    Process a PDF document into chunks with metadata.
    
    Args:
        file_path: Path to uploaded PDF
        filename: Original filename
        
    Returns:
        Tuple of (doc_id, list of Document chunks)
    """
    doc_id = str(uuid.uuid4())
    
    # Update status to processing
    _document_status[doc_id] = {
        "filename": filename,
        "status": "processing",
        "chunks": None,
        "error": None
    }
    
    try:
        # Extract text from PDF
        pages = extract_text_from_pdf(file_path)
        
        if not pages:
            raise ValueError("No text could be extracted from PDF")
        
        # Chunk the text
        splitter = get_text_splitter()
        documents = []
        chunk_index = 0
        
        for page_text, page_number in pages:
            chunks = splitter.split_text(page_text)
            
            for chunk in chunks:
                doc = Document(
                    page_content=chunk,
                    metadata={
                        "doc_id": doc_id,
                        "filename": filename,
                        "page": page_number,
                        "chunk_index": chunk_index,
                        "source": filename
                    }
                )
                documents.append(doc)
                chunk_index += 1
        
        # Update status to ready
        _document_status[doc_id]["status"] = "ready"
        _document_status[doc_id]["chunks"] = len(documents)
        
        return doc_id, documents
        
    except Exception as e:
        _document_status[doc_id]["status"] = "error"
        _document_status[doc_id]["error"] = str(e)
        raise


def get_document_status(doc_id: str) -> Dict:
    """Get status of a document."""
    return _document_status.get(doc_id, {
        "status": "not_found",
        "error": "Document ID not found"
    })


def get_all_documents() -> List[Dict]:
    """Get status of all documents."""
    return [
        {"doc_id": doc_id, **status}
        for doc_id, status in _document_status.items()
    ]


def ensure_upload_dir():
    """Ensure upload directory exists."""
    Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
