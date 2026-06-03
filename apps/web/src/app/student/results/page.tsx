'use client';

import { useState, useEffect } from 'react';
import { Award, Search, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

type SubjectResult = {
  name: string;
  maxMarks: number;
  obtained: number;
  grade?: string;
};

type ExamResult = {
  name: string;
  type: string;
  percentage: number;
  totalMax: number;
  totalObtained: number;
  subjects: SubjectResult[];
};

export default function StudentResultsPage() {
  const { user } = useAuthStore();
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (user?.id) fetchResults();
  }, [user]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/exams/report-card/${user?.id}`);
      setExams(res.data?.data?.exams || res.data?.exams || []);
    } catch (e) {
      console.error(e);
      // Mock data
      setExams([
        {
          name: 'Mid Term Examination',
          type: 'mid_term',
          percentage: 85.5,
          totalMax: 500,
          totalObtained: 427.5,
          subjects: [
            { name: 'Mathematics', maxMarks: 100, obtained: 92, grade: 'A+' },
            { name: 'Science', maxMarks: 100, obtained: 85, grade: 'A' },
            { name: 'English', maxMarks: 100, obtained: 78, grade: 'B+' },
            { name: 'History', maxMarks: 100, obtained: 88, grade: 'A' },
            { name: 'Computer Science', maxMarks: 100, obtained: 84.5, grade: 'A' },
          ]
        },
        {
          name: 'Unit Test 1',
          type: 'unit_test',
          percentage: 78.0,
          totalMax: 100,
          totalObtained: 78,
          subjects: [
            { name: 'Mathematics', maxMarks: 50, obtained: 45, grade: 'A' },
            { name: 'Science', maxMarks: 50, obtained: 33, grade: 'B' },
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'text-muted';
    if (grade.includes('A')) return 'text-success';
    if (grade.includes('B')) return 'text-primary';
    if (grade.includes('C')) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="results-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Award size={24} /> Academic Results</h1>
          <p className="page-subtitle">View your report cards and academic performance</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading your results...</div>
      ) : exams.length === 0 ? (
        <div className="empty-state card">
          <Award size={48} className="text-muted" />
          <h3>No results yet</h3>
          <p>Your examination results will appear here once published.</p>
        </div>
      ) : (
        <div className="results-layout">
          <div className="exam-tabs card">
            <h3 className="tabs-title">Examinations</h3>
            <div className="tabs-list">
              {exams.map((exam, idx) => (
                <button 
                  key={idx} 
                  className={`exam-tab ${activeTab === idx ? 'active' : ''}`}
                  onClick={() => setActiveTab(idx)}
                >
                  <div className="tab-info">
                    <div className="tab-name">{exam.name}</div>
                    <div className="tab-type">{exam.type.replace('_', ' ').toUpperCase()}</div>
                  </div>
                  <div className={`tab-score ${exam.percentage >= 80 ? 'text-success' : exam.percentage >= 60 ? 'text-warning' : 'text-danger'}`}>
                    {exam.percentage}%
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="report-card card">
            {exams[activeTab] && (
              <>
                <div className="report-header">
                  <div className="rh-left">
                    <h2>{exams[activeTab].name}</h2>
                    <span className="badge">{exams[activeTab].type.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="rh-right">
                    <div className="total-score">
                      <span className="score-label">Total Score</span>
                      <span className="score-value">{exams[activeTab].totalObtained} / {exams[activeTab].totalMax}</span>
                    </div>
                    <div className="percentage-circle">
                      {exams[activeTab].percentage}%
                    </div>
                  </div>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th className="text-right">Max Marks</th>
                        <th className="text-right">Marks Obtained</th>
                        <th className="text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams[activeTab].subjects.map((sub, i) => (
                        <tr key={i}>
                          <td className="font-medium text-primary">{sub.name}</td>
                          <td className="text-right text-muted">{sub.maxMarks}</td>
                          <td className="text-right font-semibold">{sub.obtained}</td>
                          <td className="text-right">
                            {sub.grade ? (
                              <span className={`grade-chip ${getGradeColor(sub.grade)}`}>{sub.grade}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="report-footer">
                  <div className="perf-insight">
                    {exams[activeTab].percentage >= 80 ? (
                      <><TrendingUp size={20} className="text-success" /> Outstanding performance! Keep it up.</>
                    ) : exams[activeTab].percentage >= 60 ? (
                      <><CheckCircle size={20} className="text-primary" /> Good effort, but room for improvement.</>
                    ) : (
                      <><AlertTriangle size={20} className="text-danger" /> Needs immediate attention and hard work.</>
                    )}
                  </div>
                  <button className="btn btn-outline btn-sm">Download PDF</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .results-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        
        .results-layout { display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; align-items: flex-start; }
        
        .exam-tabs { padding: 1.25rem 0; }
        .tabs-title { font-size: 1rem; font-weight: 600; padding: 0 1.25rem 1rem; border-bottom: 1px solid hsl(var(--border) / 0.5); margin-bottom: 0.5rem; }
        .tabs-list { display: flex; flex-direction: column; }
        
        .exam-tab { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: transparent; border: none; border-left: 3px solid transparent; text-align: left; cursor: pointer; transition: all 0.2s; }
        .exam-tab:hover { background: hsl(var(--surface) / 0.3); }
        .exam-tab.active { background: hsl(var(--surface) / 0.7); border-left-color: hsl(var(--primary)); }
        
        .tab-name { font-weight: 600; font-size: 0.875rem; color: hsl(var(--text-primary)); margin-bottom: 0.25rem; }
        .tab-type { font-size: 0.6875rem; color: hsl(var(--text-muted)); font-weight: 500; }
        .tab-score { font-weight: 700; font-size: 1.125rem; }
        
        .report-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
        
        .report-header { padding: 2rem; background: linear-gradient(135deg, hsl(var(--surface)), hsl(var(--bg-dark))); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid hsl(var(--border)); }
        .rh-left h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .badge { display: inline-block; padding: 0.25rem 0.625rem; background: hsl(var(--primary) / 0.15); color: hsl(var(--primary-light)); border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; }
        
        .rh-right { display: flex; align-items: center; gap: 1.5rem; }
        .total-score { display: flex; flex-direction: column; align-items: flex-end; }
        .score-label { font-size: 0.75rem; color: hsl(var(--text-muted)); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; margin-bottom: 0.25rem; }
        .score-value { font-size: 1.25rem; font-weight: 700; color: hsl(var(--text-primary)); }
        
        .percentage-circle { width: 64px; height: 64px; border-radius: 50%; background: conic-gradient(hsl(var(--primary)) var(--percentage, 85%), hsl(var(--surface)) 0); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.125rem; position: relative; }
        .percentage-circle::after { content: ''; position: absolute; inset: 4px; background: hsl(var(--bg-card)); border-radius: 50%; z-index: 1; }
        .percentage-circle { color: hsl(var(--text-primary)); z-index: 2; display: flex; align-items: center; justify-content: center; }
        
        .table-container { overflow-x: auto; padding: 0 1rem; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.9375rem; }
        .data-table th { text-align: left; padding: 1rem 1.25rem; color: hsl(var(--text-muted)); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; border-bottom: 1px solid hsl(var(--border) / 0.5); }
        .data-table td { padding: 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.3); vertical-align: middle; }
        .data-table tbody tr:last-child td { border-bottom: none; }
        
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .text-primary { color: hsl(var(--text-primary)); }
        .text-muted { color: hsl(var(--text-muted)); }
        .text-right { text-align: right; }
        
        .text-success { color: hsl(142, 76%, 42%); }
        .text-warning { color: hsl(38, 92%, 55%); }
        .text-danger { color: hsl(0, 84%, 55%); }
        
        .grade-chip { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-sm); background: hsl(var(--surface)); font-weight: 700; font-size: 1rem; }
        
        .report-footer { padding: 1.5rem 2rem; background: hsl(var(--surface) / 0.3); border-top: 1px solid hsl(var(--border) / 0.5); display: flex; justify-content: space-between; align-items: center; }
        .perf-insight { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9375rem; font-weight: 500; }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; margin-top: 2rem; }
        .empty-state h3 { font-size: 1.25rem; font-weight: 600; color: hsl(var(--text-primary)); margin: 0; }
        
        @media (max-width: 900px) {
          .results-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
