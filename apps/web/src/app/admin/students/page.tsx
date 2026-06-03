'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Activity } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { Modal } from '@/components/shared/modal';
import apiClient from '@/lib/api-client';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await apiClient.get('/students').catch(() => ({ data: [] }));
      
      if (res.data && res.data.length > 0) {
        setStudents(res.data);
      } else {
        setStudents([
          { id: '1', rollNumber: 'STU-001', name: 'Alex Johnson', className: 'Class 10', sectionName: 'A', status: 'active' },
          { id: '2', rollNumber: 'STU-002', name: 'Emma Watson', className: 'Class 10', sectionName: 'A', status: 'active' },
          { id: '3', rollNumber: 'STU-003', name: 'Michael Brown', className: 'Class 9', sectionName: 'B', status: 'active' },
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { header: 'Roll Number', accessor: 'rollNumber' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Class', accessor: 'className' as const },
    { header: 'Section', accessor: 'sectionName' as const },
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
          <button className="btn btn-ghost btn-icon text-[hsl(var(--info))]"><Activity size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Students</h1>
          <p className="text-[hsl(var(--text-muted))] text-sm">Manage student enrollment, promotions, and transfers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Enroll Student
        </button>
      </div>

      <DataTable columns={columns} data={students} searchPlaceholder="Search students by roll number or name..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enroll New Student">
        <form className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label>Full Name</label>
              <input type="text" className="input" placeholder="e.g. Alex Johnson" required />
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input type="text" className="input" placeholder="e.g. STU-004" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="input" placeholder="e.g. alex@eduerp.com" required />
            </div>
            <div className="form-group">
              <label>Class</label>
              <select className="input bg-[hsl(var(--bg-secondary))]">
                <option value="">Select Class</option>
                <option value="1">Class 10</option>
                <option value="2">Class 9</option>
              </select>
            </div>
            <div className="form-group">
              <label>Section</label>
              <select className="input bg-[hsl(var(--bg-secondary))]">
                <option value="">Select Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Enroll Student</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
