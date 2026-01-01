/**
 * API Client for FinSync Pro Backend
 */

import { API_BASE_URL } from '../config.js';

/**
 * Send a chat message to the RAG agent
 * @param {string} query - User's question
 * @param {string|null} sessionId - Optional session ID for conversation memory
 * @returns {Promise<{answer: string, trace: string[], citations: Array, session_id: string}>}
 */
export async function sendChatMessage(query, sessionId = null) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to send message');
  }

  return response.json();
}

/**
 * Upload a PDF document
 * @param {File} file - PDF file to upload
 * @returns {Promise<{doc_id: string, filename: string, message: string}>}
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to upload document');
  }

  return response.json();
}

/**
 * Get list of all indexed documents
 * @returns {Promise<{documents: Array}>}
 */
export async function getDocuments() {
  const response = await fetch(`${API_BASE_URL}/documents`);

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  return response.json();
}

/**
 * Get status of a specific document
 * @param {string} docId - Document ID
 * @returns {Promise<{doc_id: string, filename: string, status: string, chunks?: number, error?: string}>}
 */
export async function getDocumentStatus(docId) {
  const response = await fetch(`${API_BASE_URL}/documents/${docId}/status`);

  if (!response.ok) {
    throw new Error('Failed to fetch document status');
  }

  return response.json();
}

/**
 * Health check
 * @returns {Promise<{status: string, service: string}>}
 */
export async function healthCheck() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}
