"""
Vector Store Retriever Tool.
Wraps the hybrid retriever for agent use.
"""

from typing import List, Dict
from langchain_core.tools import Tool
from langchain_core.documents import Document

from retrievers.hybrid_retriever import search_documents


def get_retriever_tool() -> Tool:
    """
    Get configured retriever tool for the agent.
    
    Returns:
        LangChain Tool wrapping the hybrid retriever
    """
    def search_wrapper(query: str) -> str:
        """Search uploaded documents and return results."""
        docs = search_documents(query, k=4)
        
        if not docs:
            return "No relevant documents found in the knowledge base."
        
        results = []
        for i, doc in enumerate(docs):
            source = doc.metadata.get("filename", "Unknown")
            page = doc.metadata.get("page", "?")
            # Return FULL content, not truncated
            content = doc.page_content
            results.append(f"[{i+1}] From {source} (Page {page}):\n{content}")
        
        return "\n\n".join(results)
    
    return Tool(
        name="document_search",
        description="""Use this tool to search through UPLOADED DOCUMENTS in the knowledge base.
Use when the query asks about:
- User's documents, policies, files
- "My" documents, "my" policy, "my" tax docs
- Specific uploaded PDFs
- Information that should be in the knowledge base

Input should be the search query as a string.""",
        func=search_wrapper
    )


def format_retriever_results(docs: List[Document]) -> List[Dict]:
    """
    Format retriever results into citation format.
    
    Args:
        docs: Retrieved documents
        
    Returns:
        List of formatted citations
    """
    citations = []
    
    for doc in docs:
        citations.append({
            "source": doc.metadata.get("filename", "Unknown"),
            "page": doc.metadata.get("page"),
            "text": doc.page_content[:500],
            "url": None,
            "doc_id": doc.metadata.get("doc_id"),
            "chunk_index": doc.metadata.get("chunk_index")
        })
    
    return citations
