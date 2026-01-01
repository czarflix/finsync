/**
 * useDocuments - Document upload and management hook
 */

import { useState, useCallback, useEffect } from 'react';
import { uploadDocument, getDocuments } from '../lib/api.js';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.documents || []);
    } catch (err) {
      // Silently fail on initial fetch - backend might not be ready
      console.log('Documents fetch skipped:', err.message);
    }
  }, []);

  const upload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);

    const results = [];

    for (const file of files) {
      const fileId = `${file.name}-${Date.now()}`;
      
      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: { filename: file.name, status: 'uploading', progress: 0 },
      }));

      try {
        const response = await uploadDocument(file);
        
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: { filename: file.name, status: 'complete', progress: 100 },
        }));

        results.push(response);

        // Add to documents list
        setDocuments((prev) => [
          ...prev,
          {
            doc_id: response.doc_id,
            filename: response.filename,
            status: 'ready',
          },
        ]);
      } catch (err) {
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: { filename: file.name, status: 'error', error: err.message },
        }));
        setError(err.message);
      }
    }

    setIsUploading(false);

    // Clear progress after delay
    setTimeout(() => {
      setUploadProgress({});
    }, 3000);

    return results;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    documents,
    isUploading,
    uploadProgress,
    error,
    upload,
    fetchDocuments,
    clearError,
  };
}
