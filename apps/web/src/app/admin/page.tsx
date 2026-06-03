'use client';

import { useState } from 'react';
import {
  Users, GraduationCap, BookOpen, DollarSign, TrendingUp, TrendingDown,
  ClipboardCheck, UserPlus, FileText, Bell, CreditCard, ArrowUpRight,
  Calendar, Award, BarChart3, Activity,
} from 'lucide-react';

// ─── KPI Card Component ──────────────────────────────────────
function KpiCard({
  title, value, change, changeType, icon, color,
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="kpi-card card">
      <div className="kpi-card-top">
        <div>
          <p className="kpi-label">{title}</p>
          <h3 className="kpi-value">{value}</h3>
        </div>
        <div className="kpi-icon" style={{ background: color }}>
          {icon}
        </div>
      </div>
      <div className="kpi-card-bottom">
        <span className={`kpi-change ${changeType === 'up' ? 'kpi-change-up' : changeType === 'down' ? 'kpi-change-down' : ''}`}>
          {changeType === 'up' ? <TrendingUp size={14} /> : changeType === 'down' ? <TrendingDown size={14} /> : null}
          {change}
        </span>
        <span className="kpi-period">vs last month</span>
      </div>

      <style jsx>{`
        .kpi-card {
          padding: 1.25rem;
        }
        .kpi-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .kpi-label {
          font-size: 0.8125rem;
          color: hsl(var(--text-muted));
          margin-bottom: 0.25rem;
        }
        .kpi-value {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: hsl(var(--text-primary));
        }
        .kpi-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: var(--radius-lg);
          color: white;
          flex-shrink: 0;
        }
        .kpi-card-bottom {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .kpi-change {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8125rem;
          font-weight: 500;
        }
        .kpi-change-up {
          color: hsl(var(--success));
        }
        .kpi-change-down {
          color: hsl(var(--danger));
        }
        .kpi-period {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
        }
      `}</style>
    </div>
  );
}

// ─── Quick Action Button ─────────────────────────────────────
function QuickAction({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <button className="quick-action">
      <div className="quick-action-icon" style={{ background: color }}>
        {icon}
      </div>
      <span className="quick-action-label">{label}</span>

      <style jsx>{`
        .quick-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 0.75rem;
          background: hsl(var(--bg-card));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          min-width: 100px;
        }
        .quick-action:hover {
          border-color: hsl(var(--border-light));
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .quick-action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          color: white;
        }
        .quick-action-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: hsl(var(--text-secondary));
          text-align: center;
        }
      `}</style>
    </button>
  );
}

