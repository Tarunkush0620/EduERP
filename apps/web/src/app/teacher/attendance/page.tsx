'use client';

import { useState, useEffect } from 'react';
import {
  ClipboardCheck, Check, X, Clock, AlertCircle, Users,
  ChevronDown, Calendar, Save, RotateCcw, CheckCircle2,
} from 'lucide-react';
import apiClient from '@/lib/api-client';

type Student = { id: string; rollNumber: string; name: string };
type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
type ClassOption = { id: string; name: string };
type AttendanceEntry = { studentId: string; status: AttendanceStatus; remarks: string };

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedClassId && date) {
      fetchExistingAttendance();
    }
  }, [selectedClassId, date]);

  const fetchClasses = async () => {
    try {
      const res = await apiClient.get('/classes');
      const data = res.data?.data || res.data || [];
      setClasses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async (classId: string) => {
    setLoadingStudents(true);
    try {
      const res = await apiClient.get(`/attendance/class/${classId}/students`);
      const data = res.data?.data || res.data || [];
      setStudents(data);
      // Initialize all as present
      const initial: Record<string, AttendanceEntry> = {};
      data.forEach((s: Student) => {
        initial[s.id] = { studentId: s.id, status: 'present', remarks: '' };
      });
      setEntries(initial);
      setSaved(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const res = await apiClient.get(`/attendance/class/${selectedClassId}/date/${date}`);
      const existing = res.data?.data || res.data || [];
      if (existing.length > 0) {
        const loaded: Record<string, AttendanceEntry> = {};
        existing.forEach((r: any) => {
          loaded[r.studentId] = { studentId: r.studentId, status: r.status, remarks: r.remarks || '' };
        });
        // merge with current students (keep defaults for new students)
        setEntries((prev) => ({ ...prev, ...loaded }));
      }
    } catch (e) {
      // Not found = first time marking, that's fine
    }
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
    setSaved(false);
  };

  const setRemarks = (studentId: string, remarks: string) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const markAllAs = (status: AttendanceStatus) => {
    setEntries((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = { ...updated[id], status };
      });
      return updated;
    });
    setSaved(false);
  };

  const handleSubmit = async () => {
    if (!selectedClassId || Object.keys(entries).length === 0) return;
    setSaving(true);
    try {
      await apiClient.post('/attendance/mark', {
        classId: selectedClassId,
        date,
        entries: Object.values(entries),
      });
      setSaved(true);
    } catch (e) {
      console.error(e);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(entries).filter((e) => e.status === 'present').length;
  const absentCount = Object.values(entries).filter((e) => e.status === 'absent').length;
  const lateCount = Object.values(entries).filter((e) => e.status === 'late').length;
  const excusedCount = Object.values(entries).filter((e) => e.status === 'excused').length;
  const totalCount = students.length;

  return (
    <div className="attendance-page animate-fade-in">
      {/* Header */}
      <div className="att-header">
        <div>
          <h1 className="att-title"><ClipboardCheck size={24} /> Mark Attendance</h1>
          <p className="att-subtitle">Select a class and date to mark student attendance</p>
        </div>
      </div>

      {/* Selectors */}
      <div className="att-selectors card">
        <div className="selector-row">
          <div className="selector-field">
            <label className="selector-label">Class</label>
            <div className="select-wrapper">
              <select
                className="input"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">Choose a class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="select-chevron" />
            </div>
          </div>
          <div className="selector-field">
            <label className="selector-label">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      {selectedClassId && students.length > 0 && (
        <div className="stats-bar stagger-children">
          <div className="stat-chip stat-present">
            <Check size={14} /> {presentCount} Present
          </div>
          <div className="stat-chip stat-absent">
            <X size={14} /> {absentCount} Absent
          </div>
          <div className="stat-chip stat-late">
            <Clock size={14} /> {lateCount} Late
          </div>
          <div className="stat-chip stat-excused">
            <AlertCircle size={14} /> {excusedCount} Excused
          </div>
          <div className="stat-chip stat-total">
            <Users size={14} /> {totalCount} Total
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {selectedClassId && students.length > 0 && (
        <div className="quick-mark-bar">
          <span className="quick-mark-label">Quick:</span>
          <button className="btn btn-sm btn-secondary" onClick={() => markAllAs('present')}>
            <Check size={14} /> All Present
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => markAllAs('absent')}>
            <X size={14} /> All Absent
          </button>
        </div>
      )}

      {/* Student List */}
      {loadingStudents ? (
        <div className="loading-state">Loading students...</div>
      ) : selectedClassId && students.length === 0 ? (
        <div className="empty-state card">
          <Users size={48} />
          <h3>No Students Found</h3>
          <p>No active students are enrolled in this class.</p>
        </div>
      ) : selectedClassId ? (
        <div className="student-list card">
          <div className="student-list-header">
            <span>Roll No</span>
            <span>Student Name</span>
            <span>Status</span>
            <span>Remarks</span>
          </div>
          {students.map((student, idx) => {
            const entry = entries[student.id];
            return (
              <div key={student.id} className={`student-row ${entry?.status || ''}`} style={{ animationDelay: `${idx * 30}ms` }}>
                <span className="roll-no">{student.rollNumber}</span>
                <span className="student-name">{student.name}</span>
                <div className="status-btns">
                  <button
                    className={`status-btn present ${entry?.status === 'present' ? 'active' : ''}`}
                    onClick={() => setStatus(student.id, 'present')}
                    title="Present"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    className={`status-btn absent ${entry?.status === 'absent' ? 'active' : ''}`}
                    onClick={() => setStatus(student.id, 'absent')}
                    title="Absent"
                  >
                    <X size={14} />
                  </button>
                  <button
                    className={`status-btn late ${entry?.status === 'late' ? 'active' : ''}`}
                    onClick={() => setStatus(student.id, 'late')}
                    title="Late"
                  >
                    <Clock size={14} />
                  </button>
                  <button
                    className={`status-btn excused ${entry?.status === 'excused' ? 'active' : ''}`}
                    onClick={() => setStatus(student.id, 'excused')}
                    title="Excused"
                  >
                    <AlertCircle size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  className="input remarks-input"
                  placeholder="Optional remarks..."
                  value={entry?.remarks || ''}
                  onChange={(e) => setRemarks(student.id, e.target.value)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state card">
          <Calendar size={48} />
          <h3>Select a Class</h3>
          <p>Choose a class from the dropdown above to begin marking attendance.</p>
        </div>
      )}

      {/* Submit Button */}
      {selectedClassId && students.length > 0 && (
        <div className="submit-bar">
          {saved && (
            <span className="saved-badge">
              <CheckCircle2 size={16} /> Attendance saved successfully!
            </span>
          )}
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <><RotateCcw size={16} className="spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Attendance</>
            )}
          </button>
        </div>
      )}

      <style jsx>{`
        .attendance-page {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .att-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .att-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .att-subtitle {
          font-size: 0.875rem;
          color: hsl(var(--text-muted));
          margin-top: 0.25rem;
        }
        .att-selectors {
          padding: 1.25rem;
        }
        .selector-row {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }
        .selector-field {
          flex: 1;
          max-width: 300px;
        }
        .selector-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(var(--text-secondary));
          margin-bottom: 0.375rem;
        }
        .select-wrapper {
          position: relative;
        }
        .select-chevron {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: hsl(var(--text-muted));
        }
        .stats-bar {
          display: flex;
          gap: 0.625rem;
          flex-wrap: wrap;
        }
        .stat-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          border-radius: var(--radius-full);
          font-size: 0.8125rem;
          font-weight: 600;
          border: 1px solid transparent;
        }
        .stat-present {
          background: hsl(142, 76%, 42%, 0.12);
          color: hsl(142, 76%, 48%);
          border-color: hsl(142, 76%, 42%, 0.2);
        }
        .stat-absent {
          background: hsl(0, 84%, 55%, 0.12);
          color: hsl(0, 84%, 60%);
          border-color: hsl(0, 84%, 55%, 0.2);
        }
        .stat-late {
          background: hsl(38, 92%, 55%, 0.12);
          color: hsl(38, 92%, 55%);
          border-color: hsl(38, 92%, 55%, 0.2);
        }
        .stat-excused {
          background: hsl(222, 84%, 55%, 0.12);
          color: hsl(222, 84%, 65%);
          border-color: hsl(222, 84%, 55%, 0.2);
        }
        .stat-total {
          background: hsl(var(--surface) / 0.5);
          color: hsl(var(--text-secondary));
          border-color: hsl(var(--border));
        }
        .quick-mark-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .quick-mark-label {
          font-size: 0.8125rem;
          color: hsl(var(--text-muted));
          font-weight: 500;
        }
        .student-list {
          padding: 0;
          overflow: hidden;
        }
        .student-list-header {
          display: grid;
          grid-template-columns: 80px 2fr 200px 1fr;
          gap: 1rem;
          padding: 0.75rem 1.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: hsl(var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--surface) / 0.3);
        }
        .student-row {
          display: grid;
          grid-template-columns: 80px 2fr 200px 1fr;
          gap: 1rem;
          padding: 0.75rem 1.25rem;
          align-items: center;
          border-bottom: 1px solid hsl(var(--border) / 0.5);
          transition: background var(--transition-fast);
          animation: fadeSlideIn 0.3s ease-out both;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .student-row:last-child {
          border-bottom: none;
        }
        .student-row:hover {
          background: hsl(var(--surface) / 0.3);
        }
        .student-row.present {
          border-left: 3px solid hsl(142, 76%, 42%);
        }
        .student-row.absent {
          border-left: 3px solid hsl(0, 84%, 55%);
        }
        .student-row.late {
          border-left: 3px solid hsl(38, 92%, 55%);
        }
        .student-row.excused {
          border-left: 3px solid hsl(222, 84%, 55%);
        }
        .roll-no {
          font-size: 0.8125rem;
          font-weight: 600;
          color: hsl(var(--text-muted));
          font-family: monospace;
        }
        .student-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: hsl(var(--text-primary));
        }
        .status-btns {
          display: flex;
          gap: 0.375rem;
        }
        .status-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          border: 1.5px solid hsl(var(--border));
          background: transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          color: hsl(var(--text-muted));
        }
        .status-btn:hover {
          border-color: hsl(var(--border-light));
        }
        .status-btn.present.active {
          background: hsl(142, 76%, 42%);
          border-color: hsl(142, 76%, 42%);
          color: white;
          box-shadow: 0 0 12px hsl(142, 76%, 42%, 0.3);
        }
        .status-btn.absent.active {
          background: hsl(0, 84%, 55%);
          border-color: hsl(0, 84%, 55%);
          color: white;
          box-shadow: 0 0 12px hsl(0, 84%, 55%, 0.3);
        }
        .status-btn.late.active {
          background: hsl(38, 92%, 55%);
          border-color: hsl(38, 92%, 55%);
          color: white;
          box-shadow: 0 0 12px hsl(38, 92%, 55%, 0.3);
        }
        .status-btn.excused.active {
          background: hsl(222, 84%, 55%);
          border-color: hsl(222, 84%, 55%);
          color: white;
          box-shadow: 0 0 12px hsl(222, 84%, 55%, 0.3);
        }
        .remarks-input {
          padding: 0.375rem 0.625rem !important;
          font-size: 0.75rem !important;
        }
        .submit-bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1rem 0;
        }
        .saved-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(142, 76%, 48%);
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
        }
        .btn-lg {
          padding: 0.75rem 1.5rem;
          font-size: 0.9375rem;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .loading-state {
          text-align: center;
          padding: 3rem;
          color: hsl(var(--text-muted));
          font-size: 0.875rem;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          gap: 0.75rem;
          color: hsl(var(--text-muted));
          text-align: center;
        }
        .empty-state h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: hsl(var(--text-secondary));
        }
        .empty-state p {
          font-size: 0.8125rem;
        }
        @media (max-width: 768px) {
          .selector-row {
            flex-direction: column;
          }
          .selector-field {
            max-width: 100%;
          }
          .student-list-header,
          .student-row {
            grid-template-columns: 50px 1fr;
          }
          .student-list-header span:nth-child(3),
          .student-list-header span:nth-child(4),
          .student-row .status-btns,
          .student-row .remarks-input {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
