"""
FAISS Vector Store Manager.
Handles vector store creation, updates, and persistence.
"""

import os
from typing import List, Optional
from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from config import VECTOR_STORE_DIR
from ingestion.document_processor import get_embeddings


# Global vector store instance
_vector_store: Optional[FAISS] = None


def get_vector_store() -> Optional[FAISS]:
    """Get the current vector store instance."""
    global _vector_store
    return _vector_store


def initialize_vector_store(documents: Optional[List[Document]] = None) -> Optional[FAISS]:
    """
    Initialize or load vector store.
    
    Args:
        documents: Optional initial documents to index
        
    Returns:
        FAISS vector store instance or None if no documents
    """
    global _vector_store
    
    embeddings = get_embeddings()
    store_path = Path(VECTOR_STORE_DIR)
    
    # Try to load existing store
    if store_path.exists() and (store_path / "index.faiss").exists():
        try:
            _vector_store = FAISS.load_local(
                str(store_path),
                embeddings,
                allow_dangerous_deserialization=True
            )
            
            # Add new documents if provided
            if documents:
                _vector_store.add_documents(documents)
                _vector_store.save_local(str(store_path))
        except Exception as e:
            print(f"Warning: Could not load existing vector store: {e}")
            if documents:
                _vector_store = FAISS.from_documents(documents, embeddings)
                store_path.mkdir(parents=True, exist_ok=True)
                _vector_store.save_local(str(store_path))
    
    elif documents:
        # Create new store with documents
        _vector_store = FAISS.from_documents(documents, embeddings)
        store_path.mkdir(parents=True, exist_ok=True)
        _vector_store.save_local(str(store_path))
    
    # Don't create placeholder - let it be None until documents are uploaded
    
    return _vector_store


def add_documents(documents: List[Document]) -> None:
    """
    Add documents to the vector store.
    
    Args:
        documents: Documents to add
    """
    global _vector_store
    
    if _vector_store is None:
        initialize_vector_store(documents)
    else:
        _vector_store.add_documents(documents)
        
        # Persist
        store_path = Path(VECTOR_STORE_DIR)
        store_path.mkdir(parents=True, exist_ok=True)
        _vector_store.save_local(str(store_path))


def get_retriever(k: int = 4):
    """
    Get a retriever from the vector store.
    
    Args:
        k: Number of documents to retrieve
        
    Returns:
        VectorStoreRetriever or None if no documents indexed
    """
    global _vector_store
    
    if _vector_store is None:
        return None
    
    return _vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k}
    )
