'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Book } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { Modal } from '@/components/shared/modal';
import apiClient from '@/lib/api-client';

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await apiClient.get('/classes').catch(() => ({ data: [] }));
      
      if (res.data && res.data.length > 0) {
        setClasses(res.data);
      } else {
        setClasses([
          { id: '1', name: 'Class 10', description: 'High School', sections: [{name: 'A'}, {name: 'B'}] },
          { id: '2', name: 'Class 9', description: 'High School', sections: [{name: 'A'}] },
          { id: '3', name: 'Class 8', description: 'Middle School', sections: [{name: 'A'}, {name: 'B'}, {name: 'C'}] },
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { header: 'Class Name', accessor: 'name' as const },
    { header: 'Description', accessor: 'description' as const },
    { 
      header: 'Sections', 
      accessor: (row: any) => (
        <div className="flex gap-1">
          {row.sections?.map((s: any, i: number) => (
            <span key={i} className="badge badge-info">{s.name}</span>
          ))}
        </div>
      )
    },
    {
      header: 'Manage',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm" title="Manage Subjects">
            <Book size={14} /> Subjects
          </button>
          <button className="btn btn-secondary btn-sm" title="Assign Class Teacher">
            <Users size={14} /> Teachers
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Classes & Subjects</h1>
          <p className="text-[hsl(var(--text-muted))] text-sm">Configure school classes, sections, and assign subjects.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Class
        </button>
      </div>

      <DataTable columns={columns} data={classes} searchPlaceholder="Search classes..." />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Class">
        <form className="flex flex-col gap-4">
          <div className="form-group">
            <label>Class Name</label>
            <input type="text" className="input" placeholder="e.g. Class 11" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" className="input" placeholder="e.g. Senior Secondary" />
          </div>
          <div className="form-group">
            <label>Sections (comma separated)</label>
            <input type="text" className="input" placeholder="e.g. A, B, C" />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Create Class</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
