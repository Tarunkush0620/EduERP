'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { Modal } from '@/components/shared/modal';
import apiClient from '@/lib/api-client';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fallback dummy data while API is mocked or if empty
      const res = await apiClient.get('/users').catch(() => ({ data: [] }));
      
      if (res.data && res.data.length > 0) {
        setUsers(res.data);
      } else {
        setUsers([
          { id: '1', name: 'Super Admin', email: 'admin@eduerp.com', role: 'super_admin', status: 'active', createdAt: '2023-01-01' },
          { id: '2', name: 'John Doe', email: 'john@eduerp.com', role: 'teacher', status: 'active', createdAt: '2023-02-15' },
          { id: '3', name: 'Jane Smith', email: 'jane@eduerp.com', role: 'student', status: 'inactive', createdAt: '2023-03-10' },
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as const },
    { header: 'Email', accessor: 'email' as const },
    { 
      header: 'Role', 
      accessor: (row: any) => (
        <span className={`badge ${
          row.role === 'super_admin' ? 'badge-danger' : 
          row.role === 'teacher' ? 'badge-primary' : 'badge-info'
        }`}>
          {row.role.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    { 
      header: 'Created At', 
      accessor: (row: any) => new Date(row.createdAt).toLocaleDateString() 
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-md hover:bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] transition-colors" title="Edit">
            <Edit2 size={16} />
          </button>
          {row.role !== 'super_admin' && (
            <button className="p-1.5 rounded-md hover:bg-[hsl(var(--danger)/0.15)] text-[hsl(var(--danger))] transition-colors" title="Suspend">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">User Management</h1>
          <p className="text-[hsl(var(--text-muted))] text-sm">Manage system users, roles, and access.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        searchPlaceholder="Search users by name or email..."
      />
    </div>
  );
}
