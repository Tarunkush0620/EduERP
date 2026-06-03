'use client';

import { useState, useEffect } from 'react';
import { Bell, Megaphone, Clock, Search, Filter } from 'lucide-react';
import apiClient from '@/lib/api-client';

type Announcement = {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  createdAt: string;
  createdBy: string;
};

export default function AnnouncementsView({ role }: { role: string }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/communication/announcements');
      setAnnouncements(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Mock data
      setAnnouncements([
        { id: '1', title: 'Summer Break Schedule', content: 'School will remain closed from July 1st to August 15th for summer vacations. Ensure all assignments are submitted before the break.', targetAudience: 'all', createdAt: new Date().toISOString(), createdBy: 'admin_id' },
        { id: '2', title: 'Math Olympiad Registration', content: 'Registrations are now open for the Annual Math Olympiad. Contact your class teacher to sign up.', targetAudience: 'students', createdAt: new Date(Date.now() - 86400000).toISOString(), createdBy: 'teacher_id' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="announcements-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Megaphone size={24} /> Announcements</h1>
          <p className="page-subtitle">Stay updated with the latest school news and notices</p>
        </div>
        {(role === 'SUPER_ADMIN' || role === 'TEACHER') && (
          <button className="btn btn-primary"><Bell size={16} /> New Announcement</button>
        )}
      </div>

      <div className="content-layout">
        <div className="main-list">
          <div className="search-filter-bar">
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Search announcements..." />
            </div>
            <button className="btn btn-outline btn-icon"><Filter size={16} /></button>
          </div>

          {loading ? (
            <div className="loading-state">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="empty-state">
              <Megaphone size={48} className="text-muted" />
              <h3>No announcements</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="announcement-cards">
              {announcements.map(ann => (
                <div key={ann.id} className="card a-card">
                  <div className="a-header">
                    <h3 className="a-title">{ann.title}</h3>
                    <span className="badge">{ann.targetAudience.replace('_', ' ')}</span>
                  </div>
                  <p className="a-content">{ann.content}</p>
                  <div className="a-footer">
                    <div className="a-meta">
                      <Clock size={14} /> {new Date(ann.createdAt).toLocaleDateString()} at {new Date(ann.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .announcements-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        
        .search-filter-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
        .search-box { flex: 1; display: flex; align-items: center; gap: 0.5rem; background: hsl(var(--surface)); padding: 0.5rem 1rem; border-radius: var(--radius-md); border: 1px solid hsl(var(--border)); }
        .search-box input { background: transparent; border: none; outline: none; width: 100%; font-size: 0.875rem; color: hsl(var(--text-primary)); }
        
        .announcement-cards { display: flex; flex-direction: column; gap: 1rem; }
        .a-card { padding: 1.5rem; border-left: 4px solid hsl(var(--primary)); transition: transform 0.2s; }
        .a-card:hover { transform: translateX(4px); }
        
        .a-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
        .a-title { font-size: 1.125rem; font-weight: 600; margin: 0; color: hsl(var(--text-primary)); }
        .badge { font-size: 0.6875rem; font-weight: 600; padding: 0.25rem 0.5rem; background: hsl(var(--surface-hover)); border-radius: var(--radius-sm); text-transform: uppercase; letter-spacing: 0.05em; color: hsl(var(--text-secondary)); }
        
        .a-content { font-size: 0.9375rem; color: hsl(var(--text-secondary)); line-height: 1.5; margin-bottom: 1.25rem; }
        
        .a-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid hsl(var(--border) / 0.5); padding-top: 0.75rem; }
        .a-meta { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: hsl(var(--text-muted)); }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      `}</style>
    </div>
  );
}
