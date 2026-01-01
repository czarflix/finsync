"""
FinSync Pro - Centralized Configuration
All API keys, weights, and settings in one place.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ═══════════════════════════════════════════════════════════════════════════════
# API KEYS (from environment)
# ═══════════════════════════════════════════════════════════════════════════════
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")  # HuggingFace Inference API token

# ═══════════════════════════════════════════════════════════════════════════════
# LLM SETTINGS
# ═══════════════════════════════════════════════════════════════════════════════
LLM_MODEL = "gpt-4o-mini"  # Fast model for quick responses
LLM_TEMPERATURE = 0

# ═══════════════════════════════════════════════════════════════════════════════
# RETRIEVER WEIGHTS (Hybrid Search - must sum to 1.0)
# ═══════════════════════════════════════════════════════════════════════════════
FAISS_WEIGHT = 0.5              # Semantic search weight
BM25_WEIGHT = 0.5               # Keyword search weight
RRF_K = 60                      # Reciprocal Rank Fusion constant

# ═══════════════════════════════════════════════════════════════════════════════
# CHUNKING SETTINGS
# ═══════════════════════════════════════════════════════════════════════════════
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# ═══════════════════════════════════════════════════════════════════════════════
# MEMORY SETTINGS
# ═══════════════════════════════════════════════════════════════════════════════
MEMORY_WINDOW_K = 5             # Last K conversation turns

# ═══════════════════════════════════════════════════════════════════════════════
# EMBEDDING SETTINGS (Free HuggingFace model)
# ═══════════════════════════════════════════════════════════════════════════════
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"  # Free, fast, 384 dims

# ═══════════════════════════════════════════════════════════════════════════════
# SERVER SETTINGS
# ═══════════════════════════════════════════════════════════════════════════════
HOST = "0.0.0.0"
PORT = 8000
CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]

# ═══════════════════════════════════════════════════════════════════════════════
# STORAGE PATHS
# ═══════════════════════════════════════════════════════════════════════════════
UPLOAD_DIR = "uploads"
VECTOR_STORE_DIR = "vector_store"
