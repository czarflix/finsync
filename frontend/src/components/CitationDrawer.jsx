/**
 * CitationDrawer - Glassmorphic slide-out panel for citation details
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Globe, ExternalLink } from 'lucide-react';
import { SPRING_CONFIG } from '../config.js';

export default function CitationDrawer({ citation, isOpen, onClose }) {
  if (!citation) return null;

  const isWebSource = citation.source === 'Tavily Search' || citation.url;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={SPRING_CONFIG}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md 
                       glass-strong shadow-xl z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-surface-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isWebSource 
                      ? 'bg-accent-50 text-accent' 
                      : 'bg-success-light text-success'
                  }`}
                  style={isWebSource ? {} : { 
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success)'
                  }}
                  >
                    {isWebSource ? <Globe size={18} /> : <FileText size={18} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {isWebSource ? 'Web Source' : 'Document Source'}
                    </h3>
                    <p className="text-sm text-text-muted truncate max-w-[200px]">
                      {citation.source}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-100 
                           text-text-muted hover:text-text-primary
                           transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Metadata */}
                <div className="flex flex-wrap gap-2">
                  {citation.page && (
                    <span className="px-3 py-1 bg-surface-100 rounded-full text-xs font-medium text-text-secondary">
                      Page {citation.page}
                    </span>
                  )}
                  {citation.chunk_index !== null && citation.chunk_index !== undefined && (
                    <span className="px-3 py-1 bg-surface-100 rounded-full text-xs font-medium text-text-secondary">
                      Chunk {citation.chunk_index + 1}
                    </span>
                  )}
                </div>

                {/* URL if web source */}
                {citation.url && (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 
                             bg-accent-50 rounded-xl text-accent
                             hover:bg-accent-100 transition-colors
                             text-sm font-medium"
                  >
                    <ExternalLink size={16} />
                    <span className="truncate">{citation.url}</span>
                  </a>
                )}

                {/* Text excerpt */}
                <div>
                  <h4 className="text-sm font-medium text-text-secondary mb-2">
                    Excerpt
                  </h4>
                  <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                      {citation.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Citation Chip - Superscript clickable citation reference
 */
export function CitationChip({ index, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center
                 w-5 h-5 ml-0.5 
                 bg-accent-50 text-accent text-[10px] font-bold
                 rounded-full hover:bg-accent-100 
                 transition-colors cursor-pointer
                 align-super"
    >
      {index}
    </button>
  );
}
