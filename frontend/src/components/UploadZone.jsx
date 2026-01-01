/**
 * UploadZone - Drag and drop file upload with progress
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES, SPRING_SOFT } from '../config.js';

export default function UploadZone({ onUpload, uploadProgress = {}, isUploading }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    disabled: isUploading,
  });

  const progressItems = Object.entries(uploadProgress);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: isUploading ? 1 : 1.01 }}
        whileTap={{ scale: isUploading ? 1 : 0.99 }}
        className={`
          relative rounded-xl border-2 border-dashed p-6
          transition-all cursor-pointer
          ${isDragActive 
            ? 'border-accent bg-accent-50' 
            : 'border-surface-300 hover:border-accent/50 hover:bg-surface-50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={`
            p-3 rounded-full
            ${isDragActive ? 'bg-accent text-white' : 'bg-surface-100 text-text-muted'}
            transition-colors
          `}>
            <Upload size={24} />
          </div>
          
          <div>
            <p className="text-sm font-medium text-text-primary">
              {isDragActive ? 'Drop files here' : 'Drag & drop PDFs'}
            </p>
            <p className="text-xs text-text-muted mt-1">
              or click to browse
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upload progress */}
      <AnimatePresence>
        {progressItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {progressItems.map(([id, item]) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={SPRING_SOFT}
                className="flex items-center gap-3 p-3 bg-surface-50 rounded-lg"
              >
                {/* Icon */}
                <div className={`
                  p-1.5 rounded-lg
                  ${item.status === 'complete' ? 'bg-success-light text-success' : ''}
                  ${item.status === 'uploading' ? 'bg-accent-50 text-accent' : ''}
                  ${item.status === 'error' ? 'bg-error-light text-error' : ''}
                `}
                style={
                  item.status === 'complete' 
                    ? { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }
                    : item.status === 'error'
                    ? { backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)' }
                    : {}
                }
                >
                  {item.status === 'uploading' && <Loader2 size={14} className="animate-spin" />}
                  {item.status === 'complete' && <Check size={14} />}
                  {item.status === 'error' && <AlertCircle size={14} />}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {item.filename}
                  </p>
                  {item.error && (
                    <p className="text-xs text-error mt-0.5" style={{ color: 'var(--color-error)' }}>
                      {item.error}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
