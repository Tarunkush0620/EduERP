'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, ArrowLeft, Check, X, FileText, Award, Download, Filter } from 'lucide-react';
import apiClient from '@/lib/api-client';
import Link from 'next/link';

type SubmissionInfo = {
  student: { id: string; name: string; rollNumber: string };
  submission: { id: string; fileUrl: string; submittedAt: string; grade?: string; feedback?: string } | null;
  status: 'pending' | 'submitted' | 'graded';
};

export default function AssignmentSubmissionsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'graded', 'submitted', 'pending'

  useEffect(() => {
    if (id) fetchSubmissions();
  }, [id]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/assignments/${id}/submissions`);
      setSubmissions(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Mock data
      setSubmissions([
        { student: { id: 's1', name: 'John Doe', rollNumber: 'R101' }, submission: { id: 'sub1', fileUrl: '#', submittedAt: '2026-06-03T10:00:00Z', grade: 'A', feedback: 'Great work!' }, status: 'graded' },
        { student: { id: 's2', name: 'Jane Smith', rollNumber: 'R102' }, submission: { id: 'sub2', fileUrl: '#', submittedAt: '2026-06-04T08:00:00Z' }, status: 'submitted' },
        { student: { id: 's3', name: 'Mike Johnson', rollNumber: 'R103' }, submission: null, status: 'pending' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = submissions.filter(s => filter === 'all' ? true : s.status === filter);
  
  const submittedCount = submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  return (
    <div className="submissions-page animate-fade-in">
      <div className="page-header">
        <div className="header-left">
          <button onClick={() => router.back()} className="btn btn-ghost btn-icon mr-2">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title"><Users size={24} /> Submissions</h1>
            <p className="page-subtitle">Review and grade student submissions</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-pill bg-success-light text-success">
            <FileText size={14} /> {submittedCount} / {submissions.length} Submitted
          </div>
          <div className="stat-pill bg-primary-light text-primary">
            <Award size={14} /> {gradedCount} Graded
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="filter-group">
            <Filter size={16} className="text-muted" />
            <select className="input input-sm" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Students</option>
              <option value="submitted">Needs Grading</option>
              <option value="graded">Graded</option>
              <option value="pending">Not Submitted</option>
            </select>
          </div>
          <button className="btn btn-secondary btn-sm"><Download size={14} /> Download All</button>
        </div>

        {loading ? (
          <div className="loading-state">Loading submissions...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Submission</th>
                  <th>Grade</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.student.id}>
                    <td className="font-mono text-muted">{s.student.rollNumber}</td>
                    <td className="font-medium">{s.student.name}</td>
                    <td>
                      <span className={`status-badge status-${s.status}`}>
                        {s.status === 'graded' ? <Check size={14} /> : s.status === 'pending' ? <X size={14} /> : <FileText size={14} />}
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {s.submission ? (
                        <div className="submission-details">
                          <a href={s.submission.fileUrl} target="_blank" rel="noreferrer" className="link text-primary">View File</a>
                          <span className="text-xs text-muted block mt-1">{new Date(s.submission.submittedAt).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {s.submission?.grade ? (
                        <span className="grade-badge">{s.submission.grade}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-right">
                      {s.submission && s.status !== 'graded' && (
                        <button className="btn btn-sm btn-primary">Grade Now</button>
                      )}
                      {s.status === 'graded' && (
                        <button className="btn btn-sm btn-ghost">Edit Grade</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted">No students found matching this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .submissions-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .header-left { display: flex; align-items: flex-start; gap: 0.5rem; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; margin: 0; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        .mr-2 { margin-right: 0.5rem; }
        
        .header-stats { display: flex; gap: 0.75rem; }
        .stat-pill { display: flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.875rem; border-radius: var(--radius-full); font-size: 0.8125rem; font-weight: 600; }
        .bg-success-light { background: hsl(142, 76%, 42%, 0.15); }
        .text-success { color: hsl(142, 76%, 42%); }
        .bg-primary-light { background: hsl(222, 84%, 55%, 0.15); }
        .text-primary { color: hsl(222, 84%, 55%); }
        
        .card-toolbar { padding: 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.5); display: flex; justify-content: space-between; align-items: center; }
        .filter-group { display: flex; align-items: center; gap: 0.75rem; }
        .input-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; height: auto; }
        
        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .data-table th { text-align: left; padding: 0.875rem 1.25rem; color: hsl(var(--text-muted)); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; background: hsl(var(--surface) / 0.3); border-bottom: 1px solid hsl(var(--border)); }
        .data-table td { padding: 1rem 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.3); vertical-align: middle; }
        .data-table tbody tr:hover { background: hsl(var(--surface) / 0.2); }
        
        .font-mono { font-family: monospace; }
        .font-medium { font-weight: 500; color: hsl(var(--text-primary)); }
        .text-muted { color: hsl(var(--text-muted)); }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-xs { font-size: 0.75rem; }
        .mt-1 { margin-top: 0.25rem; }
        .block { display: block; }
        
        .status-badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.25rem 0.625rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 500; }
        .status-graded { background: hsl(222, 84%, 55%, 0.15); color: hsl(222, 84%, 65%); }
        .status-submitted { background: hsl(142, 76%, 42%, 0.15); color: hsl(142, 76%, 48%); }
        .status-pending { background: hsl(38, 92%, 55%, 0.15); color: hsl(38, 92%, 55%); }
        
        .link { text-decoration: none; font-weight: 500; }
        .link:hover { text-decoration: underline; }
        
        .grade-badge { display: inline-block; padding: 0.25rem 0.75rem; background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: var(--radius-md); font-weight: 700; color: hsl(var(--text-primary)); }
        
        .loading-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); }
      `}</style>
    </div>
  );
}
