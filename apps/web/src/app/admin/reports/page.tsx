'use client';

import { useState } from 'react';
import { BarChart3, Search, Download, Printer } from 'lucide-react';

export default function AdminReportsPage() {
  const [studentId, setStudentId] = useState('');

  return (
    <div className="reports-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><BarChart3 size={24} /> Reports & Analytics</h1>
          <p className="page-subtitle">Generate report cards and school performance reports</p>
        </div>
      </div>

      <div className="card">
        <h3>Generate Report Card</h3>
        <p className="text-muted mt-2 mb-4">Enter a Student ID to generate a comprehensive report card.</p>
        
        <div className="search-bar">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Enter Student ID..." 
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <button className="btn btn-primary ml-2">Generate</button>
        </div>
      </div>

      <style jsx>{`
        .reports-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        
        .text-muted { color: hsl(var(--text-muted)); }
        .mt-2 { margin-top: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .ml-2 { margin-left: 0.5rem; }
        
        .search-bar { display: flex; align-items: center; gap: 0.5rem; background: hsl(var(--surface) / 0.5); padding: 0.5rem 0.75rem; border-radius: var(--radius-md); border: 1px solid hsl(var(--border)); max-width: 500px; }
        .search-bar input { background: transparent; border: none; outline: none; font-size: 0.875rem; color: hsl(var(--text-primary)); width: 100%; }
      `}</style>
    </div>
  );
}
