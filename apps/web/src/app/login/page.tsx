'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, getDashboardRoute } from '@/stores/auth-store';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  BookOpen,
  Users,
  BarChart3,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      const { user } = useAuthStore.getState();
      if (user) {
        router.push(getDashboardRoute(user.role));
      }
    } catch {
      // Error is handled in the store
    }
  };

  return (
    <div className="login-container">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-bg-orb login-bg-orb-3" />
      </div>

      <div className="login-content">
        {/* Left side — Branding */}
        <div className="login-brand animate-fade-in-up">
          <div className="login-brand-inner">
            <div className="login-logo">
              <div className="login-logo-icon">
                <GraduationCap size={32} />
              </div>
              <h1 className="login-logo-text">
                Edu<span>ERP</span>
              </h1>
            </div>

            <h2 className="login-tagline">
              School Management,{' '}
              <span className="gradient-text">Reimagined.</span>
            </h2>

            <p className="login-description">
              A comprehensive enterprise resource planning system designed for modern educational institutions.
            </p>

            <div className="login-features stagger-children">
              <div className="login-feature">
                <div className="login-feature-icon" style={{ background: 'hsl(222 84% 55% / 0.15)' }}>
                  <Shield size={20} color="hsl(222, 84%, 55%)" />
                </div>
                <div>
                  <h4>Role-Based Access</h4>
                  <p>Secure three-tier RBAC for Admins, Teachers & Students</p>
                </div>
              </div>

              <div className="login-feature">
                <div className="login-feature-icon" style={{ background: 'hsl(142 76% 42% / 0.15)' }}>
                  <BookOpen size={20} color="hsl(142, 76%, 42%)" />
                </div>
                <div>
                  <h4>Academic Excellence</h4>
                  <p>Attendance, assignments, exams & grade management</p>
                </div>
              </div>

              <div className="login-feature">
                <div className="login-feature-icon" style={{ background: 'hsl(262 80% 60% / 0.15)' }}>
                  <BarChart3 size={20} color="hsl(262, 80%, 60%)" />
                </div>
                <div>
                  <h4>Smart Analytics</h4>
                  <p>AI-powered insights and real-time dashboards</p>
                </div>
              </div>

              <div className="login-feature">
                <div className="login-feature-icon" style={{ background: 'hsl(38 92% 55% / 0.15)' }}>
                  <Users size={20} color="hsl(38, 92%, 55%)" />
                </div>
                <div>
                  <h4>Complete Ecosystem</h4>
                  <p>Finance, communication & parent engagement tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side — Login Form */}
        <div className="login-form-wrapper animate-fade-in-scale">
          <div className="login-form-card glass-strong">
            <div className="login-form-header">
              <h3>Welcome Back</h3>
              <p>Sign in to access your dashboard</p>
            </div>

            {error && (
              <div className="login-error animate-fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form" suppressHydrationWarning>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg login-submit"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="login-demo-credentials">
              <p className="login-demo-title">Demo Credentials</p>
              <div className="login-demo-grid">
                <button
                  type="button"
                  className="login-demo-btn"
                  onClick={() => {
                    setEmail('admin@eduerp.com');
                    setPassword('Admin@123456');
                  }}
                >
                  <Shield size={14} />
                  <span>Super Admin</span>
                </button>
                <button
                  type="button"
                  className="login-demo-btn"
                  onClick={() => {
                    setEmail('teacher@eduerp.com');
                    setPassword('Teacher@123');
                  }}
                >
                  <BookOpen size={14} />
                  <span>Teacher</span>
                </button>
                <button
                  type="button"
                  className="login-demo-btn"
                  onClick={() => {
                    setEmail('student@eduerp.com');
                    setPassword('Student@123');
                  }}
                >
                  <Users size={14} />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  className="login-demo-btn"
                  onClick={() => {
                    setEmail('parent@eduerp.com');
                    setPassword('Parent@123');
                  }}
                >
                  <Users size={14} />
                  <span>Parent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        .login-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
        }

        .login-bg-orb-1 {
          width: 600px;
          height: 600px;
          background: hsl(222 84% 55% / 0.15);
          top: -200px;
          left: -100px;
          animation: float 8s ease-in-out infinite;
        }

        .login-bg-orb-2 {
          width: 400px;
          height: 400px;
          background: hsl(262 80% 60% / 0.12);
          bottom: -100px;
          right: -50px;
          animation: float 10s ease-in-out infinite reverse;
        }

        .login-bg-orb-3 {
          width: 300px;
          height: 300px;
          background: hsl(142 76% 42% / 0.08);
          top: 50%;
          left: 50%;
          animation: float 12s ease-in-out infinite;
        }

        .login-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          gap: 3rem;
          align-items: center;
        }

        .login-brand-inner {
          max-width: 520px;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .login-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, hsl(222 84% 55%), hsl(262 80% 60%));
          color: white;
        }

        .login-logo-text {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: hsl(var(--text-primary));
        }

        .login-logo-text span {
          background: linear-gradient(135deg, hsl(222 84% 65%), hsl(262 80% 65%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-tagline {
          font-size: 2.75rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: hsl(var(--text-primary));
          margin-bottom: 1rem;
        }

        .login-description {
          color: hsl(var(--text-secondary));
          font-size: 1.05rem;
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .login-feature {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .login-feature-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }

        .login-feature h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
          margin-bottom: 0.15rem;
        }

        .login-feature p {
          font-size: 0.825rem;
          color: hsl(var(--text-muted));
          line-height: 1.4;
        }

        .login-form-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .login-form-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          border-radius: var(--radius-2xl);
        }

        .login-form-header {
          margin-bottom: 1.75rem;
        }

        .login-form-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: hsl(var(--text-primary));
          margin-bottom: 0.25rem;
        }

        .login-form-header p {
          color: hsl(var(--text-muted));
          font-size: 0.875rem;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: hsl(var(--danger) / 0.1);
          border: 1px solid hsl(var(--danger) / 0.25);
          border-radius: var(--radius-md);
          color: hsl(var(--danger));
          font-size: 0.8125rem;
          margin-bottom: 1.25rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .form-group label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: hsl(var(--text-secondary));
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input-wrapper .input {
          padding-right: 2.75rem;
        }

        .password-toggle {
          position: absolute;
          right: 0.625rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: hsl(var(--text-muted));
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: color var(--transition-fast);
        }

        .password-toggle:hover {
          color: hsl(var(--text-primary));
        }

        .login-submit {
          width: 100%;
          margin-top: 0.5rem;
        }

        .login-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-demo-credentials {
          margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid hsl(var(--border));
        }

        .login-demo-title {
          font-size: 0.75rem;
          font-weight: 500;
          color: hsl(var(--text-muted));
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .login-demo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 0.5rem;
        }

        .login-demo-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.5rem 0.5rem;
          background: hsl(var(--surface));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius-md);
          color: hsl(var(--text-secondary));
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .login-demo-btn:hover {
          background: hsl(var(--surface-hover));
          border-color: hsl(var(--primary) / 0.3);
          color: hsl(var(--text-primary));
        }

        @media (max-width: 1024px) {
          .login-content {
            grid-template-columns: 1fr;
            padding: 1.5rem;
          }

          .login-brand {
            display: none;
          }

          .login-form-card {
            max-width: 460px;
          }
        }
      `}</style>
    </div>
  );
}
