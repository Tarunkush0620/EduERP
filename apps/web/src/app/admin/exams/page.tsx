'use client';

import { useState, useEffect } from 'react';
import { Award, Plus, Search, Calendar, BarChart2 } from 'lucide-react';
import apiClient from '@/lib/api-client';

type Exam = {
  id: string;
  name: string;
  className: string;
  examType: string;
  startDate: string;
  endDate: string;
};

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/exams');
      setExams(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Mock
      setExams([
        { id: '1', name: 'Mid Term Examination', className: 'Class 10-A', examType: 'mid_term', startDate: '2026-10-10T00:00:00Z', endDate: '2026-10-20T00:00:00Z' },
        { id: '2', name: 'Final Examination', className: 'Class 9-B', examType: 'final', startDate: '2027-03-01T00:00:00Z', endDate: '2027-03-15T00:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getExamTypeLabel = (type: string) => {
    switch(type) {
      case 'unit_test': return 'Unit Test';
      case 'mid_term': return 'Mid Term';
      case 'final': return 'Final Exam';
      case 'practice': return 'Practice';
      default: return type;
    }
  };

  return (
    <div className="exams-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Award size={24} /> Examinations Management</h1>
          <p className="page-subtitle">Schedule exams and monitor school-wide performance</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Create Schedule
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon bg-primary-light text-primary"><Calendar size={24} /></div>
          <div className="stat-content">
            <h3 className="stat-title">Upcoming Exams</h3>
            <p className="stat-value">3</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-success-light text-success"><BarChart2 size={24} /></div>
          <div className="stat-content">
            <h3 className="stat-title">Avg. School Score</h3>
            <p className="stat-value">78.5%</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-warning-light text-warning"><Award size={24} /></div>
          <div className="stat-content">
            <h3 className="stat-title">Results Pending</h3>
            <p className="stat-value">12 <span className="stat-sub">classes</span></p>
          </div>
        </div>
      </div>

      <div className="card list-card mt-6">
        <div className="list-header">
          <h3 className="card-title">All Exam Schedules</h3>
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search exams..." />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="empty-state">
            <Award size={48} />
            <h3>No exams scheduled</h3>
            <p>Create a schedule to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Class</th>
                  <th>Type</th>
                  <th>Schedule</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id}>
                    <td><div className="font-semibold text-primary">{exam.name}</div></td>
                    <td><div className="font-medium">{exam.className}</div></td>
                    <td><span className="type-badge">{getExamTypeLabel(exam.examType)}</span></td>
                    <td>
                      <div className="schedule-info">
                        <Calendar size={14} className="text-muted" />
                        <span>{new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <button className="btn btn-sm btn-ghost">View Results</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .exams-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .stat-card { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem; }
        .stat-icon { width: 56px; height: 56px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
        .bg-primary-light { background: hsl(var(--primary) / 0.15); }
        .bg-success-light { background: hsl(142, 76%, 42%, 0.15); }
        .bg-warning-light { background: hsl(38, 92%, 55%, 0.15); }
        .text-primary { color: hsl(var(--primary-light)); }
        .text-success { color: hsl(142, 76%, 48%); }
        .text-warning { color: hsl(38, 92%, 55%); }
        
        .stat-title { font-size: 0.875rem; color: hsl(var(--text-muted)); font-weight: 500; margin-bottom: 0.25rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: hsl(var(--text-primary)); display: flex; align-items: baseline; gap: 0.25rem; }
        .stat-sub { font-size: 0.875rem; color: hsl(var(--text-muted)); font-weight: 500; }
        
        .mt-6 { margin-top: 1.5rem; }
        .list-card { padding: 0; overflow: hidden; }
        .list-header { padding: 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.5); display: flex; justify-content: space-between; align-items: center; }
        .card-title { font-size: 1.125rem; font-weight: 600; margin: 0; }
        
        .search-bar { display: flex; align-items: center; gap: 0.5rem; background: hsl(var(--surface) / 0.5); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid hsl(var(--border)); width: 300px; }
        .search-bar input { background: transparent; border: none; outline: none; font-size: 0.875rem; color: hsl(var(--text-primary)); width: 100%; }
        
        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .data-table th { text-align: left; padding: 0.75rem 1.25rem; color: hsl(var(--text-muted)); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; background: hsl(var(--surface) / 0.3); border-bottom: 1px solid hsl(var(--border)); }
        .data-table td { padding: 1rem 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.3); vertical-align: middle; }
        .data-table tbody tr:hover { background: hsl(var(--surface) / 0.2); }
        
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .text-primary { color: hsl(var(--text-primary)); }
        .text-muted { color: hsl(var(--text-muted)); }
        .text-right { text-align: right; }
        
        .type-badge { display: inline-block; padding: 0.25rem 0.625rem; background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 500; color: hsl(var(--text-secondary)); }
        
        .schedule-info { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      `}</style>
    </div>
  );
}
