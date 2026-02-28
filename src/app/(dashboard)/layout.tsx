'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('No autorizado');
        setIsAuthenticated(true);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <PageContainer>{children}</PageContainer>
      </div>
    </div>
  );
}