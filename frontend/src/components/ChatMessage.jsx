/**
 * ChatMessage - Individual message with typewriter effect and citations
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import TraceBar from './TraceBar.jsx';
import CitationDrawer, { CitationChip } from './CitationDrawer.jsx';
import { TYPEWRITER_SPEED, TYPEWRITER_VARIANCE } from '../config.js';

export default function ChatMessage({ message, isNew = false }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isUser = message.role === 'user';
  const isError = message.isError;

  // Typewriter effect for new assistant messages
  useEffect(() => {
    if (!isUser && isNew && message.content) {
      setIsTyping(true);
      setDisplayedText('');

      let index = 0;
      const text = message.content;

      const typeNextChar = () => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
          
          // Random variance for natural feel
          const delay = TYPEWRITER_SPEED + (Math.random() * TYPEWRITER_VARIANCE);
          setTimeout(typeNextChar, delay);
        } else {
          setIsTyping(false);
        }
      };

      typeNextChar();
    } else {
      setDisplayedText(message.content);
    }
  }, [message.content, isUser, isNew]);

  // Parse content to insert citation chips
  const renderedContent = useMemo(() => {
    if (!message.citations || message.citations.length === 0) {
      return displayedText;
    }

    // For now, append citations at the end
    // In a full implementation, you'd parse the text for [1], [2] markers
    return displayedText;
  }, [displayedText, message.citations]);

  const handleCitationClick = (citation, index) => {
    setSelectedCitation({ ...citation, index });
    setDrawerOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {/* Avatar for assistant */}
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full 
                         bg-gradient-to-br from-accent to-accent-dark
                         flex items-center justify-center shadow-md">
            <Sparkles size={16} className="text-white" />
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-accent text-white rounded-br-md'
              : isError
              ? 'bg-error-light text-error border border-error/20 rounded-bl-md'
              : 'glass rounded-bl-md'
          }`}
          style={isError ? { 
            backgroundColor: 'var(--color-error-light)',
            color: 'var(--color-error)'
          } : {}}
        >
          {/* Trace bar for assistant */}
          {!isUser && !isError && message.trace && message.trace.length > 0 && (
            <div className="mb-2">
              <TraceBar trace={message.trace} />
            </div>
          )}

          {/* Message content */}
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isUser ? 'text-white' : 'text-text-primary'
          }`}>
            {renderedContent}
            {isTyping && <span className="cursor-blink" />}
          </p>

          {/* Citations */}
          {!isUser && message.citations && message.citations.length > 0 && !isTyping && (
            <div className="mt-3 pt-3 border-t border-surface-200/50">
              <div className="flex flex-wrap gap-1.5">
                {message.citations.map((citation, idx) => (
                  <CitationChip
                    key={idx}
                    index={idx + 1}
                    onClick={() => handleCitationClick(citation, idx + 1)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar for user */}
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full 
                         bg-surface-200
                         flex items-center justify-center">
            <User size={16} className="text-text-secondary" />
          </div>
        )}
      </motion.div>

      {/* Citation drawer */}
      <CitationDrawer
        citation={selectedCitation}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
