'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, BookOpen } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { Modal } from '@/components/shared/modal';
import apiClient from '@/lib/api-client';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await apiClient.get('/teachers').catch(() => ({ data: [] }));
      
      if (res.data && res.data.length > 0) {
        setTeachers(res.data);
      } else {
        setTeachers([
          { id: '1', employeeId: 'T-1001', name: 'John Doe', department: 'Science', qualification: 'M.Sc Physics', status: 'active' },
          { id: '2', employeeId: 'T-1002', name: 'Sarah Connor', department: 'Mathematics', qualification: 'Ph.D Math', status: 'active' },
          { id: '3', employeeId: 'T-1003', name: 'Mike Ross', department: 'Languages', qualification: 'M.A English', status: 'active' },
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { header: 'Employee ID', accessor: 'employeeId' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Department', accessor: 'department' as const },
    { header: 'Qualification', accessor: 'qualification' as const },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-icon text-[hsl(var(--primary))]"><Edit2 size={16} /></button>
          <button className="btn btn-ghost btn-icon text-[hsl(var(--secondary))]"><BookOpen size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Teachers</h1>
          <p className="text-[hsl(var(--text-muted))] text-sm">Manage teaching staff and assign classes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Teacher
        </button>
      </div>

      <DataTable columns={columns} data={teachers} searchPlaceholder="Search teachers..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Teacher">
        <form className="flex flex-col gap-4">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="input" placeholder="e.g. Jane Doe" required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="input" placeholder="e.g. jane@eduerp.com" required />
          </div>
          <div className="form-group">
            <label>Employee ID</label>
            <input type="text" className="input" placeholder="e.g. T-1004" required />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input type="text" className="input" placeholder="e.g. Science" />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Save Teacher</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