// ─── Activity Item ───────────────────────────────────────────
function ActivityItem({ title, description, time, type }: {
  title: string; description: string; time: string; type: 'success' | 'info' | 'warning';
}) {
  const colors = {
    success: 'hsl(var(--success))',
    info: 'hsl(var(--primary-light))',
    warning: 'hsl(var(--warning))',
  };

  return (
    <div className="activity-item">
      <div className="activity-dot" style={{ background: colors[type] }} />
      <div className="activity-content">
        <p className="activity-title">{title}</p>
        <p className="activity-desc">{description}</p>
      </div>
      <span className="activity-time">{time}</span>

      <style jsx>{`
        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid hsl(var(--border) / 0.5);
        }
        .activity-item:last-child {
          border-bottom: none;
        }
        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }
        .activity-content {
          flex: 1;
          min-width: 0;
        }
        .activity-title {
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(var(--text-primary));
        }
        .activity-desc {
          font-size: 0.75rem;
          color: hsl(var(--text-muted));
          margin-top: 0.125rem;
        }
        .activity-time {
          font-size: 0.6875rem;
          color: hsl(var(--text-muted));
          white-space: nowrap;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────
import apiClient from '@/lib/api-client';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get('/dashboard/admin');
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
    <div className="admin-dashboard animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here&apos;s an overview of your school.</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="btn btn-secondary">
            <FileText size={16} />
            Generate Report
          </button>
          <button className="btn btn-primary">
            <UserPlus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid stagger-children">
        <KpiCard
          title="Total Students"
          value={data.kpis.totalStudents.toString()}
          change="+12%"
          changeType="up"
          icon={<BookOpen size={20} />}
          color="hsl(222, 84%, 55%)"
        />
        <KpiCard
          title="Total Teachers"
          value={data.kpis.totalTeachers.toString()}
          change="+3"
          changeType="up"
          icon={<GraduationCap size={20} />}
          color="hsl(262, 80%, 60%)"
        />
        <KpiCard
          title="Attendance Rate"
          value={`${data.kpis.attendanceRate}%`}
          change="-1.3%"
          changeType="down"
          icon={<ClipboardCheck size={20} />}
          color="hsl(142, 76%, 42%)"
        />
        <KpiCard
          title="Fee Collection"
          value={`₹${(data.kpis.feeCollection/100000).toFixed(1)}L`}
          change="+8%"
          changeType="up"
          icon={<DollarSign size={20} />}
          color="hsl(38, 92%, 55%)"
        />
        <KpiCard
          title="Pending Fees"
          value={`₹${(data.kpis.pendingFees/100000).toFixed(1)}L`}
          change="-15%"
          changeType="up"
          icon={<CreditCard size={20} />}
          color="hsl(0, 84%, 55%)"
        />
        <KpiCard
          title="New Admissions"
          value={data.kpis.newAdmissions.toString()}
          change="+22%"
          changeType="up"
          icon={<UserPlus size={20} />}
          color="hsl(199, 89%, 48%)"
        />
      </div>

      {/* Quick Actions */}
      <div className="section-card card">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <QuickAction icon={<UserPlus size={18} />} label="Add Student" color="hsl(222, 84%, 55%)" />
          <QuickAction icon={<GraduationCap size={18} />} label="Add Teacher" color="hsl(262, 80%, 60%)" />
          <QuickAction icon={<FileText size={18} />} label="Generate Report" color="hsl(142, 76%, 42%)" />
          <QuickAction icon={<Bell size={18} />} label="Create Notice" color="hsl(38, 92%, 55%)" />
          <QuickAction icon={<DollarSign size={18} />} label="Manage Fees" color="hsl(0, 84%, 55%)" />
          <QuickAction icon={<Calendar size={18} />} label="Schedule Exam" color="hsl(199, 89%, 48%)" />
        </div>
      </div>

      {/* Charts + Activity */}
      <div className="dashboard-grid-2">
        {/* Chart placeholder */}
        <div className="section-card card">
          <div className="section-header">
            <h3 className="section-title">Student Enrollment</h3>
            <span className="badge badge-success">+12% Growth</span>
          </div>
          <div className="chart-placeholder">
            <BarChart3 size={48} color="hsl(222, 84%, 55%)" />
            <p>Chart will render with real data</p>
            <div className="chart-bars">
              {[65, 78, 82, 72, 88, 95, 92, 85, 90, 98, 105, 112].map((h, i) => (
                <div key={i} className="chart-bar" style={{
                  height: `${h}%`,
                  animationDelay: `${i * 50}ms`,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="section-card card">
          <div className="section-header">
            <h3 className="section-title">Recent Activity</h3>
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>
          <div className="activity-list">
            <ActivityItem
              title="New student enrolled"
              description="Rahul Sharma joined Class 10-A"
              time="2 min ago"
              type="success"
            />
            <ActivityItem
              title="Fee payment received"
              description="₹15,000 from Priya Patel (Class 8-B)"
              time="15 min ago"
              type="info"
            />
            <ActivityItem
              title="Attendance alert"
              description="Class 7-C has below 85% attendance today"
              time="30 min ago"
              type="warning"
            />
            <ActivityItem
              title="Exam results published"
              description="Mid-term results for Class 9 are live"
              time="1 hour ago"
              type="success"
            />
            <ActivityItem
              title="Teacher leave request"
              description="Mrs. Gupta requested leave for 2 days"
              time="2 hours ago"
              type="info"
            />
            <ActivityItem
              title="Assignment graded"
              description="Physics assignment graded for Class 11"
              time="3 hours ago"
              type="success"
            />
          </div>
        </div>
      </div>

      {/* Revenue trend + Performance */}
      <div className="dashboard-grid-2">
        <div className="section-card card">
          <div className="section-header">
            <h3 className="section-title">Revenue Trend</h3>
            <select className="input" style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
              <option>Last 12 months</option>
              <option>Last 6 months</option>
              <option>This year</option>
            </select>
          </div>
          <div className="chart-placeholder">
            <TrendingUp size={48} color="hsl(142, 76%, 42%)" />
            <p>Revenue chart will render with real data</p>
            <div className="chart-bars chart-bars-green">
              {[45, 55, 50, 65, 70, 62, 75, 80, 72, 85, 90, 88].map((h, i) => (
                <div key={i} className="chart-bar chart-bar-green" style={{
                  height: `${h}%`,
                  animationDelay: `${i * 50}ms`,
                }} />
              ))}
            </div>
          </div>
        </div>

        <div className="section-card card">
          <div className="section-header">
            <h3 className="section-title">Class Performance</h3>
            <span className="badge badge-primary">Academic Year 2025-26</span>
          </div>
          <div className="performance-list">
            {[
              { name: 'Class 10-A', score: 92, grade: 'A+' },
              { name: 'Class 9-B', score: 88, grade: 'A' },
              { name: 'Class 12-A', score: 85, grade: 'A' },
              { name: 'Class 11-C', score: 79, grade: 'B+' },
              { name: 'Class 8-A', score: 76, grade: 'B' },
            ].map((cls) => (
              <div key={cls.name} className="performance-row">
                <span className="perf-name">{cls.name}</span>
                <div className="perf-bar-wrapper">
                  <div className="perf-bar" style={{ width: `${cls.score}%` }} />
                </div>
                <span className="perf-score">{cls.score}%</span>
                <span className="badge badge-success">{cls.grade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
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

        .dashboard-header-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
          font-size: 1rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .dashboard-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .chart-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          min-height: 200px;
          position: relative;
        }

        .chart-placeholder > svg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.1;
        }

        .chart-placeholder > p {
          position: absolute;
          top: 40%;
          font-size: 0.8125rem;
          color: hsl(var(--text-muted));
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          width: 100%;
          height: 160px;
          padding-top: 1rem;
        }

        .chart-bar {
          flex: 1;
          background: linear-gradient(to top, hsl(222, 84%, 55%), hsl(222, 84%, 70%));
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          opacity: 0.7;
          animation: growUp var(--transition-slow) ease-out both;
        }

        .chart-bar-green {
          background: linear-gradient(to top, hsl(142, 76%, 42%), hsl(142, 76%, 60%));
        }

        @keyframes growUp {
          from { height: 0 !important; }
        }

        .activity-list {
          max-height: 360px;
          overflow-y: auto;
        }

        .performance-list {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .performance-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .perf-name {
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(var(--text-secondary));
          width: 80px;
          flex-shrink: 0;
        }

        .perf-bar-wrapper {
          flex: 1;
          height: 8px;
          background: hsl(var(--surface));
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .perf-bar {
          height: 100%;
          background: linear-gradient(90deg, hsl(222, 84%, 55%), hsl(142, 76%, 42%));
          border-radius: var(--radius-full);
          transition: width 1s ease-out;
        }

        .perf-score {
          font-size: 0.8125rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
          width: 40px;
          text-align: right;
        }

        @media (max-width: 1024px) {
          .dashboard-grid-2 {
            grid-template-columns: 1fr;
          }
          .dashboard-header {
            flex-direction: column;
          }
        }

        @media (max-width: 640px) {
          .kpi-grid {
            grid-template-columns: 1fr 1fr;
          }
          .quick-actions-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
