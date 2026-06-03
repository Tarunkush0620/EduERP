'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowLeft, Loader2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSent(true);
    setIsLoading(false);
  };

  return (
    <div className="forgot-container">
      <div className="forgot-bg">
        <div className="forgot-bg-orb forgot-bg-orb-1" />
        <div className="forgot-bg-orb forgot-bg-orb-2" />
      </div>

      <div className="forgot-content animate-fade-in-scale">
        <div className="forgot-card glass-strong">
          <div className="forgot-logo">
            <div className="forgot-logo-icon">
              <GraduationCap size={24} />
            </div>
            <span className="forgot-logo-text">EduERP</span>
          </div>

          {!sent ? (
            <>
              <h2 className="forgot-title">Forgot Password?</h2>
              <p className="forgot-desc">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="forgot-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg forgot-submit"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="forgot-success animate-fade-in">
              <div className="forgot-success-icon">
                <Mail size={32} />
              </div>
              <h2 className="forgot-title">Check Your Email</h2>
              <p className="forgot-desc">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent password reset instructions.
              </p>
            </div>
          )}

          <button
            className="btn btn-ghost forgot-back"
            onClick={() => router.push('/login')}
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>
      </div>

      <style jsx>{`
        .forgot-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .forgot-bg {
          position: absolute;
          inset: 0;
        }
        .forgot-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
        }
        .forgot-bg-orb-1 {
          width: 500px;
          height: 500px;
          background: hsl(222 84% 55% / 0.2);
          top: -150px;
          right: -100px;
          animation: float 8s ease-in-out infinite;
        }
        .forgot-bg-orb-2 {
          width: 350px;
          height: 350px;
          background: hsl(262 80% 60% / 0.15);
          bottom: -100px;
          left: -50px;
          animation: float 10s ease-in-out infinite reverse;
        }
        .forgot-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          padding: 1.5rem;
        }
        .forgot-card {
          padding: 2.5rem;
          border-radius: var(--radius-2xl);
          text-align: center;
        }
        .forgot-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        .forgot-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, hsl(222 84% 55%), hsl(262 80% 60%));
          color: white;
        }
        .forgot-logo-text {
          font-size: 1.15rem;
          font-weight: 700;
          background: linear-gradient(135deg, hsl(222 84% 65%), hsl(262 80% 65%));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .forgot-title {
          font-size: 1.375rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: hsl(var(--text-primary));
          margin-bottom: 0.5rem;
        }
        .forgot-desc {
          font-size: 0.875rem;
          color: hsl(var(--text-muted));
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .forgot-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          text-align: left;
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
        .forgot-submit {
          width: 100%;
        }
        .forgot-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .forgot-success-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: hsl(var(--success) / 0.15);
          color: hsl(var(--success));
          margin: 0 auto 1.25rem;
        }
        .forgot-back {
          width: 100%;
          margin-top: 1.5rem;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
