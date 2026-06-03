'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AiAssistant() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am EduERP AI. How can I help you today?' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!user) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/assistant', { prompt: userMessage });
      const responseText = res.data?.data?.response || res.data?.response || 'I am sorry, I am unable to process that right now.';
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: responseText }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'There was an error connecting to the AI service. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className={`ai-fab ${isOpen ? 'hidden' : ''}`} 
        onClick={() => setIsOpen(true)}
        title="Ask AI Assistant"
      >
        <Bot size={24} />
      </button>

      {/* Chat Window */}
      <div className={`ai-window card ${isOpen ? 'open' : ''}`}>
        <div className="ai-header">
          <div className="ai-title">
            <div className="ai-icon-bg">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-white">EduERP AI</h3>
              <p className="text-xs text-white opacity-80">Smart Assistant</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon text-white" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>
        
        <div className="ai-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-message-row ${msg.role === 'user' ? 'user-row' : 'assistant-row'}`}>
              {msg.role === 'assistant' && (
                <div className="ai-avatar"><Bot size={16} /></div>
              )}
              <div className={`ai-bubble ${msg.role}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="ai-message-row assistant-row">
              <div className="ai-avatar"><Bot size={16} /></div>
              <div className="ai-bubble assistant typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-footer">
          <form onSubmit={handleSend} className="ai-form">
            <input 
              type="text" 
              placeholder="Ask anything..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="ai-input"
            />
            <button type="submit" className="ai-send-btn" disabled={!input.trim() || loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .ai-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, hsl(262, 80%, 60%), hsl(222, 84%, 55%));
          color: white;
          border: none;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ai-fab:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(99, 102, 241, 0.5);
        }
        .ai-fab.hidden { display: none; }
        
        .ai-window {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 380px;
          height: 560px;
          max-height: calc(100vh - 48px);
          background: hsl(var(--bg-card));
          border-radius: var(--radius-lg);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
          border: 1px solid hsl(var(--border));
        }
        
        .ai-window.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        
        .ai-header {
          background: linear-gradient(135deg, hsl(262, 80%, 60%), hsl(222, 84%, 55%));
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .ai-title { display: flex; align-items: center; gap: 0.75rem; }
        .ai-icon-bg {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .ai-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: hsl(var(--bg-secondary));
        }
        
        .ai-message-row { display: flex; gap: 0.5rem; }
        .ai-message-row.user-row { justify-content: flex-end; }
        
        .ai-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, hsl(262, 80%, 60%), hsl(222, 84%, 55%));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          align-self: flex-end;
        }
        
        .ai-bubble {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 1.25rem;
          font-size: 0.875rem;
          line-height: 1.4;
        }
        
        .ai-bubble.assistant {
          background: hsl(var(--surface));
          color: hsl(var(--text-primary));
          border-bottom-left-radius: 0.25rem;
          border: 1px solid hsl(var(--border));
        }
        
        .ai-bubble.user {
          background: hsl(var(--primary));
          color: white;
          border-bottom-right-radius: 0.25rem;
        }
        
        .typing { display: flex; align-items: center; gap: 4px; padding: 1rem; }
        .dot { width: 6px; height: 6px; background: hsl(var(--text-muted)); border-radius: 50%; animation: pulse 1.5s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        
        .ai-footer {
          padding: 1rem;
          background: hsl(var(--surface));
          border-top: 1px solid hsl(var(--border));
        }
        
        .ai-form {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: hsl(var(--bg-secondary));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-full);
          padding: 0.25rem 0.25rem 0.25rem 1rem;
        }
        
        .ai-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.875rem;
          color: hsl(var(--text-primary));
        }
        
        .ai-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: hsl(var(--primary));
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .ai-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        @media (max-width: 640px) {
          .ai-window {
            width: calc(100vw - 32px);
            right: 16px;
            bottom: 16px;
            height: calc(100vh - 100px);
          }
          .ai-fab {
            right: 16px;
            bottom: 16px;
          }
        }
      `}</style>
    </>
  );
}
