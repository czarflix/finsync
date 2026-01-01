/**
 * DynamicIsland - Floating chat input bar with spring animations
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { SPRING_CONFIG } from '../config.js';

export default function DynamicIsland({ onSend, isLoading, isExpanded }) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <motion.div
      layout
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={SPRING_CONFIG}
      className="w-full max-w-3xl mx-auto"
    >
      <motion.form
        onSubmit={handleSubmit}
        layout
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={SPRING_CONFIG}
        className={`
          relative glass-strong rounded-2xl
          shadow-lg transition-shadow duration-300
          ${isFocused ? 'shadow-xl shadow-accent/10' : ''}
        `}
      >
        {/* Glow effect when focused */}
        <motion.div
          animate={{
            opacity: isFocused ? 1 : 0,
          }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/5 to-accent/10 pointer-events-none"
        />

        <div className="relative flex items-center gap-3 p-2 pl-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Sparkles 
              size={18} 
              className={`transition-colors ${isFocused ? 'text-accent' : 'text-text-muted'}`}
            />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents or the web..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none
                     text-sm text-text-primary placeholder:text-text-muted
                     disabled:opacity-50"
          />

          {/* Send button */}
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              flex-shrink-0 p-2.5 rounded-xl
              transition-all duration-200
              ${input.trim() && !isLoading
                ? 'bg-accent text-white shadow-md hover:shadow-lg'
                : 'bg-surface-100 text-text-muted'
              }
              disabled:cursor-not-allowed
            `}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </motion.button>
        </div>
      </motion.form>

      {/* Hint text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs text-text-muted mt-3"
      >
        Press Enter to send • Searches documents and web automatically
      </motion.p>
    </motion.div>
  );
}
