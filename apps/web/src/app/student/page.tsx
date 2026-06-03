'use client';

import {
  ClipboardCheck, FileText, Award, Calendar, Clock,
  TrendingUp, BookOpen, Bell, Download, ArrowUpRight,
  CheckCircle2, AlertCircle, ChevronRight,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useEffect, useState } from 'react';

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get('/dashboard/student');
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
    <div className="student-dashboard animate-fade-in">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Hey, Student! 🎓</h1>
          <p className="dash-subtitle">Track your academic journey</p>
        </div>
        <span className="badge badge-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          {data.profile.className !== 'N/A' ? `${data.profile.className} • ` : ''}Roll No: {data.profile.rollNo}
        </span>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid stagger-children">
        <div className="overview-card card">
          <div className="overview-top">
            <div className="overview-icon" style={{ background: 'hsl(142, 76%, 42%, 0.15)', color: 'hsl(142, 76%, 42%)' }}>
              <ClipboardCheck size={22} />
            </div>
            <span className="overview-label">Attendance</span>
          </div>
          <h3 className="overview-value">{data.overview.attendancePercent}%</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${data.overview.attendancePercent}%`, background: 'hsl(142, 76%, 42%)' }} />
          </div>
        </div>

        <div className="overview-card card">
          <div className="overview-top">
            <div className="overview-icon" style={{ background: 'hsl(222, 84%, 55%, 0.15)', color: 'hsl(222, 84%, 65%)' }}>
              <Award size={22} />
            </div>
            <span className="overview-label">Current GPA</span>
          </div>
          <h3 className="overview-value">{data.overview.gpa}<span className="overview-max"> / 10</span></h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(data.overview.gpa / 10) * 100}%`, background: 'hsl(222, 84%, 55%)' }} />
          </div>
        </div>

        <div className="overview-card card">
          <div className="overview-top">
            <div className="overview-icon" style={{ background: 'hsl(38, 92%, 55%, 0.15)', color: 'hsl(38, 92%, 55%)' }}>
              <FileText size={22} />
            </div>
            <span className="overview-label">Pending Assignments</span>
          </div>
          <h3 className="overview-value">{data.overview.pendingAssignments}</h3>
        </div>

        <div className="overview-card card">
          <div className="overview-top">
            <div className="overview-icon" style={{ background: 'hsl(262, 80%, 60%, 0.15)', color: 'hsl(262, 80%, 65%)' }}>
              <Calendar size={22} />
            </div>
            <span className="overview-label">Upcoming Exams</span>
          </div>
          <h3 className="overview-value">{data.overview.upcomingExams}</h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-bar">
        <button className="btn btn-primary"><FileText size={16} /> Submit Assignment</button>
        <button className="btn btn-secondary"><Calendar size={16} /> View Timetable</button>
        <button className="btn btn-secondary"><Download size={16} /> Download Notes</button>
        <button className="btn btn-secondary"><Award size={16} /> Check Results</button>
      </div>

      {/* Timetable + Assignments */}
      <div className="student-grid">
        {/* Today's Timetable */}
        <div className="section-card card">
          <div className="section-header">
            <h3 className="section-title">Today&apos;s Timetable</h3>
            <button className="btn btn-ghost btn-sm">Full Schedule <ChevronRight size={14} /></button>
          </div>
          <div className="timetable">
            {[
              { time: '9:00', subject: 'Mathematics', teacher: 'Mr. Sharma', room: 'R-201', status: 'done' },
              { time: '10:00', subject: 'Physics', teacher: 'Mrs. Gupta', room: 'Lab-3', status: 'done' },
              { time: '11:00', subject: 'Chemistry', teacher: 'Dr. Patel', room: 'Lab-1', status: 'now' },
              { time: '12:00', subject: 'English', teacher: 'Ms. Johnson', room: 'R-105', status: 'next' },
              { time: '1:00', subject: 'Lunch Break', teacher: '', room: '', status: 'break' },
              { time: '2:00', subject: 'Computer Science', teacher: 'Mr. Khan', room: 'CS Lab', status: 'later' },
              { time: '3:00', subject: 'Physical Education', teacher: 'Coach Singh', room: 'Ground', status: 'later' },
            ].map((period) => (
              <div key={period.time} className={`timetable-row ${period.status}`}>
                <span className="tt-time">{period.time}</span>
                <div className="tt-indicator">
                  <div className="tt-dot" />
                </div>
                <div className="tt-info">
                  <span className="tt-subject">{period.subject}</span>
                  {period.teacher && (
                    <span className="tt-meta">{period.teacher}{period.room ? ` • ${period.room}` : ''}</span>
                  )}
                </div>
                {period.status === 'now' && <span className="badge badge-primary">Now</span>}
                {period.status === 'done' && <CheckCircle2 size={16} style={{ color: 'hsl(142, 76%, 42%)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Assignments + Results */}
        <div className="right-column">
          <div className="section-card card">
            <div className="section-header">
              <h3 className="section-title">Pending Assignments</h3>
            </div>
            <div className="assignments-list">
              {[
                { title: 'Trigonometry Problem Set', subject: 'Mathematics', deadline: 'Tomorrow', urgent: true },
                { title: 'Lab Report: Acids & Bases', subject: 'Chemistry', deadline: 'In 3 days', urgent: false },
                { title: 'Essay: Climate Change', subject: 'English', deadline: 'In 5 days', urgent: false },
              ].map((assignment) => (
                <div key={assignment.title} className="assignment-item">
                  <div className="assignment-info">
                    <span className="assignment-title">{assignment.title}</span>
                    <span className="assignment-subject">{assignment.subject}</span>
                  </div>
                  <div className="assignment-right">
                    <span className={`assignment-deadline ${assignment.urgent ? 'urgent' : ''}`}>
                      <Clock size={12} /> {assignment.deadline}
                    </span>
                    <button className="btn btn-sm btn-primary">Submit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card card">
            <div className="section-header">
              <h3 className="section-title">Recent Results</h3>
              <button className="btn btn-ghost btn-sm">View All</button>
            </div>
            <div className="results-list">
              {[
                { exam: 'Unit Test 3', subject: 'Mathematics', marks: '45/50', grade: 'A+', trend: 'up' },
                { exam: 'Unit Test 3', subject: 'Physics', marks: '42/50', grade: 'A', trend: 'up' },
                { exam: 'Unit Test 3', subject: 'Chemistry', marks: '38/50', grade: 'B+', trend: 'down' },
                { exam: 'Unit Test 3', subject: 'English', marks: '44/50', grade: 'A', trend: 'up' },
              ].map((result) => (
                <div key={result.subject} className="result-item">
                  <div className="result-info">
                    <span className="result-subject">{result.subject}</span>
                    <span className="result-exam">{result.exam}</span>
                  </div>
                  <span className="result-marks">{result.marks}</span>
                  <span className={`badge ${
                    result.grade.startsWith('A') ? 'badge-success' : 'badge-warning'
                  }`}>{result.grade}</span>
                  {result.trend === 'up' ?
                    <TrendingUp size={14} style={{ color: 'hsl(142, 76%, 42%)' }} /> :
                    <TrendingUp size={14} style={{ color: 'hsl(0, 84%, 55%)', transform: 'rotate(180deg)' }} />
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="section-card card">
        <div className="section-header">
          <h3 className="section-title"><Bell size={16} /> Notifications</h3>
        </div>
        <div className="notifications-list">
          {[
            { title: 'Mid-Term Exam Schedule Released', desc: 'Check your timetable for exam dates', time: '1 hour ago', type: 'info' },
            { title: 'Fee Payment Reminder', desc: 'Q2 fees due by June 15, 2026', time: '3 hours ago', type: 'warning' },
            { title: 'Mathematics Assignment Graded', desc: 'You scored 92/100 — Great work!', time: 'Yesterday', type: 'success' },
            { title: 'Sports Day Registration Open', desc: 'Register for events before June 10', time: '2 days ago', type: 'info' },
          ].map((notif) => (
            <div key={notif.title} className="notif-item">
              <div className={`notif-dot notif-dot-${notif.type}`} />
              <div className="notif-content">
                <span className="notif-title">{notif.title}</span>
                <span className="notif-desc">{notif.desc}</span>
              </div>
              <span className="notif-time">{notif.time}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .student-dashboard {
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
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1rem;
        }
        .overview-card {
          padding: 1.25rem;
        }
        .overview-top {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.75rem;
        }
        .overview-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
        }
        .overview-label {
          font-size: 0.8125rem;
          color: hsl(var(--text-muted));
        }
        .overview-value {
          font-size: 2rem;
          font-weight: 700;
          color: hsl(var(--text-primary));
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        .overview-max {
          font-size: 1rem;
          font-weight: 400;
          color: hsl(var(--text-muted));
        }
        .progress-bar {
          height: 6px;
          background: hsl(var(--surface));
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        .progress-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 1s ease-out;
        }
        .overview-note {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }
        .quick-actions-bar {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .student-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .right-column {
          display: flex;
          flex-direction: column;
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
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 1rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }
        .timetable {
          display: flex;
          flex-direction: column;
        }
        .timetable-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
        }
        .tt-time {
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(var(--text-secondary));
          width: 45px;
          flex-shrink: 0;
        }
        .tt-indicator {
          display: flex;
          align-items: center;
        }
        .tt-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: hsl(var(--border-light));
        }
        .now .tt-dot {
          background: hsl(var(--primary));
          box-shadow: 0 0 8px hsl(var(--primary) / 0.5);
        }
        .done .tt-dot {
          background: hsl(var(--success));
        }
        .break .tt-dot {
          background: hsl(var(--warning));
        }
        .tt-info { flex: 1; }
        .tt-subject {
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(var(--text-primary));
          display: block;
        }
        .tt-meta {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }
        .assignments-list, .results-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .assignment-item, .result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background: hsl(var(--surface) / 0.5);
          border-radius: var(--radius-md);
          gap: 0.75rem;
        }
        .assignment-info, .result-info {
          flex: 1;
          min-width: 0;
        }
        .assignment-title, .result-subject {
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(var(--text-primary));
          display: block;
        }
        .assignment-subject, .result-exam {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }
        .assignment-right {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-shrink: 0;
        }
        .assignment-deadline {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }
        .assignment-deadline.urgent {
          color: hsl(var(--danger));
        }
        .result-marks {
          font-size: 0.875rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }
        .notif-item:hover {
          background: hsl(var(--surface) / 0.5);
        }
        .notif-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }
        .notif-dot-info { background: hsl(var(--info)); }
        .notif-dot-warning { background: hsl(var(--warning)); }
        .notif-dot-success { background: hsl(var(--success)); }
        .notif-content { flex: 1; }
        .notif-title {
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(var(--text-primary));
          display: block;
        }
        .notif-desc {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }
        .notif-time {
          font-size: 0.6875rem;
          color: hsl(var(--text-muted));
          white-space: nowrap;
          flex-shrink: 0;
        }
        @media (max-width: 1024px) {
          .student-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .overview-grid { grid-template-columns: 1fr 1fr; }
          .dash-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        }
      `}</style>
    </div>
  );
}
