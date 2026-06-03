'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, getDashboardRoute } from '@/stores/auth-store';
import { Role } from '@eduerp/shared';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck,
  FileText, BarChart3, DollarSign, Bell, MessageSquare, Settings,
  Calendar, Award, LogOut, ChevronLeft, Menu, Search,
  UserCircle, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import AiAssistant from '@/components/ui/AiAssistant';

// Sidebar menu config per role
const menuConfig: Record<string, Array<{ label: string; icon: React.ReactNode; href: string; section?: string }>> = {
  [Role.SUPER_ADMIN]: [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin' },
    { label: 'Users', icon: <Users size={20} />, href: '/admin/users', section: 'Management' },
    { label: 'Teachers', icon: <GraduationCap size={20} />, href: '/admin/teachers' },
    { label: 'Students', icon: <BookOpen size={20} />, href: '/admin/students' },
    { label: 'Classes', icon: <Calendar size={20} />, href: '/admin/classes' },
    { label: 'Attendance', icon: <ClipboardCheck size={20} />, href: '/admin/attendance', section: 'Academic' },
    { label: 'Assignments', icon: <FileText size={20} />, href: '/admin/assignments' },
    { label: 'Examinations', icon: <Award size={20} />, href: '/admin/exams' },
    { label: 'Fee Management', icon: <DollarSign size={20} />, href: '/admin/finance', section: 'Finance' },
    { label: 'Reports', icon: <BarChart3 size={20} />, href: '/admin/reports' },
    { label: 'Announcements', icon: <Bell size={20} />, href: '/admin/announcements', section: 'Communication' },
    { label: 'Messages', icon: <MessageSquare size={20} />, href: '/admin/messages' },
    { label: 'Settings', icon: <Settings size={20} />, href: '/admin/settings', section: 'System' },
  ],
  [Role.TEACHER]: [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/teacher' },
    { label: 'Attendance', icon: <ClipboardCheck size={20} />, href: '/teacher/attendance', section: 'Classroom' },
    { label: 'Attendance History', icon: <ClipboardCheck size={20} />, href: '/teacher/attendance/history' },
    { label: 'Assignments', icon: <FileText size={20} />, href: '/teacher/assignments' },
    { label: 'Gradebook', icon: <Award size={20} />, href: '/teacher/gradebook' },
    { label: 'My Students', icon: <Users size={20} />, href: '/teacher/students', section: 'Management' },
    { label: 'Timetable', icon: <Calendar size={20} />, href: '/teacher/timetable' },
    { label: 'Announcements', icon: <Bell size={20} />, href: '/teacher/announcements', section: 'Communication' },
    { label: 'Messages', icon: <MessageSquare size={20} />, href: '/teacher/messages' },
  ],
  [Role.STUDENT]: [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/student' },
    { label: 'Timetable', icon: <Calendar size={20} />, href: '/student/timetable', section: 'Academic' },
    { label: 'Assignments', icon: <FileText size={20} />, href: '/student/assignments' },
    { label: 'Results', icon: <Award size={20} />, href: '/student/results' },
    { label: 'Attendance', icon: <ClipboardCheck size={20} />, href: '/student/attendance' },
    { label: 'Fee Status', icon: <DollarSign size={20} />, href: '/student/fees', section: 'Finance' },
    { label: 'Announcements', icon: <Bell size={20} />, href: '/student/announcements', section: 'Info' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    // Redirect if accessing wrong role's routes
    const expectedPrefix = getDashboardRoute(user.role);
    if (!pathname.startsWith(expectedPrefix)) {
      router.replace(expectedPrefix);
    }
  }, [isAuthenticated, user, pathname, router]);

  if (!isAuthenticated || !user) return null;

  const menuItems = menuConfig[user.role] || [];
  const roleLabel = user.role === Role.SUPER_ADMIN ? 'Super Admin' :
                    user.role === Role.TEACHER ? 'Teacher' : 'Student';

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  let currentSection = '';

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'} ${mobileMenuOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
            <div className="sidebar-logo-icon">
              <GraduationCap size={22} />
            </div>
            <span className="sidebar-logo-text">EduERP</span>
          </div>
          <button
            className="btn btn-ghost btn-icon sidebar-toggle"
            onClick={() => { setSidebarOpen(!sidebarOpen); setMobileMenuOpen(false); }}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => {
            const showSection = item.section && item.section !== currentSection;
            if (item.section) currentSection = item.section;

            return (
              <div key={item.href}>
                {showSection && sidebarOpen && (
                  <div className="sidebar-section-label">{item.section}</div>
                )}
                <a
                  href={item.href}
                  className={`sidebar-link ${pathname === item.href ? 'sidebar-link-active' : ''}`}
                  onClick={(e) => { e.preventDefault(); router.push(item.href); setMobileMenuOpen(false); }}
                  title={item.label}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  {sidebarOpen && <span className="sidebar-link-label">{item.label}</span>}
                </a>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={handleLogout} title="Logout">
            <span className="sidebar-link-icon"><LogOut size={20} /></span>
            {sidebarOpen && <span className="sidebar-link-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main content */}
      <div className={`main-area ${sidebarOpen ? 'main-area-expanded' : 'main-area-collapsed'}`}>
        {/* Navbar */}
        <header className="navbar">
          <div className="navbar-left">
            <button
              className="btn btn-ghost btn-icon mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={20} />
            </button>
            <div className="navbar-search">
              <Search size={16} className="navbar-search-icon" />
              <input
                type="text"
                placeholder="Search anything..."
                className="navbar-search-input"
              />
            </div>
          </div>

          <div className="navbar-right">
            <button className="btn btn-ghost btn-icon navbar-notification">
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            <div className="navbar-user">
              <div className="navbar-user-avatar">
                <UserCircle size={32} />
              </div>
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user.name}</span>
                <span className="navbar-user-role">{roleLabel}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
        
        {/* Global AI Assistant Widget */}
        <AiAssistant />
      </div>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        /* ─── Sidebar ─── */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          background: hsl(var(--bg-secondary));
          border-right: 1px solid hsl(var(--border));
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: width var(--transition-base);
          overflow: hidden;
        }

        .sidebar-open {
          width: var(--sidebar-width);
        }

        .sidebar-collapsed {
          width: var(--sidebar-collapsed-width);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          height: var(--navbar-height);
          border-bottom: 1px solid hsl(var(--border));
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .sidebar-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, hsl(222 84% 55%), hsl(262 80% 60%));
          color: white;
          flex-shrink: 0;
        }

        .sidebar-logo-text {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, hsl(222 84% 65%), hsl(262 80% 65%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-toggle {
          flex-shrink: 0;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 0.75rem;
        }

        .sidebar-section-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: hsl(var(--text-muted));
          padding: 1rem 0.75rem 0.375rem;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border-radius: var(--radius-md);
          color: hsl(var(--text-secondary));
          font-size: 0.875rem;
          font-weight: 450;
          text-decoration: none;
          transition: all var(--transition-fast);
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .sidebar-link:hover {
          background: hsl(var(--surface));
          color: hsl(var(--text-primary));
        }

        .sidebar-link-active {
          background: hsl(var(--primary) / 0.12);
          color: hsl(var(--primary-light));
        }

        .sidebar-link-active .sidebar-link-icon {
          color: hsl(var(--primary-light));
        }

        .sidebar-link-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .sidebar-footer {
          padding: 0.75rem;
          border-top: 1px solid hsl(var(--border));
        }

        .sidebar-logout {
          color: hsl(var(--danger)) !important;
        }

        .sidebar-logout:hover {
          background: hsl(var(--danger) / 0.1) !important;
        }

        .sidebar-overlay {
          display: none;
        }

        /* ─── Main Area ─── */
        .main-area {
          flex: 1;
          transition: margin-left var(--transition-base);
        }

        .main-area-expanded {
          margin-left: var(--sidebar-width);
        }

        .main-area-collapsed {
          margin-left: var(--sidebar-collapsed-width);
        }

        /* ─── Navbar ─── */
        .navbar {
          position: sticky;
          top: 0;
          height: var(--navbar-height);
          background: hsl(var(--bg-primary) / 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid hsl(var(--border));
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          z-index: 40;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mobile-menu-btn {
          display: none;
        }

        .navbar-search {
          position: relative;
          width: 300px;
        }

        .navbar-search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: hsl(var(--text-muted));
          pointer-events: none;
        }

        .navbar-search-input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.25rem;
          background: hsl(var(--surface));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-full);
          color: hsl(var(--text-primary));
          font-size: 0.8125rem;
          outline: none;
          transition: all var(--transition-fast);
        }

        .navbar-search-input:focus {
          border-color: hsl(var(--primary) / 0.5);
          background: hsl(var(--bg-secondary));
        }

        .navbar-search-input::placeholder {
          color: hsl(var(--text-muted));
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .navbar-notification {
          position: relative;
        }

        .notification-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background: hsl(var(--danger));
          border-radius: 50%;
          border: 2px solid hsl(var(--bg-primary));
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .navbar-user:hover {
          background: hsl(var(--surface));
        }

        .navbar-user-avatar {
          color: hsl(var(--text-secondary));
        }

        .navbar-user-info {
          display: flex;
          flex-direction: column;
        }

        .navbar-user-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
          line-height: 1.2;
        }

        .navbar-user-role {
          font-size: 0.6875rem;
          color: hsl(var(--text-muted));
        }

        /* ─── Page Content ─── */
        .page-content {
          padding: 1.75rem;
          min-height: calc(100vh - var(--navbar-height));
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
            width: var(--sidebar-width) !important;
          }

          .sidebar-mobile-open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 45;
          }

          .main-area {
            margin-left: 0 !important;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .navbar-search {
            width: 200px;
          }
        }

        @media (max-width: 640px) {
          .page-content {
            padding: 1rem;
          }

          .navbar-search {
            display: none;
          }

          .navbar-user-info {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
