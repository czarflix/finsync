/**
 * TraceBar - Shows which knowledge sources were used
 */

import { motion } from 'framer-motion';
import { Globe, FileText } from 'lucide-react';

export default function TraceBar({ trace = [] }) {
  if (!trace || trace.length === 0) return null;

  const hasWeb = trace.includes('Web Search');
  const hasVector = trace.includes('Vector Store');

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <span className="text-xs text-text-muted">Sources:</span>
      
      {hasWeb && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 
                     bg-accent-50 text-accent-600 rounded-full
                     text-xs font-medium"
        >
          <Globe size={12} />
          Web
        </motion.span>
      )}

      {hasVector && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: hasWeb ? 0.1 : 0 }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 
                     bg-success-light text-success rounded-full
                     text-xs font-medium"
          style={{ 
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success)'
          }}
        >
          <FileText size={12} />
          Docs
        </motion.span>
      )}
    </motion.div>
  );
}
