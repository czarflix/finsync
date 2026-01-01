"""
RAG Agent using OpenAI's native Tool Calling (JSON-based, no parsing errors).
Uses bind_tools for structured function calling instead of ReAct text parsing.
"""

from typing import List, Dict, Any, Tuple, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from config import LLM_MODEL, OPENAI_API_KEY
from tools.tavily_tool import get_tavily_tool
from tools.retriever_tool import get_retriever_tool
from memory.session_memory import get_or_create_memory
from retrievers.hybrid_retriever import search_documents


# System prompt for concise answers
SYSTEM_PROMPT = """You are FinSync Pro, a fast financial assistant.

Tools:
- document_search: Search user's uploaded PDFs/policies
- web_search: Get real-time web data (stocks, news, rates)

RULES:
1. Use document_search for "my policy", "my document"
2. Use web_search for live/current data
3. Give SHORT, DIRECT answers (1-2 sentences max)
4. No fluff, no explanations unless asked
5. Just state the fact/number"""


def get_llm_with_tools():
    """Get LLM with tools bound for structured calling."""
    llm = ChatOpenAI(
        model=LLM_MODEL,
        temperature=0,
        openai_api_key=OPENAI_API_KEY,
    )
    
    tools = [get_tavily_tool(), get_retriever_tool()]
    
    # Bind tools for structured JSON calling (no text parsing!)
    return llm.bind_tools(tools), tools


def create_tool_map(tools):
    """Create a mapping of tool names to tool functions."""
    return {tool.name: tool for tool in tools}


async def run_agent(
    query: str,
    session_id: str
) -> Dict[str, Any]:
    """
    Run the RAG agent on a query using OpenAI Tool Calling.
    
    Args:
        query: User's question
        session_id: Session ID for memory
        
    Returns:
        Dict with answer, trace, and citations
    """
    llm_with_tools, tools = get_llm_with_tools()
    tool_map = create_tool_map(tools)
    memory = get_or_create_memory(session_id)
    
    # Get chat history from memory
    chat_history = memory.load_memory_variables({}).get("chat_history", [])
    
    # Build messages with history
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add conversation history
    for msg in chat_history[-10:]:  # Last 10 messages (5 turns)
        if msg.type == "human":
            messages.append({"role": "user", "content": msg.content})
        else:
            messages.append({"role": "assistant", "content": msg.content})
    
    # Add current query
    messages.append({"role": "user", "content": query})
    
    trace = set()
    citations = []
    max_iterations = 5
    
    for _ in range(max_iterations):
        # Call the LLM
        response = await llm_with_tools.ainvoke(messages)
        
        # Check if there are tool calls
        if not response.tool_calls:
            # No tool calls, LLM is done - extract final answer
            final_answer = response.content
            break
        
        # Process each tool call
        messages.append(response)  # Add assistant message with tool calls
        
        for tool_call in response.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            
            # Track which tools were used
            if tool_name == "web_search":
                trace.add("Web Search")
            elif tool_name == "document_search":
                trace.add("Vector Store")
            
            # Execute the tool
            tool = tool_map.get(tool_name)
            if tool:
                try:
                    result = tool.invoke(tool_args.get("query", tool_args.get("__arg1", "")))
                    
                    # Extract citations from document search
                    if tool_name == "document_search":
                        docs = search_documents(tool_args.get("query", tool_args.get("__arg1", "")), k=4)
                        for doc in docs:
                            citations.append({
                                "source": doc.metadata.get("filename", "Unknown"),
                                "page": doc.metadata.get("page"),
                                "text": doc.page_content[:300],
                                "url": None,
                                "doc_id": doc.metadata.get("doc_id"),
                                "chunk_index": doc.metadata.get("chunk_index")
                            })
                    
                    # Add tool result to messages
                    messages.append(ToolMessage(
                        content=str(result) if result else "No results found.",
                        tool_call_id=tool_call["id"]
                    ))
                except Exception as e:
                    messages.append(ToolMessage(
                        content=f"Error executing tool: {str(e)}",
                        tool_call_id=tool_call["id"]
                    ))
            else:
                messages.append(ToolMessage(
                    content=f"Tool {tool_name} not found.",
                    tool_call_id=tool_call["id"]
                ))
    else:
        # Max iterations reached
        final_answer = response.content if response.content else "I found some information but couldn't formulate a complete answer. Please check the sources above."
    
    # Save to memory
    memory.save_context(
        {"input": query},
        {"output": final_answer}
    )
    
    return {
        "answer": final_answer,
        "trace": list(trace),
        "citations": citations,
        "session_id": session_id
    }
