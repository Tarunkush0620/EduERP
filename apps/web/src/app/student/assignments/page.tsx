'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, CheckCircle2, Clock, Upload, ArrowRight, User } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

type Assignment = {
  id: string;
  title: string;
  subjectName?: string;
  teacherName: string;
  deadline: string;
  fileUrl?: string;
  submissionStatus: 'pending' | 'submitted' | 'graded';
  submission?: {
    fileUrl?: string;
    submittedAt: string;
    grade?: string;
    feedback?: string;
  };
};

export default function StudentAssignmentsPage() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'completed'

  useEffect(() => {
    if (user?.id) fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/assignments/student');
      setAssignments(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Mock Data
      setAssignments([
        { id: '1', title: 'Algebra Worksheet', subjectName: 'Mathematics', teacherName: 'Alice Smith', deadline: '2026-06-10T23:59:00Z', submissionStatus: 'pending' },
        { id: '2', title: 'Science Project Draft', subjectName: 'Science', teacherName: 'Bob Jones', deadline: '2026-05-25T23:59:00Z', submissionStatus: 'graded', submission: { submittedAt: '2026-05-24T10:00:00Z', grade: 'A', feedback: 'Excellent work.' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = assignments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'pending') return a.submissionStatus === 'pending';
    if (filter === 'completed') return a.submissionStatus !== 'pending';
    return true;
  });

  return (
    <div className="assignments-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><FileText size={24} /> My Assignments</h1>
          <p className="page-subtitle">Track and submit your coursework</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`tab-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          To Do ({assignments.filter(a => a.submissionStatus === 'pending').length})
        </button>
        <button className={`tab-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
          Completed
        </button>
        <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All Assignments
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading assignments...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <CheckCircle2 size={48} className="text-success" />
          <h3>All caught up!</h3>
          <p>You have no {filter === 'pending' ? 'pending' : ''} assignments.</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {filtered.map(a => {
            const isLate = new Date() > new Date(a.deadline) && a.submissionStatus === 'pending';
            
            return (
              <div key={a.id} className="assignment-card card">
                <div className="ac-header">
                  <div className="ac-subject">{a.subjectName || 'General'}</div>
                  <span className={`status-badge status-${a.submissionStatus}`}>
                    {a.submissionStatus === 'pending' ? 'To Do' : a.submissionStatus.charAt(0).toUpperCase() + a.submissionStatus.slice(1)}
                  </span>
                </div>
                
                <h3 className="ac-title">{a.title}</h3>
                
                <div className="ac-meta">
                  <div className="meta-item">
                    <User size={14} /> {a.teacherName}
                  </div>
                  <div className={`meta-item ${isLate ? 'text-danger font-semibold' : ''}`}>
                    <Calendar size={14} /> Due: {new Date(a.deadline).toLocaleDateString()}
                  </div>
                </div>
                
                {a.submissionStatus === 'graded' && a.submission && (
                  <div className="grade-box">
                    <div className="grade-score">Grade: <strong>{a.submission.grade}</strong></div>
                    {a.submission.feedback && <div className="grade-feedback">"{a.submission.feedback}"</div>}
                  </div>
                )}
                
                <div className="ac-footer">
                  {a.fileUrl && (
                    <a href={a.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost view-btn">
                      View Resource
                    </a>
                  )}
                  
                  {a.submissionStatus === 'pending' ? (
                    <button className="btn btn-sm btn-primary submit-btn">
                      Submit Work <Upload size={14} />
                    </button>
                  ) : (
                    <button className="btn btn-sm btn-secondary submit-btn">
                      View Submission <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .assignments-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        
        .filter-tabs { display: flex; gap: 0.5rem; border-bottom: 1px solid hsl(var(--border)); padding-bottom: 0.5rem; }
        .tab-btn { background: transparent; border: none; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: hsl(var(--text-muted)); cursor: pointer; border-radius: var(--radius-md); transition: all 0.2s; }
        .tab-btn:hover { background: hsl(var(--surface)); color: hsl(var(--text-primary)); }
        .tab-btn.active { background: hsl(var(--primary) / 0.15); color: hsl(var(--primary-light)); }
        
        .assignments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
        
        .assignment-card { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; transition: transform 0.2s, box-shadow 0.2s; }
        .assignment-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -4px hsl(var(--shadow) / 0.1); }
        
        .ac-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .ac-subject { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: hsl(var(--primary-light)); }
        
        .status-badge { font-size: 0.6875rem; font-weight: 600; padding: 0.25rem 0.625rem; border-radius: var(--radius-full); text-transform: uppercase; }
        .status-pending { background: hsl(38, 92%, 55%, 0.15); color: hsl(38, 92%, 55%); }
        .status-submitted { background: hsl(222, 84%, 55%, 0.15); color: hsl(222, 84%, 65%); }
        .status-graded { background: hsl(142, 76%, 42%, 0.15); color: hsl(142, 76%, 48%); }
        
        .ac-title { font-size: 1.125rem; font-weight: 600; color: hsl(var(--text-primary)); line-height: 1.3; }
        
        .ac-meta { display: flex; flex-direction: column; gap: 0.5rem; }
        .meta-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: hsl(var(--text-secondary)); }
        
        .grade-box { background: hsl(142, 76%, 42%, 0.1); border: 1px solid hsl(142, 76%, 42%, 0.2); border-radius: var(--radius-md); padding: 0.75rem; margin-top: 0.5rem; }
        .grade-score { font-size: 0.875rem; color: hsl(142, 76%, 48%); margin-bottom: 0.25rem; }
        .grade-score strong { font-size: 1rem; font-weight: 700; }
        .grade-feedback { font-size: 0.8125rem; font-style: italic; color: hsl(var(--text-secondary)); }
        
        .ac-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid hsl(var(--border) / 0.5); padding-top: 1rem; }
        
        .view-btn { font-size: 0.8125rem; }
        .submit-btn { display: flex; align-items: center; gap: 0.375rem; }
        
        .text-danger { color: hsl(0, 84%, 55%); }
        .text-success { color: hsl(142, 76%, 42%); }
        .font-semibold { font-weight: 600; }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: hsl(var(--text-primary)); margin: 0; }
        .empty-state p { margin: 0; font-size: 0.875rem; }
      `}</style>
    </div>
  );
}
