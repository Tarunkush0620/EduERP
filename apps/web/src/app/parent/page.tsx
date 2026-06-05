'use client';

import { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, Bell, Calendar, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get('/dashboard/parent');
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
    <div className="parent-dashboard animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Parent Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's an overview of your children's progress.</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="kpi-grid stagger-children">
        <div className="kpi-card card">
          <div className="kpi-card-top">
            <div>
              <p className="kpi-label">Total Children</p>
              <h3 className="kpi-value">{data.overview.totalChildren}</h3>
            </div>
            <div className="kpi-icon" style={{ background: 'hsl(222, 84%, 55%)' }}>
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-card-top">
            <div>
              <p className="kpi-label">Pending Fees</p>
              <h3 className="kpi-value">₹{data.overview.pendingFees.toLocaleString()}</h3>
            </div>
            <div className="kpi-icon" style={{ background: 'hsl(0, 84%, 55%)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-card-bottom">
            <span className="kpi-change kpi-change-down" style={{ color: 'hsl(0, 84%, 55%)' }}>
              <AlertTriangle size={14} /> Due next week
            </span>
          </div>
        </div>

        <div className="kpi-card card">
          <div className="kpi-card-top">
            <div>
              <p className="kpi-label">Unread Notices</p>
              <h3 className="kpi-value">{data.overview.unreadNotices}</h3>
            </div>
            <div className="kpi-icon" style={{ background: 'hsl(38, 92%, 55%)' }}>
              <Bell size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Children Progress */}
        <div className="section-card card">
          <div className="section-header">
            <h3 className="section-title">Children's Progress</h3>
          </div>
          <div className="children-list">
            {data.children.map((child: any, idx: number) => (
              <div key={idx} className="child-card">
                <div className="child-header">
                  <div className="child-avatar">
                    <GraduationCap size={24} color="hsl(var(--text-primary))" />
                  </div>
                  <div>
                    <h4 className="child-name">{child.name}</h4>
                    <p className="child-class">{child.class}</p>
                  </div>
                </div>
                <div className="child-stats">
                  <div className="child-stat">
                    <span className="stat-label">Attendance</span>
                    <span className="stat-value text-success">{child.attendance}</span>
                  </div>
                  <div className="child-stat">
                    <span className="stat-label">Pending Assignments</span>
                    <span className="stat-value">{child.pendingAssignments}</span>
                  </div>
                  <div className="child-stat">
                    <span className="stat-label">Next Exam</span>
                    <span className="stat-value text-primary">{child.nextExam}</span>
                  </div>
                </div>
                <div className="child-actions">
                  <button className="btn btn-ghost btn-sm">View Timetable</button>
                  <button className="btn btn-ghost btn-sm">View Report Card</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="section-card card">
          <div className="section-header">
            <h3 className="section-title">Recent Notices</h3>
          </div>
          <div className="notices-list">
            {data.recentNotices.map((notice: any, idx: number) => (
              <div key={idx} className={`notice-item notice-${notice.type}`}>
                <div className="notice-icon">
                  <Bell size={16} />
                </div>
                <div className="notice-content">
                  <h4 className="notice-title">{notice.title}</h4>
                  <p className="notice-date">{notice.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .parent-dashboard {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .dashboard-title {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: hsl(var(--text-primary));
        }

        .dashboard-subtitle {
          font-size: 0.875rem;
          color: hsl(var(--text-muted));
          margin-top: 0.25rem;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .kpi-card {
          padding: 1.5rem;
        }

        .kpi-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .kpi-label {
          font-size: 0.875rem;
          color: hsl(var(--text-muted));
          margin-bottom: 0.5rem;
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: hsl(var(--text-primary));
        }

        .kpi-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          color: white;
          flex-shrink: 0;
        }

        .kpi-card-bottom {
          margin-top: 1rem;
        }

        .kpi-change {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
        }

        .dashboard-grid-2 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
        }

        .section-card {
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }

        .children-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .child-card {
          background: hsl(var(--surface));
          border: 1px solid hsl(var(--border) / 0.5);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
        }

        .child-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .child-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: hsl(var(--bg-card));
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid hsl(var(--border));
        }

        .child-name {
          font-size: 1rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }

        .child-class {
          font-size: 0.8125rem;
          color: hsl(var(--text-muted));
        }

        .child-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding: 1rem 0;
          border-top: 1px solid hsl(var(--border) / 0.5);
          border-bottom: 1px solid hsl(var(--border) / 0.5);
        }

        .child-stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }

        .text-success { color: hsl(var(--success)); }
        .text-primary { color: hsl(var(--primary)); }

        .child-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .notices-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .notice-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          background: hsl(var(--surface));
          border-left: 3px solid transparent;
        }

        .notice-warning {
          border-left-color: hsl(var(--warning));
          background: hsl(var(--warning) / 0.1);
        }

        .notice-info {
          border-left-color: hsl(var(--primary-light));
          background: hsl(var(--primary-light) / 0.1);
        }

        .notice-icon {
          color: hsl(var(--text-secondary));
          margin-top: 2px;
        }

        .notice-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(var(--text-primary));
          margin-bottom: 0.25rem;
        }

        .notice-date {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }

        @media (max-width: 1024px) {
          .dashboard-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .child-stats {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}
