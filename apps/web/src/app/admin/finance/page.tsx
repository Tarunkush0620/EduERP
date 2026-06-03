'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, CheckCircle, Clock, AlertTriangle, FileText, Download } from 'lucide-react';
import apiClient from '@/lib/api-client';

type FeeStructure = {
  id: string;
  name: string;
  className: string;
  amount: number;
  frequency: string;
};

type FeeRecord = {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  feeName: string;
  studentName?: string;
  rollNumber?: string;
  className?: string;
};

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'structures' | 'collection'>('overview');
  
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [dueFees, setDueFees] = useState<FeeRecord[]>([]);
  const [report, setReport] = useState({ totalCollected: 0, totalPending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [structRes, dueRes, reportRes] = await Promise.all([
        apiClient.get('/fees/structure'),
        apiClient.get('/fees/due'),
        apiClient.get('/fees/report')
      ]);
      
      setStructures(structRes.data?.data || structRes.data || []);
      setDueFees(dueRes.data?.data || dueRes.data || []);
      setReport(reportRes.data?.data || reportRes.data || { totalCollected: 0, totalPending: 0 });
    } catch (e) {
      console.error(e);
      // Mock data
      setStructures([
        { id: '1', name: 'Annual Tuition Fee', className: 'Class 10-A', amount: 5000, frequency: 'annual' },
        { id: '2', name: 'Lab Fee', className: 'Class 10-A', amount: 500, frequency: 'annual' },
      ]);
      setDueFees([
        { id: 'f1', amount: 5000, dueDate: '2026-05-01T00:00:00Z', status: 'pending', feeName: 'Annual Tuition Fee', studentName: 'John Doe', rollNumber: 'R101', className: 'Class 10-A' },
        { id: 'f2', amount: 500, dueDate: '2026-05-15T00:00:00Z', status: 'pending', feeName: 'Lab Fee', studentName: 'Jane Smith', rollNumber: 'R102', className: 'Class 10-A' },
      ]);
      setReport({ totalCollected: 150000, totalPending: 45000 });
    } finally {
      setLoading(false);
    }
  };

  const totalExpected = Number(report.totalCollected) + Number(report.totalPending);
  const collectionRate = totalExpected > 0 ? Math.round((Number(report.totalCollected) / totalExpected) * 100) : 0;

  return (
    <div className="finance-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><DollarSign size={24} /> Fee Management</h1>
          <p className="page-subtitle">Manage fee structures, track collections, and view financial reports</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline"><FileText size={16} /> Generate Invoice</button>
          <button className="btn btn-primary"><Plus size={16} /> Record Payment</button>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview & Reports
        </button>
        <button className={`tab-btn ${activeTab === 'structures' ? 'active' : ''}`} onClick={() => setActiveTab('structures')}>
          Fee Structures
        </button>
        <button className={`tab-btn ${activeTab === 'collection' ? 'active' : ''}`} onClick={() => setActiveTab('collection')}>
          Due Collections
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading financial data...</div>
      ) : (
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="dashboard-grid">
                <div className="card stat-card">
                  <div className="stat-icon bg-success-light text-success"><DollarSign size={24} /></div>
                  <div className="stat-content">
                    <h3 className="stat-title">Total Collected</h3>
                    <p className="stat-value text-success">${Number(report.totalCollected).toLocaleString()}</p>
                  </div>
                </div>
                <div className="card stat-card">
                  <div className="stat-icon bg-warning-light text-warning"><Clock size={24} /></div>
                  <div className="stat-content">
                    <h3 className="stat-title">Total Pending</h3>
                    <p className="stat-value text-warning">${Number(report.totalPending).toLocaleString()}</p>
                  </div>
                </div>
                <div className="card stat-card">
                  <div className="stat-icon bg-primary-light text-primary"><CheckCircle size={24} /></div>
                  <div className="stat-content">
                    <h3 className="stat-title">Collection Rate</h3>
                    <p className="stat-value">{collectionRate}%</p>
                  </div>
                </div>
              </div>

              <div className="card mt-6">
                <div className="card-header border-b pb-4 mb-4">
                  <h3 className="font-semibold text-lg">Financial Summary</h3>
                  <button className="btn btn-sm btn-ghost"><Download size={14} /> Download Report</button>
                </div>
                <div className="report-chart-placeholder">
                  {/* Replace with actual chart component */}
                  <div className="bar-chart">
                    <div className="bar-row">
                      <div className="bar-label">Collected</div>
                      <div className="bar-track">
                        <div className="bar-fill bg-success" style={{ width: `${collectionRate}%` }}></div>
                      </div>
                      <div className="bar-value">${Number(report.totalCollected).toLocaleString()}</div>
                    </div>
                    <div className="bar-row">
                      <div className="bar-label">Pending</div>
                      <div className="bar-track">
                        <div className="bar-fill bg-warning" style={{ width: `${100 - collectionRate}%` }}></div>
                      </div>
                      <div className="bar-value">${Number(report.totalPending).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Structures Tab */}
          {activeTab === 'structures' && (
            <div className="card list-card">
              <div className="list-header border-b pb-4 mb-0 px-5 pt-5 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Fee Structures</h3>
                <button className="btn btn-sm btn-primary"><Plus size={14} /> Add Structure</button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Amount</th>
                      <th>Frequency</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structures.map(s => (
                      <tr key={s.id}>
                        <td className="font-medium">{s.name}</td>
                        <td>{s.className}</td>
                        <td className="font-semibold text-primary">${Number(s.amount).toLocaleString()}</td>
                        <td><span className="badge-outline">{s.frequency}</span></td>
                        <td className="text-right">
                          <button className="btn btn-sm btn-ghost">Edit</button>
                        </td>
                      </tr>
                    ))}
                    {structures.length === 0 && (
                      <tr><td colSpan={5} className="text-center text-muted py-8">No fee structures defined.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Collection Tab */}
          {activeTab === 'collection' && (
            <div className="card list-card">
              <div className="list-header border-b pb-4 mb-0 px-5 pt-5 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Overdue Collections</h3>
                <div className="search-bar">
                  <Search size={14} />
                  <input type="text" placeholder="Search student or roll no..." />
                </div>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Fee Type</th>
                      <th>Due Date</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dueFees.map(f => (
                      <tr key={f.id}>
                        <td>
                          <div className="font-medium">{f.studentName}</div>
                          <div className="text-xs text-muted">{f.rollNumber}</div>
                        </td>
                        <td>{f.className}</td>
                        <td>{f.feeName}</td>
                        <td>
                          <div className="flex items-center gap-1 text-danger">
                            <AlertTriangle size={12} />
                            <span>{new Date(f.dueDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="text-right font-semibold">${Number(f.amount).toLocaleString()}</td>
                        <td className="text-right">
                          <button className="btn btn-sm btn-secondary">Collect</button>
                        </td>
                      </tr>
                    ))}
                    {dueFees.length === 0 && (
                      <tr><td colSpan={6} className="text-center text-muted py-8">No overdue fees!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .finance-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        .header-actions { display: flex; gap: 0.75rem; }
        
        .filter-tabs { display: flex; gap: 0.5rem; border-bottom: 1px solid hsl(var(--border)); padding-bottom: 0.5rem; }
        .tab-btn { background: transparent; border: none; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: hsl(var(--text-muted)); cursor: pointer; border-radius: var(--radius-md); transition: all 0.2s; }
        .tab-btn:hover { background: hsl(var(--surface)); color: hsl(var(--text-primary)); }
        .tab-btn.active { background: hsl(var(--primary) / 0.15); color: hsl(var(--primary-light)); }
        
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
        .stat-value { font-size: 1.5rem; font-weight: 700; display: flex; align-items: baseline; gap: 0.25rem; }
        
        .mt-6 { margin-top: 1.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-0 { margin-bottom: 0; }
        .pb-4 { padding-bottom: 1rem; }
        .pt-5 { padding-top: 1.25rem; }
        .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .border-b { border-bottom: 1px solid hsl(var(--border) / 0.5); }
        
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-1 { gap: 0.25rem; }
        
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .text-lg { font-size: 1.125rem; }
        .text-xs { font-size: 0.75rem; }
        .text-muted { color: hsl(var(--text-muted)); }
        .text-danger { color: hsl(0, 84%, 55%); }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .card-header { display: flex; justify-content: space-between; align-items: center; }
        
        .list-card { padding: 0; overflow: hidden; }
        
        .search-bar { display: flex; align-items: center; gap: 0.5rem; background: hsl(var(--surface) / 0.5); padding: 0.375rem 0.75rem; border-radius: var(--radius-md); border: 1px solid hsl(var(--border)); width: 250px; }
        .search-bar input { background: transparent; border: none; outline: none; font-size: 0.8125rem; color: hsl(var(--text-primary)); width: 100%; }
        
        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .data-table th { text-align: left; padding: 0.875rem 1.25rem; color: hsl(var(--text-muted)); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; background: hsl(var(--surface) / 0.3); border-bottom: 1px solid hsl(var(--border)); }
        .data-table td { padding: 1rem 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.3); vertical-align: middle; }
        .data-table tbody tr:hover { background: hsl(var(--surface) / 0.2); }
        
        .badge-outline { display: inline-block; padding: 0.125rem 0.5rem; border: 1px solid hsl(var(--border)); border-radius: var(--radius-sm); font-size: 0.75rem; color: hsl(var(--text-secondary)); text-transform: capitalize; }
        
        /* Simple Bar Chart */
        .bar-chart { display: flex; flex-direction: column; gap: 1rem; padding: 1rem 0; }
        .bar-row { display: flex; align-items: center; gap: 1rem; }
        .bar-label { width: 80px; font-size: 0.875rem; font-weight: 500; color: hsl(var(--text-secondary)); }
        .bar-track { flex: 1; height: 12px; background: hsl(var(--surface)); border-radius: var(--radius-full); overflow: hidden; }
        .bar-fill { height: 100%; border-radius: var(--radius-full); }
        .bg-success { background: hsl(142, 76%, 42%); }
        .bg-warning { background: hsl(38, 92%, 55%); }
        .bar-value { width: 100px; text-align: right; font-weight: 600; font-size: 0.875rem; }
        
        .loading-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); }
      `}</style>
    </div>
  );
}
