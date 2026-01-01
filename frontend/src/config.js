/**
 * FinSync Pro - Frontend Configuration
 * Centralized settings for API, UI, and features
 */

// ═══════════════════════════════════════════════════════════════════════════════
// API CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTANT: VITE_API_URL must include /api suffix!
// Example: https://finsync-ohhw.onrender.com/api
// Local dev uses /api which Vite proxies to localhost:8000
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ═══════════════════════════════════════════════════════════════════════════════
// UI SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
export const TYPEWRITER_SPEED = 15;           // ms per character
export const TYPEWRITER_VARIANCE = 10;        // random variance in ms

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf']
};
export const ALLOWED_EXTENSIONS = ['.pdf'];

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
export const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 400,
  damping: 30
};

export const SPRING_SOFT = {
  type: 'spring',
  stiffness: 200,
  damping: 25
};

export const SPRING_BOUNCY = {
  type: 'spring',
  stiffness: 500,
  damping: 20
};

// ═══════════════════════════════════════════════════════════════════════════════
// APP INFO
// ═══════════════════════════════════════════════════════════════════════════════
export const APP_NAME = 'FinSync Pro';
export const APP_TAGLINE = 'Agentic RAG Platform';
