'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, User } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

type Message = {
  id: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
  receiverName?: string;
};

export default function MessagesView({ role }: { role: string }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'inbox' ? '/communication/messages/inbox' : '/communication/messages/sent';
      const res = await apiClient.get(endpoint);
      setMessages(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Mock data
      if (activeTab === 'inbox') {
        setMessages([
          { id: '1', subject: 'Inquiry regarding Syllabus', body: 'Dear Sir, could you please share the updated syllabus for Mathematics?', isRead: false, createdAt: new Date().toISOString(), senderName: 'Alice Student' },
          { id: '2', subject: 'Leave Application', body: 'I will be on leave for 2 days due to a family emergency.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString(), senderName: 'Bob Teacher' },
        ]);
      } else {
        setMessages([
          { id: '3', subject: 'Warning: Low Attendance', body: 'Please note that your attendance has fallen below 75%.', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString(), receiverName: 'Charlie Student' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="messages-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><MessageSquare size={24} /> Messages</h1>
          <p className="page-subtitle">Communicate with teachers, students, and administration</p>
        </div>
        <button className="btn btn-primary" onClick={() => setComposeOpen(true)}>
          <Send size={16} /> Compose Message
        </button>
      </div>

      <div className="messaging-layout">
        <div className="sidebar card">
          <div className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveTab('inbox')}
            >
              Inbox
              {activeTab === 'inbox' && <span className="badge-count">2</span>}
            </button>
            <button 
              className={`nav-item ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
          </div>
        </div>

        <div className="main-content card">
          <div className="content-header">
            <h3 className="font-semibold capitalize">{activeTab}</h3>
            <div className="search-box">
              <Search size={14} />
              <input type="text" placeholder="Search messages..." />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} className="text-muted" />
              <h3>No messages</h3>
              <p>Your {activeTab} is empty.</p>
            </div>
          ) : (
            <div className="message-list">
              {messages.map(msg => (
                <div key={msg.id} className={`message-item ${!msg.isRead && activeTab === 'inbox' ? 'unread' : ''}`}>
                  <div className="msg-avatar">
                    <User size={20} />
                  </div>
                  <div className="msg-content">
                    <div className="msg-meta">
                      <span className="msg-author">{activeTab === 'inbox' ? msg.senderName : `To: ${msg.receiverName}`}</span>
                      <span className="msg-date">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="msg-subject">{msg.subject}</div>
                    <div className="msg-body">{msg.body}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {composeOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h3 className="modal-title">New Message</h3>
            <div className="form-group">
              <label>To</label>
              <input type="text" className="form-input" placeholder="Select recipient..." />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" className="form-input" placeholder="Enter subject..." />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea className="form-textarea" rows={5} placeholder="Type your message here..."></textarea>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setComposeOpen(false)}>Cancel</button>
              <button className="btn btn-primary"><Send size={16} /> Send</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .messages-container { display: flex; flex-direction: column; gap: 1.5rem; height: calc(100vh - 120px); }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        
        .messaging-layout { display: grid; grid-template-columns: 240px 1fr; gap: 1.5rem; flex: 1; min-height: 0; }
        
        .sidebar { padding: 1rem 0; }
        .sidebar-nav { display: flex; flex-direction: column; }
        .nav-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.5rem; background: transparent; border: none; text-align: left; font-size: 0.875rem; font-weight: 500; color: hsl(var(--text-secondary)); cursor: pointer; transition: all 0.2s; border-left: 3px solid transparent; }
        .nav-item:hover { background: hsl(var(--surface) / 0.5); color: hsl(var(--text-primary)); }
        .nav-item.active { background: hsl(var(--surface)); color: hsl(var(--primary-light)); border-left-color: hsl(var(--primary)); font-weight: 600; }
        
        .badge-count { background: hsl(var(--primary)); color: white; padding: 0.125rem 0.5rem; border-radius: var(--radius-full); font-size: 0.6875rem; }
        
        .main-content { padding: 0; display: flex; flex-direction: column; overflow: hidden; }
        .content-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid hsl(var(--border) / 0.5); display: flex; justify-content: space-between; align-items: center; }
        
        .search-box { display: flex; align-items: center; gap: 0.5rem; background: hsl(var(--surface)); padding: 0.375rem 0.75rem; border-radius: var(--radius-md); border: 1px solid hsl(var(--border)); width: 250px; }
        .search-box input { background: transparent; border: none; outline: none; font-size: 0.8125rem; width: 100%; color: hsl(var(--text-primary)); }
        
        .message-list { flex: 1; overflow-y: auto; }
        .message-item { display: flex; gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid hsl(var(--border) / 0.3); cursor: pointer; transition: background 0.2s; }
        .message-item:hover { background: hsl(var(--surface) / 0.3); }
        .message-item.unread { background: hsl(var(--surface) / 0.6); }
        .message-item.unread .msg-author { font-weight: 700; color: hsl(var(--text-primary)); }
        .message-item.unread .msg-subject { font-weight: 600; color: hsl(var(--text-primary)); }
        
        .msg-avatar { width: 40px; height: 40px; border-radius: 50%; background: hsl(var(--surface)); display: flex; align-items: center; justify-content: center; color: hsl(var(--text-muted)); flex-shrink: 0; }
        .msg-content { flex: 1; min-width: 0; }
        
        .msg-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
        .msg-author { font-size: 0.875rem; font-weight: 500; color: hsl(var(--text-secondary)); }
        .msg-date { font-size: 0.75rem; color: hsl(var(--text-muted)); }
        
        .msg-subject { font-size: 0.9375rem; margin-bottom: 0.375rem; color: hsl(var(--text-secondary)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-body { font-size: 0.875rem; color: hsl(var(--text-muted)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
        .modal-content { width: 100%; max-width: 500px; padding: 2rem; }
        .modal-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; }
        
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: hsl(var(--text-secondary)); margin-bottom: 0.5rem; }
        .form-input, .form-textarea { width: 100%; padding: 0.75rem; border: 1px solid hsl(var(--border)); border-radius: var(--radius-md); background: hsl(var(--surface)); color: hsl(var(--text-primary)); font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
        .form-input:focus, .form-textarea:focus { border-color: hsl(var(--primary)); }
        
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; }
        
        .font-semibold { font-weight: 600; }
        .capitalize { text-transform: capitalize; }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      `}</style>
    </div>
  );
}
