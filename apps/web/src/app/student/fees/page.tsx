'use client';

import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, Clock, Download, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

type FeeRecord = {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  feeName: string;
  frequency: string;
  paymentMethod?: string;
  transactionId?: string;
};

export default function StudentFeesPage() {
  const { user } = useAuthStore();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchFees();
  }, [user]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/fees/student/me');
      setFees(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Mock data
      setFees([
        { id: '1', feeName: 'Annual Tuition Fee', frequency: 'annual', amount: 5000, dueDate: '2026-06-30T00:00:00Z', status: 'pending' },
        { id: '2', feeName: 'Library Fee', frequency: 'annual', amount: 200, dueDate: '2026-03-15T00:00:00Z', status: 'paid', paidDate: '2026-03-10T14:30:00Z', paymentMethod: 'credit_card', transactionId: 'TXN-987654321' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const pendingFees = fees.filter(f => f.status === 'pending');
  const totalPendingAmount = pendingFees.reduce((sum, f) => sum + Number(f.amount), 0);

  return (
    <div className="student-fees-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><DollarSign size={24} /> Fee Status</h1>
          <p className="page-subtitle">Track your fee payments and due dates</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card highlight-card">
          <div className="stat-content">
            <h3 className="stat-title text-white">Total Amount Due</h3>
            <p className="stat-value text-white">${totalPendingAmount.toLocaleString()}</p>
          </div>
          {totalPendingAmount > 0 && (
            <button className="btn btn-secondary pay-btn">Pay Now</button>
          )}
        </div>
      </div>

      <div className="card list-card mt-6">
        <div className="list-header border-b pb-4 mb-0 px-5 pt-5">
          <h3 className="font-semibold text-lg">Fee Records</h3>
        </div>

        {loading ? (
          <div className="loading-state">Loading your fee records...</div>
        ) : fees.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} className="text-muted" />
            <h3>No fee records found</h3>
            <p>You do not have any fee records assigned.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fee Details</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Payment Info</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {fees.map(fee => {
                  const isOverdue = fee.status === 'pending' && new Date(fee.dueDate) < new Date();
                  
                  return (
                    <tr key={fee.id}>
                      <td>
                        <div className="font-medium">{fee.feeName}</div>
                        <div className="text-xs text-muted capitalize">{fee.frequency}</div>
                      </td>
                      <td>
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-danger font-medium' : 'text-muted'}`}>
                          {isOverdue && <AlertTriangle size={14} />}
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        {fee.status === 'paid' ? (
                          <span className="status-badge status-paid"><CheckCircle size={12} /> Paid</span>
                        ) : (
                          <span className={`status-badge ${isOverdue ? 'status-overdue' : 'status-pending'}`}>
                            <Clock size={12} /> {isOverdue ? 'Overdue' : 'Pending'}
                          </span>
                        )}
                      </td>
                      <td>
                        {fee.status === 'paid' ? (
                          <div className="text-xs">
                            <div className="text-muted">Paid on {new Date(fee.paidDate!).toLocaleDateString()}</div>
                            {fee.transactionId && <div className="font-mono mt-1">{fee.transactionId}</div>}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="text-right font-semibold text-primary">
                        ${Number(fee.amount).toLocaleString()}
                      </td>
                      <td className="text-center">
                        {fee.status === 'paid' ? (
                          <button className="btn btn-sm btn-ghost btn-icon" title="Download Receipt">
                            <Download size={16} />
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-primary">Pay</button>
                        )}
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
        .student-fees-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .page-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; font-weight: 700; }
        .page-subtitle { font-size: 0.875rem; color: hsl(var(--text-muted)); margin-top: 0.25rem; }
        
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        
        .highlight-card { 
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(262, 80%, 60%)); 
          display: flex; justify-content: space-between; align-items: center; padding: 2rem; border: none;
        }
        
        .stat-title { font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; opacity: 0.9; }
        .stat-value { font-size: 2.5rem; font-weight: 700; }
        .text-white { color: white; }
        
        .pay-btn { background: white; color: hsl(var(--primary)); border: none; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .pay-btn:hover { background: hsl(var(--bg-secondary)); }
        
        .mt-6 { margin-top: 1.5rem; }
        .mb-0 { margin-bottom: 0; }
        .mt-1 { margin-top: 0.25rem; }
        .pb-4 { padding-bottom: 1rem; }
        .pt-5 { padding-top: 1.25rem; }
        .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
        .border-b { border-bottom: 1px solid hsl(var(--border) / 0.5); }
        
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-1 { gap: 0.25rem; }
        
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .font-mono { font-family: monospace; }
        .text-lg { font-size: 1.125rem; }
        .text-xs { font-size: 0.75rem; }
        .text-muted { color: hsl(var(--text-muted)); }
        .text-danger { color: hsl(0, 84%, 55%); }
        .text-primary { color: hsl(var(--text-primary)); }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .capitalize { text-transform: capitalize; }
        
        .list-card { padding: 0; overflow: hidden; }
        
        .table-container { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .data-table th { text-align: left; padding: 0.875rem 1.25rem; color: hsl(var(--text-muted)); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; background: hsl(var(--surface) / 0.3); border-bottom: 1px solid hsl(var(--border)); }
        .data-table td { padding: 1.25rem 1.25rem; border-bottom: 1px solid hsl(var(--border) / 0.3); vertical-align: middle; }
        .data-table th.text-center { text-align: center; }
        .data-table tbody tr:hover { background: hsl(var(--surface) / 0.2); }
        
        .status-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.625rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; }
        .status-paid { background: hsl(142, 76%, 42%, 0.15); color: hsl(142, 76%, 48%); }
        .status-pending { background: hsl(38, 92%, 55%, 0.15); color: hsl(38, 92%, 55%); }
        .status-overdue { background: hsl(0, 84%, 55%, 0.15); color: hsl(0, 84%, 55%); }
        
        .loading-state, .empty-state { padding: 4rem; text-align: center; color: hsl(var(--text-muted)); display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
      `}</style>
    </div>
  );
}
