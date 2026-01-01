/**
 * FinSync Pro - Main Application
 * Agentic RAG Platform with Industrial Noir & Milk Design
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

import DynamicIsland from './components/DynamicIsland.jsx';
import ChatMessage from './components/ChatMessage.jsx';
import DocumentSidebar from './components/DocumentSidebar.jsx';
import { MessageSkeleton } from './components/SkeletonLoader.jsx';

import { useChat } from './hooks/useChat.js';
import { useDocuments } from './hooks/useDocuments.js';

import { APP_NAME, APP_TAGLINE, SPRING_CONFIG, SPRING_SOFT } from './config.js';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lastMessageId, setLastMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const { documents, upload, uploadProgress, isUploading } = useDocuments();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Track last message for typewriter effect
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessageId(messages[messages.length - 1].id);
    }
  }, [messages.length]);

  const handleSend = async (query) => {
    await sendMessage(query);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={SPRING_CONFIG}
            className="flex-shrink-0 h-full border-r border-surface-200 
                       bg-surface-0 overflow-hidden"
          >
            <DocumentSidebar
              documents={documents}
              onUpload={upload}
              uploadProgress={uploadProgress}
              isUploading={isUploading}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between 
                          px-6 py-4 border-b border-surface-200 bg-surface-0/80 
                          backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-surface-100 
                       text-text-secondary hover:text-text-primary
                       transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-accent to-accent-dark
                            shadow-md">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-text-primary">{APP_NAME}</h1>
                <p className="text-xs text-text-muted">{APP_TAGLINE}</p>
              </div>
            </div>
          </div>

          {/* Clear chat button */}
          {hasMessages && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearChat}
              className="px-3 py-1.5 text-xs font-medium 
                       text-text-muted hover:text-text-primary
                       hover:bg-surface-100 rounded-lg transition-colors"
            >
              Clear chat
            </motion.button>
          )}
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Empty state */}
            {!hasMessages && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
              >
                <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 
                              rounded-2xl mb-6">
                  <Sparkles size={40} className="text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  Welcome to {APP_NAME}
                </h2>
                <p className="text-text-muted max-w-md">
                  Upload your documents and ask questions. I'll search through your 
                  files and the web to give you accurate, cited answers.
                </p>

                {/* Example queries */}
                <div className="mt-8 flex flex-wrap gap-2 justify-center">
                  {[
                    'What is the Nifty 50 today?',
                    'Summarize my uploaded policy',
                    'Compare regulations with latest news',
                  ].map((query, i) => (
                    <motion.button
                      key={query}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      onClick={() => handleSend(query)}
                      className="px-4 py-2 text-sm
                               bg-surface-50 hover:bg-surface-100
                               border border-surface-200 hover:border-accent/30
                               rounded-full text-text-secondary hover:text-accent
                               transition-all"
                    >
                      {query}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            {hasMessages && (
              <div className="space-y-6">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isNew={message.id === lastMessageId && message.role === 'assistant'}
                  />
                ))}

                {/* Loading skeleton */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full 
                                   bg-gradient-to-br from-accent to-accent-dark
                                   flex items-center justify-center shadow-md">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <MessageSkeleton />
                  </motion.div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 p-6 border-t border-surface-200 bg-surface-0/80 backdrop-blur-sm">
          <DynamicIsland
            onSend={handleSend}
            isLoading={isLoading}
            isExpanded={hasMessages}
          />
        </div>
      </main>
    </div>
  );
}
