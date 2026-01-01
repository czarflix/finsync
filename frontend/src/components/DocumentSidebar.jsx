/**
 * DocumentSidebar - Shows indexed documents and upload zone
 */

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Check, Loader2, AlertCircle, FolderOpen } from 'lucide-react';
import UploadZone from './UploadZone.jsx';
import { SPRING_SOFT } from '../config.js';

export default function DocumentSidebar({ 
  documents = [], 
  onUpload, 
  uploadProgress, 
  isUploading 
}) {
  const hasDocuments = documents.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-surface-200">
        <h2 className="font-semibold text-text-primary">Knowledge Base</h2>
        <p className="text-xs text-text-muted mt-1">
          {hasDocuments 
            ? `${documents.length} document${documents.length === 1 ? '' : 's'} indexed`
            : 'No documents yet'
          }
        </p>
      </div>

      {/* Upload zone */}
      <div className="p-4 border-b border-surface-200">
        <UploadZone
          onUpload={onUpload}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
        />
      </div>

      {/* Documents list */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {hasDocuments ? (
            <motion.div layout className="space-y-2">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.doc_id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ ...SPRING_SOFT, delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 
                           bg-surface-50 hover:bg-surface-100
                           rounded-lg transition-colors group"
                >
                  {/* Status icon */}
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${doc.status === 'ready' ? 'bg-success-light text-success' : ''}
                    ${doc.status === 'processing' ? 'bg-warning-light text-warning' : ''}
                    ${doc.status === 'error' ? 'bg-error-light text-error' : ''}
                  `}
                  style={
                    doc.status === 'ready' 
                      ? { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }
                      : doc.status === 'processing'
                      ? { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }
                      : doc.status === 'error'
                      ? { backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }
                      : {}
                  }
                  >
                    {doc.status === 'ready' && <Check size={16} />}
                    {doc.status === 'processing' && <Loader2 size={16} className="animate-spin" />}
                    {doc.status === 'error' && <AlertCircle size={16} />}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {doc.filename}
                    </p>
                    <p className="text-xs text-text-muted">
                      {doc.status === 'ready' && doc.chunks && `${doc.chunks} chunks`}
                      {doc.status === 'processing' && 'Processing...'}
                      {doc.status === 'error' && 'Failed'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-8"
            >
              <div className="p-4 bg-surface-100 rounded-full mb-3">
                <FolderOpen size={24} className="text-text-muted" />
              </div>
              <p className="text-sm text-text-muted">
                Upload PDFs to get started
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
