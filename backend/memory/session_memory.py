"""
Session-based Conversational Memory Manager.
Uses ConversationBufferWindowMemory with configurable window size.
"""

from typing import Dict
from langchain_classic.memory import ConversationBufferWindowMemory
from config import MEMORY_WINDOW_K


# Server-side session storage
_sessions: Dict[str, ConversationBufferWindowMemory] = {}


def get_or_create_memory(session_id: str) -> ConversationBufferWindowMemory:
    """
    Get existing memory for session or create new one.
    
    Args:
        session_id: Unique session identifier
        
    Returns:
        ConversationBufferWindowMemory instance for the session
    """
    if session_id not in _sessions:
        _sessions[session_id] = ConversationBufferWindowMemory(
            k=MEMORY_WINDOW_K,
            memory_key="chat_history",
            return_messages=True,
            output_key="output"
        )
    return _sessions[session_id]


def clear_session(session_id: str) -> bool:
    """
    Clear memory for a specific session.
    
    Args:
        session_id: Session to clear
        
    Returns:
        True if session existed and was cleared
    """
    if session_id in _sessions:
        del _sessions[session_id]
        return True
    return False


def get_active_sessions_count() -> int:
    """Get count of active sessions."""
    return len(_sessions)
