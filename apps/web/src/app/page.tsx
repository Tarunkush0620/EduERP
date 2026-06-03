'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, getDashboardRoute } from '@/stores/auth-store';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getDashboardRoute(user.role));
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'hsl(222 47% 6%)',
      }}
    >
      <div className="animate-spin" style={{ width: 32, height: 32 }}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="hsl(222 84% 55%)" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 30" />
        </svg>
      </div>
    </div>
  );
}
