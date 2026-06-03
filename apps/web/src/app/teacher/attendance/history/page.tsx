'use client';

import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Download, ChevronDown, Check, X, Clock, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api-client';

type ClassOption = { id: string; name: string };
type AttendanceRecord = {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks: string;
  studentName: string;
  rollNumber: string;
  subjectName?: string;
};

export default function TeacherAttendanceHistoryPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchHistory();
    }
  }, [selectedClassId, startDate, endDate]);

  const fetchClasses = async () => {
    try {
      const res = await apiClient.get('/classes');
      setClasses(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/attendance/class/${selectedClassId}`, {
        params: { startDate, endDate },
      });
      setRecords(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check size={14} className="text-success" />;
      case 'absent': return <X size={14} className="text-danger" />;
      case 'late': return <Clock size={14} className="text-warning" />;
      case 'excused': return <AlertCircle size={14} className="text-primary" />;
      default: return null;
    }
  };

  return (
    <div className="attendance-history animate-fade-in">
      <div className="hist-header">
        <div>
          <h1 className="hist-title"><Calendar size={24} /> Attendance History</h1>
          <p className="hist-subtitle">Review past attendance records for your classes</p>
        </div>
        <button className="btn btn-secondary">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="filters-card card">
        <div className="filter-grid">
          <div className="filter-field">
            <label>Class</label>
            <div className="select-wrapper">
              <select
                className="input"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="select-chevron" />
            </div>
          </div>
          <div className="filter-field">
            <label>Start Date</label>
            <input
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label>End Date</label>
            <input
              type="date"
              className="input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="records-card card">
        <div className="records-header">
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search student name or roll..." />
          </div>
          <button className="btn btn-ghost btn-sm"><Filter size={16} /> Filter Status</button>
        </div>

        {loading ? (
          <div className="loading-state">Loading records...</div>
        ) : !selectedClassId ? (
          <div className="empty-state">
            <Calendar size={32} />
            <p>Select a class to view history</p>
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <Search size={32} />
            <p>No records found for this date range.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td className="font-mono">{r.rollNumber}</td>
                    <td className="font-medium">{r.studentName}</td>
                    <td>{r.subjectName || '-'}</td>
                    <td>
                      <span className={`status-badge status-${r.status}`}>
                        {getStatusIcon(r.status)}
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-muted">{r.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .attendance-history { display: flex; flex-direction: column; gap: 1.25rem; }
        .hist-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .hist-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .hist-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        .filters-card { padding: 1.25rem; }
        .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .filter-field label { display: block; font-size: 0.8125rem; font-weight: 500; color: hsl(var(--text-secondary)); margin-bottom: 0.375rem; }
        .select-wrapper { position: relative; }
        .select-chevron { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none; color: hsl(var(--text-muted)); }
        
        .records-card { padding: 0; overflow: hidden; }
        .records-header { padding: 1rem 1.25rem; display: flex; justify-content: space-between; border-bottom: 1px solid hsl(var(--border) / 0.5); }
        .search-bar { display: flex; align-items: center; gap: 0.5rem; background: hsl(var(--surface) / 0.5); padding: 0.375rem 0.75rem; border-radius: var(--radius-md); border: 1px solid hsl(var(--border)); width: 300px; }
        .search-bar input { background: transparent; border: none; outline: none; font-size: 0.8125rem; color: hsl(var(--text-primary)); width: 100%; }
        
        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
        .data-table th { text-align: left; padding: 0.75rem 1.25rem; color: hsl(var(--text-muted)); font-weight: 600; text-transform: uppercase; background: hsl(var(--surface) / 0.3); border-bottom: 1px solid hsl(var(--border)); }
        .data-table td { padding: 0.875rem 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.3); color: hsl(var(--text-secondary)); }
        .data-table tbody tr:hover { background: hsl(var(--surface) / 0.2); }
        
        .font-mono { font-family: monospace; }
        .font-medium { font-weight: 500; color: hsl(var(--text-primary)); }
        .text-muted { color: hsl(var(--text-muted)); }
        
        .status-badge { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.25rem 0.625rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 500; }
        .status-present { background: hsl(142, 76%, 42%, 0.15); color: hsl(142, 76%, 48%); }
        .status-absent { background: hsl(0, 84%, 55%, 0.15); color: hsl(0, 84%, 60%); }
        .status-late { background: hsl(38, 92%, 55%, 0.15); color: hsl(38, 92%, 55%); }
        .status-excused { background: hsl(222, 84%, 55%, 0.15); color: hsl(222, 84%, 65%); }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      `}</style>
    </div>
  );
}
