'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, MoreVertical, Edit2, Trash2, Users } from 'lucide-react';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

type Assignment = {
  id: string;
  title: string;
  className: string;
  subjectName?: string;
  deadline: string;
  createdAt: string;
};

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/assignments/teacher');
      setAssignments(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Mock for UI dev
      setAssignments([
        { id: '1', title: 'Algebra Midterm Prep', className: 'Class 10-A', subjectName: 'Mathematics', deadline: '2026-06-15T23:59:00Z', createdAt: '2026-06-01T10:00:00Z' },
        { id: '2', title: 'Photosynthesis Lab Report', className: 'Class 9-B', subjectName: 'Science', deadline: '2026-06-10T23:59:00Z', createdAt: '2026-06-02T14:30:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = assignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.className.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="assignments-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><FileText size={24} /> Manage Assignments</h1>
          <p className="page-subtitle">Create and track assignments for your classes</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Create Assignment
        </button>
      </div>

      <div className="card list-card">
        <div className="list-header">
          <div className="search-bar">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search assignments..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading assignments...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No assignments found</h3>
            <p>You haven't created any assignments yet.</p>
            <button className="btn btn-outline mt-4">Create First Assignment</button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Class & Subject</th>
                  <th>Deadline</th>
                  <th>Posted On</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="a-title">{a.title}</div>
                    </td>
                    <td>
                      <div className="a-class">{a.className}</div>
                      <div className="a-subject">{a.subjectName || '-'}</div>
                    </td>
                    <td>
                      <div className="a-deadline">
                        <Calendar size={14} className={new Date(a.deadline) < new Date() ? 'text-danger' : 'text-warning'} />
                        {new Date(a.deadline).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="text-muted">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link href={`/teacher/assignments/${a.id}/submissions`} className="btn btn-sm btn-ghost action-btn submissions-btn">
                          <Users size={14} /> Submissions
                        </Link>
                        <button className="btn btn-sm btn-ghost action-btn"><Edit2 size={14} /></button>
                        <button className="btn btn-sm btn-ghost action-btn text-danger"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .assignments-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        
        .list-card { padding: 0; overflow: hidden; }
        .list-header { padding: 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.5); }
        .search-bar { display: flex; align-items: center; gap: 0.5rem; background: hsl(var(--surface) / 0.5); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid hsl(var(--border)); max-width: 400px; }
        .search-bar input { background: transparent; border: none; outline: none; font-size: 0.875rem; color: hsl(var(--text-primary)); width: 100%; }
        
        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .data-table th { text-align: left; padding: 0.75rem 1.25rem; color: hsl(var(--text-muted)); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; background: hsl(var(--surface) / 0.3); border-bottom: 1px solid hsl(var(--border)); }
        .data-table td { padding: 1rem 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.3); vertical-align: middle; }
        .data-table tbody tr:hover { background: hsl(var(--surface) / 0.2); }
        
        .a-title { font-weight: 600; color: hsl(var(--text-primary)); }
        .a-class { font-weight: 500; color: hsl(var(--text-secondary)); }
        .a-subject { font-size: 0.75rem; color: hsl(var(--text-muted)); }
        .a-deadline { display: inline-flex; align-items: center; gap: 0.375rem; font-weight: 500; }
        
        .text-warning { color: hsl(38, 92%, 55%); }
        .text-danger { color: hsl(0, 84%, 55%); }
        .text-muted { color: hsl(var(--text-muted)); }
        .text-right { text-align: right; }
        
        .action-buttons { display: flex; justify-content: flex-end; gap: 0.25rem; }
        .action-btn { padding: 0.375rem; height: auto; }
        .submissions-btn { background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); gap: 0.375rem; padding: 0.375rem 0.75rem; }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: hsl(var(--text-primary)); }
        .mt-4 { margin-top: 1rem; }
      `}</style>
    </div>
  );
}
