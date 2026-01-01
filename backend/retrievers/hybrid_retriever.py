"""
Hybrid Retriever with FAISS + BM25 and Reciprocal Rank Fusion.
Combines semantic search with keyword matching for better recall.
"""

from typing import List, Optional
from langchain_core.documents import Document
from langchain_classic.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

from config import FAISS_WEIGHT, BM25_WEIGHT
from retrievers.vector_store import get_retriever as get_faiss_retriever


# BM25 document corpus
_bm25_documents: List[Document] = []
_bm25_retriever: Optional[BM25Retriever] = None
_ensemble_retriever: Optional[EnsembleRetriever] = None


def update_bm25_corpus(documents: List[Document]) -> None:
    """
    Update the BM25 retriever with new documents.
    
    Args:
        documents: Documents to add to BM25 corpus
    """
    global _bm25_documents, _bm25_retriever, _ensemble_retriever
    
    _bm25_documents.extend(documents)
    
    if _bm25_documents:
        _bm25_retriever = BM25Retriever.from_documents(
            _bm25_documents,
            k=4
        )
        # Reset ensemble to force rebuild
        _ensemble_retriever = None


def get_hybrid_retriever(k: int = 4) -> Optional[EnsembleRetriever]:
    """
    Get the hybrid ensemble retriever combining FAISS and BM25.
    Uses Reciprocal Rank Fusion for result merging.
    
    Args:
        k: Number of documents to retrieve from each retriever
        
    Returns:
        EnsembleRetriever with FAISS + BM25, or None if no documents
    """
    global _ensemble_retriever, _bm25_retriever
    
    if _ensemble_retriever is not None:
        return _ensemble_retriever
    
    faiss_retriever = get_faiss_retriever(k=k)
    
    # If no FAISS retriever (no documents indexed yet)
    if faiss_retriever is None:
        # Use BM25 only if available
        if _bm25_retriever is not None:
            _ensemble_retriever = EnsembleRetriever(
                retrievers=[_bm25_retriever],
                weights=[1.0]
            )
            return _ensemble_retriever
        return None
    
    # If no BM25 corpus yet, return just FAISS wrapped in ensemble
    if _bm25_retriever is None:
        _ensemble_retriever = EnsembleRetriever(
            retrievers=[faiss_retriever],
            weights=[1.0]
        )
    else:
        _ensemble_retriever = EnsembleRetriever(
            retrievers=[faiss_retriever, _bm25_retriever],
            weights=[FAISS_WEIGHT, BM25_WEIGHT]
        )
    
    return _ensemble_retriever


def search_documents(query: str, k: int = 4) -> List[Document]:
    """
    Search documents using hybrid retrieval.
    
    Args:
        query: Search query
        k: Number of results
        
    Returns:
        List of relevant documents with metadata
    """
    retriever = get_hybrid_retriever(k=k)
    if retriever is None:
        return []
    return retriever.invoke(query)
