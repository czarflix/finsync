"""
Tavily Web Search Tool.
Wraps TavilySearchResults for real-time market news and data.
"""

from typing import List, Dict, Any
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import Tool

from config import TAVILY_API_KEY


def get_tavily_tool() -> Tool:
    """
    Get configured Tavily search tool for the agent.
    
    Returns:
        LangChain Tool wrapping TavilySearchResults
    """
    tavily_search = TavilySearchResults(
        api_key=TAVILY_API_KEY,
        max_results=5,
        search_depth="advanced",
        include_answer=True,
        include_raw_content=False
    )
    
    return Tool(
        name="web_search",
        description="""Use this tool to search for CURRENT, LIVE, or REAL-TIME information.
Use when the query asks about:
- Today's news, current events, latest updates
- Live stock prices, market data, Nifty, Sensex
- Current policies, regulations, government announcements
- Any information that needs to be up-to-date

Input should be the search query as a string.""",
        func=tavily_search.invoke
    )


def format_tavily_results(results: List[Dict[str, Any]]) -> List[Dict]:
    """
    Format Tavily results into citation format.
    
    Args:
        results: Raw Tavily search results
        
    Returns:
        List of formatted citations
    """
    citations = []
    
    for result in results:
        citations.append({
            "source": "Tavily Search",
            "url": result.get("url", ""),
            "text": result.get("content", result.get("answer", ""))[:500],
            "page": None,
            "doc_id": None,
            "chunk_index": None
        })
    
    return citations
