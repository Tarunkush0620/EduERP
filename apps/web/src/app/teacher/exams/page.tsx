'use client';

import { useState, useEffect } from 'react';
import { Award, Search, Calendar, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api-client';

type Exam = {
  id: string;
  name: string;
  className: string;
  examType: string;
  startDate: string;
  endDate: string;
};

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/exams/teacher');
      setExams(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Mock data
      setExams([
        { id: '1', name: 'Mid Term Examination', className: 'Class 10-A', examType: 'mid_term', startDate: '2026-10-10T00:00:00Z', endDate: '2026-10-20T00:00:00Z' },
        { id: '2', name: 'Unit Test 1', className: 'Class 9-B', examType: 'unit_test', startDate: '2026-07-15T00:00:00Z', endDate: '2026-07-18T00:00:00Z' },
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
          <h1 className="page-title"><Award size={24} /> Examinations & Results</h1>
          <p className="page-subtitle">Enter student marks for your assigned classes</p>
        </div>
      </div>

      <div className="card list-card">
        <div className="list-header">
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search exams or classes..." />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="empty-state">
            <Award size={48} />
            <h3>No exams scheduled</h3>
            <p>There are no exams assigned to your classes at the moment.</p>
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
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => {
                  const now = new Date();
                  const start = new Date(exam.startDate);
                  const end = new Date(exam.endDate);
                  let status = 'upcoming';
                  if (now > end) status = 'completed';
                  else if (now >= start && now <= end) status = 'ongoing';

                  return (
                    <tr key={exam.id}>
                      <td>
                        <div className="font-semibold text-primary">{exam.name}</div>
                      </td>
                      <td>
                        <div className="font-medium">{exam.className}</div>
                      </td>
                      <td>
                        <span className="type-badge">{getExamTypeLabel(exam.examType)}</span>
                      </td>
                      <td>
                        <div className="schedule-info">
                          <Calendar size={14} className="text-muted" />
                          <span>{start.toLocaleDateString()} - {end.toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        {status === 'upcoming' && <span className="status-badge status-upcoming"><Calendar size={12} /> Upcoming</span>}
                        {status === 'ongoing' && <span className="status-badge status-ongoing"><AlertCircle size={12} /> Ongoing</span>}
                        {status === 'completed' && <span className="status-badge status-completed"><CheckCircle2 size={12} /> Ready for Marks</span>}
                      </td>
                      <td className="text-right">
                        <button className="btn btn-sm btn-secondary enter-marks-btn" disabled={status === 'upcoming'}>
                          Enter Marks <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
        
        .list-card { padding: 0; overflow: hidden; }
        .list-header { padding: 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.5); }
        .search-bar { display: flex; align-items: center; gap: 0.5rem; background: hsl(var(--surface) / 0.5); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid hsl(var(--border)); max-width: 400px; }
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
        
        .status-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.625rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; }
        .status-upcoming { background: hsl(var(--surface)); color: hsl(var(--text-muted)); }
        .status-ongoing { background: hsl(38, 92%, 55%, 0.15); color: hsl(38, 92%, 55%); }
        .status-completed { background: hsl(142, 76%, 42%, 0.15); color: hsl(142, 76%, 48%); }
        
        .enter-marks-btn { gap: 0.25rem; }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
        .empty-state h3 { font-size: 1.125rem; font-weight: 600; color: hsl(var(--text-primary)); }
      `}</style>
    </div>
  );
}
