'use client';

import {
  ClipboardCheck, FileText, BookOpen, MessageSquare, Clock,
  Users, TrendingUp, CheckCircle2, AlertCircle, Calendar,
  Upload, Megaphone,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useEffect, useState } from 'react';

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get('/dashboard/teacher');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-[hsl(var(--text-muted))]">Loading dashboard data...</div>;
  if (!data) return <div className="p-8 text-[hsl(var(--danger))]">Failed to load dashboard</div>;

  return (
    <div className="teacher-dashboard animate-fade-in">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Good Morning, Teacher! 👋</h1>
          <p className="dash-subtitle">Here&apos;s your day at a glance</p>
        </div>
        <span className="badge badge-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          <Calendar size={14} /> {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Today's Summary Cards */}
      <div className="summary-grid stagger-children">
        <div className="summary-card card">
          <div className="summary-icon" style={{ background: 'hsl(222, 84%, 55%, 0.15)', color: 'hsl(222, 84%, 65%)' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <p className="summary-label">Classes Today</p>
            <h3 className="summary-value">{data.summary.classesToday}</h3>
          </div>
        </div>
        <div className="summary-card card">
          <div className="summary-icon" style={{ background: 'hsl(38, 92%, 55%, 0.15)', color: 'hsl(38, 92%, 55%)' }}>
            <FileText size={22} />
          </div>
          <div>
            <p className="summary-label">Pending Assignments</p>
            <h3 className="summary-value">{data.summary.pendingAssignments}</h3>
          </div>
        </div>
        <div className="summary-card card">
          <div className="summary-icon" style={{ background: 'hsl(0, 84%, 55%, 0.15)', color: 'hsl(0, 84%, 55%)' }}>
            <ClipboardCheck size={22} />
          </div>
          <div>
            <p className="summary-label">Attendance Pending</p>
            <h3 className="summary-value">{data.summary.attendancePending} Classes</h3>
          </div>
        </div>
        <div className="summary-card card">
          <div className="summary-icon" style={{ background: 'hsl(262, 80%, 60%, 0.15)', color: 'hsl(262, 80%, 65%)' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <p className="summary-label">Unread Messages</p>
            <h3 className="summary-value">{data.summary.unreadMessages}</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-bar">
        <button className="btn btn-primary"><ClipboardCheck size={16} /> Mark Attendance</button>
        <button className="btn btn-secondary"><FileText size={16} /> Create Assignment</button>
        <button className="btn btn-secondary"><Upload size={16} /> Upload Notes</button>
        <button className="btn btn-secondary"><CheckCircle2 size={16} /> Enter Marks</button>
        <button className="btn btn-secondary"><Megaphone size={16} /> Send Announcement</button>
      </div>

      {/* Schedule + Pending Work */}
      <div className="teacher-grid">
        {/* Today's Schedule */}
        <div className="section-card card">
          <h3 className="section-title">Today&apos;s Schedule</h3>
          <div className="schedule-list">
            {[
              { time: '9:00 AM', subject: 'Mathematics', class: 'Class 10-A', status: 'completed' },
              { time: '10:00 AM', subject: 'Physics', class: 'Class 11-B', status: 'completed' },
              { time: '11:00 AM', subject: 'Mathematics', class: 'Class 9-A', status: 'ongoing' },
              { time: '1:00 PM', subject: 'Physics', class: 'Class 12-A', status: 'upcoming' },
              { time: '2:00 PM', subject: 'Mathematics', class: 'Class 8-C', status: 'upcoming' },
            ].map((item) => (
              <div key={item.time + item.class} className={`schedule-item ${item.status}`}>
                <span className="schedule-time">{item.time}</span>
                <div className="schedule-divider">
                  <div className="schedule-dot" />
                  <div className="schedule-line" />
                </div>
                <div className="schedule-info">
                  <span className="schedule-subject">{item.subject}</span>
                  <span className="schedule-class">{item.class}</span>
                </div>
                <span className={`badge ${
                  item.status === 'completed' ? 'badge-success' :
                  item.status === 'ongoing' ? 'badge-primary' : 'badge-info'
                }`}>
                  {item.status === 'completed' ? 'Done' :
                   item.status === 'ongoing' ? 'Live' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="section-card card">
          <div className="section-header">
            <h3 className="section-title">Pending Submissions</h3>
            <span className="badge badge-warning">12 ungraded</span>
          </div>
          <div className="submissions-list">
            {[
              { title: 'Quadratic Equations Worksheet', class: 'Class 10-A', count: 28, deadline: 'Due yesterday' },
              { title: 'Newton\'s Laws Lab Report', class: 'Class 11-B', count: 22, deadline: 'Due today' },
              { title: 'Trigonometry Practice Set', class: 'Class 9-A', count: 30, deadline: 'Due in 2 days' },
              { title: 'Optics Diagram Assignment', class: 'Class 12-A', count: 18, deadline: 'Due in 3 days' },
            ].map((sub) => (
              <div key={sub.title} className="submission-item">
                <div className="submission-info">
                  <span className="submission-title">{sub.title}</span>
                  <div className="submission-meta">
                    <span>{sub.class}</span>
                    <span>•</span>
                    <span>{sub.count} submissions</span>
                  </div>
                </div>
                <div className="submission-right">
                  <span className={`submission-deadline ${sub.deadline.includes('yesterday') ? 'overdue' : ''}`}>
                    {sub.deadline.includes('yesterday') ? <AlertCircle size={12} /> : <Clock size={12} />}
                    {sub.deadline}
                  </span>
                  <button className="btn btn-sm btn-primary">Grade</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Performance Overview */}
      <div className="section-card card">
        <div className="section-header">
          <h3 className="section-title">My Classes — Student Performance</h3>
          <select className="input" style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
            <option>All Classes</option>
            <option>Class 10-A</option>
            <option>Class 11-B</option>
            <option>Class 9-A</option>
          </select>
        </div>
        <div className="perf-table">
          <div className="perf-header">
            <span>Student</span>
            <span>Attendance</span>
            <span>Assignments</span>
            <span>Avg. Score</span>
            <span>Status</span>
          </div>
          {[
            { name: 'Aditya Kumar', attendance: '96%', assignments: '10/10', score: '92%', status: 'Excellent' },
            { name: 'Sneha Patel', attendance: '94%', assignments: '9/10', score: '88%', status: 'Good' },
            { name: 'Rahul Verma', attendance: '78%', assignments: '7/10', score: '65%', status: 'At Risk' },
            { name: 'Priya Singh', attendance: '98%', assignments: '10/10', score: '95%', status: 'Excellent' },
            { name: 'Amit Sharma', attendance: '82%', assignments: '8/10', score: '72%', status: 'Average' },
          ].map((student) => (
            <div key={student.name} className="perf-row">
              <span className="perf-name">{student.name}</span>
              <span>{student.attendance}</span>
              <span>{student.assignments}</span>
              <span className="perf-score">{student.score}</span>
              <span className={`badge ${
                student.status === 'Excellent' ? 'badge-success' :
                student.status === 'Good' ? 'badge-primary' :
                student.status === 'At Risk' ? 'badge-danger' : 'badge-warning'
              }`}>
                {student.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .teacher-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dash-title {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .dash-subtitle {
          font-size: 0.875rem;
          color: hsl(var(--text-muted));
          margin-top: 0.125rem;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }
        .summary-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }
        .summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          flex-shrink: 0;
        }
        .summary-label {
          font-size: 0.8125rem;
          color: hsl(var(--text-muted));
        }
        .summary-value {
          font-size: 1.375rem;
          font-weight: 700;
          color: hsl(var(--text-primary));
        }
        .quick-actions-bar {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .teacher-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .section-card { padding: 1.5rem; }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }
        .schedule-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .schedule-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
        }
        .schedule-time {
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(var(--text-secondary));
          width: 70px;
          flex-shrink: 0;
        }
        .schedule-divider {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .schedule-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: hsl(var(--border-light));
        }
        .ongoing .schedule-dot {
          background: hsl(var(--primary));
          animation: pulse-glow 2s infinite;
        }
        .completed .schedule-dot {
          background: hsl(var(--success));
        }
        .schedule-line {
          width: 2px;
          height: 20px;
          background: hsl(var(--border));
        }
        .schedule-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .schedule-subject {
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(var(--text-primary));
        }
        .schedule-class {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }
        .submissions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .submission-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: hsl(var(--surface) / 0.5);
          border-radius: var(--radius-md);
          gap: 1rem;
        }
        .submission-title {
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(var(--text-primary));
        }
        .submission-meta {
          display: flex;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          margin-top: 0.125rem;
        }
        .submission-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .submission-deadline {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }
        .submission-deadline.overdue {
          color: hsl(var(--danger));
        }
        .perf-table {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .perf-header, .perf-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          align-items: center;
          padding: 0.625rem 0.75rem;
          gap: 0.5rem;
        }
        .perf-header {
          font-size: 0.75rem;
          font-weight: 600;
          color: hsl(var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid hsl(var(--border));
        }
        .perf-row {
          font-size: 0.8125rem;
          color: hsl(var(--text-secondary));
          border-radius: var(--radius-sm);
        }
        .perf-row:hover {
          background: hsl(var(--surface) / 0.5);
        }
        .perf-name {
          font-weight: 500;
          color: hsl(var(--text-primary));
        }
        .perf-score {
          font-weight: 600;
        }
        @media (max-width: 1024px) {
          .teacher-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .summary-grid { grid-template-columns: 1fr 1fr; }
          .perf-header, .perf-row { grid-template-columns: 2fr 1fr 1fr; }
          .perf-header span:nth-child(4),
          .perf-header span:nth-child(5),
          .perf-row span:nth-child(4),
          .perf-row span:nth-child(5) { display: none; }
        }
      `}</style>
    </div>
  );
}
