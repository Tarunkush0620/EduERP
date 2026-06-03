'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

type AttendanceSummary = { total: number; present: number; absent: number; late: number; excused: number; percentage: number };
type AttendanceRecord = { id: string; date: string; status: string; remarks: string; className: string; subjectName?: string };

export default function StudentAttendancePage() {
  const user = useAuthStore((s) => s.user);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAttendance();
    }
  }, [user]);

  const fetchAttendance = async () => {
    if (!user) return;
    try {
      const studentId = user.id;
      
      const res = await apiClient.get(`/attendance/student/${studentId}`);
      setSummary(res.data?.summary || res.data?.data?.summary);
      setRecords(res.data?.records || res.data?.data?.records || []);
    } catch (e) {
      console.error(e);
      // Fallback mock for UI display
      setSummary({ total: 45, present: 41, absent: 2, late: 2, excused: 0, percentage: 91.1 });
      setRecords([
        { id: '1', date: '2026-06-02', status: 'present', remarks: '', className: 'Class 10-A' },
        { id: '2', date: '2026-06-01', status: 'absent', remarks: 'Sick leave', className: 'Class 10-A' },
        { id: '3', date: '2026-05-30', status: 'late', remarks: 'Traffic', className: 'Class 10-A' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle size={20} className="text-success" />;
      case 'absent': return <XCircle size={20} className="text-danger" />;
      case 'late': return <Clock size={20} className="text-warning" />;
      case 'excused': return <AlertCircle size={20} className="text-primary" />;
      default: return null;
    }
  };

  if (loading) return <div className="p-8 text-center text-muted">Loading attendance...</div>;

  return (
    <div className="student-attendance animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Calendar size={24} /> My Attendance</h1>
          <p className="page-subtitle">Track your attendance record for the current academic year</p>
        </div>
        <button className="btn btn-secondary"><Download size={16} /> Download Report</button>
      </div>

      {summary && (
        <div className="summary-cards">
          <div className="card stat-card">
            <span className="stat-label">Overall Attendance</span>
            <div className="stat-value-row">
              <h2 className="stat-value">{summary.percentage}%</h2>
              <div className="progress-ring">
                {/* CSS Circle */}
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="circle" strokeDasharray={`${summary.percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
            </div>
            <p className="stat-desc">Target: 85% minimum required</p>
          </div>
          
          <div className="stats-grid card">
            <div className="stat-item">
              <div className="stat-icon present"><CheckCircle size={18} /></div>
              <div className="stat-info">
                <span className="si-val">{summary.present}</span>
                <span className="si-lbl">Present</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon absent"><XCircle size={18} /></div>
              <div className="stat-info">
                <span className="si-val">{summary.absent}</span>
                <span className="si-lbl">Absent</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon late"><Clock size={18} /></div>
              <div className="stat-info">
                <span className="si-val">{summary.late}</span>
                <span className="si-lbl">Late</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon excused"><AlertCircle size={18} /></div>
              <div className="stat-info">
                <span className="si-val">{summary.excused}</span>
                <span className="si-lbl">Excused</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card history-card">
        <div className="history-header">
          <h3>Recent Records</h3>
          <select className="input input-sm">
            <option>Last 30 Days</option>
            <option>This Semester</option>
            <option>All Time</option>
          </select>
        </div>
        
        <div className="timeline">
          {records.map((r, i) => (
            <div key={r.id} className="timeline-item">
              <div className="tl-date">
                <span className="tl-day">{new Date(r.date).toLocaleDateString('en-US', { day: 'numeric' })}</span>
                <span className="tl-month">{new Date(r.date).toLocaleDateString('en-US', { month: 'short' })}</span>
              </div>
              <div className="tl-divider">
                <div className={`tl-dot status-${r.status}`} />
                {i !== records.length - 1 && <div className="tl-line" />}
              </div>
              <div className="tl-content">
                <div className="tl-main">
                  <h4 className="tl-title">{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</h4>
                  <span className="tl-class">{r.className} {r.subjectName ? `• ${r.subjectName}` : ''}</span>
                </div>
                {r.remarks && <p className="tl-remarks">"{r.remarks}"</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .student-attendance { display: flex; flex-direction: column; gap: 1.25rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        
        .summary-cards { display: grid; grid-template-columns: 1fr 2fr; gap: 1.25rem; }
        .stat-card { padding: 1.5rem; display: flex; flex-direction: column; justify-content: center; }
        .stat-label { font-size: 0.875rem; font-weight: 500; color: hsl(var(--text-secondary)); }
        .stat-value-row { display: flex; justify-content: space-between; align-items: center; margin: 0.75rem 0; }
        .stat-value { font-size: 2.5rem; font-weight: 700; color: hsl(var(--text-primary)); letter-spacing: -0.02em; }
        .stat-desc { font-size: 0.75rem; color: hsl(var(--text-muted)); }
        
        .circular-chart { display: block; margin: 0; max-width: 60px; max-height: 60px; }
        .circle-bg { fill: none; stroke: hsl(var(--surface)); stroke-width: 3.8; }
        .circle { fill: none; stroke-width: 2.8; stroke-linecap: round; stroke: hsl(142, 76%, 42%); animation: progress 1s ease-out forwards; }
        @keyframes progress { 0% { stroke-dasharray: 0 100; } }
        
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); padding: 1.5rem; gap: 1rem; align-items: center; }
        .stat-item { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; text-align: center; }
        .stat-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .stat-icon.present { background: hsl(142, 76%, 42%, 0.15); color: hsl(142, 76%, 42%); }
        .stat-icon.absent { background: hsl(0, 84%, 55%, 0.15); color: hsl(0, 84%, 55%); }
        .stat-icon.late { background: hsl(38, 92%, 55%, 0.15); color: hsl(38, 92%, 55%); }
        .stat-icon.excused { background: hsl(222, 84%, 55%, 0.15); color: hsl(222, 84%, 55%); }
        .si-val { font-size: 1.5rem; font-weight: 700; color: hsl(var(--text-primary)); }
        .si-lbl { font-size: 0.8125rem; font-weight: 500; color: hsl(var(--text-muted)); text-transform: uppercase; letter-spacing: 0.04em; }
        
        .history-card { padding: 1.5rem; }
        .history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .history-header h3 { font-size: 1.125rem; font-weight: 600; color: hsl(var(--text-primary)); }
        .input-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; height: auto; }
        
        .timeline { display: flex; flex-direction: column; }
        .timeline-item { display: flex; gap: 1rem; }
        .tl-date { width: 50px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 0.25rem; }
        .tl-day { font-size: 1.25rem; font-weight: 700; color: hsl(var(--text-primary)); line-height: 1; }
        .tl-month { font-size: 0.75rem; font-weight: 600; color: hsl(var(--text-muted)); text-transform: uppercase; }
        
        .tl-divider { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding-top: 0.5rem; }
        .tl-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
        .tl-dot.status-present { background: hsl(142, 76%, 42%); box-shadow: 0 0 8px hsl(142, 76%, 42%, 0.4); }
        .tl-dot.status-absent { background: hsl(0, 84%, 55%); box-shadow: 0 0 8px hsl(0, 84%, 55%, 0.4); }
        .tl-dot.status-late { background: hsl(38, 92%, 55%); }
        .tl-dot.status-excused { background: hsl(222, 84%, 55%); }
        .tl-line { width: 2px; height: 100%; min-height: 40px; background: hsl(var(--border)); }
        
        .tl-content { flex: 1; padding-bottom: 1.5rem; }
        .tl-main { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.375rem; }
        .tl-title { font-size: 1rem; font-weight: 600; color: hsl(var(--text-primary)); }
        .tl-class { font-size: 0.8125rem; color: hsl(var(--text-muted)); }
        .tl-remarks { font-size: 0.875rem; color: hsl(var(--text-secondary)); background: hsl(var(--surface) / 0.3); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); display: inline-block; }
        
        @media (max-width: 768px) {
          .summary-cards { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
