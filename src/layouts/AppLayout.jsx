import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/shared/Sidebar';
import Topbar  from '../components/shared/Topbar';
import styles  from './AppLayout.module.css';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return (
    <div className={styles.loader}>
      <span className={styles.spin} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className={[styles.shell, sidebarOpen ? styles.sidebarOpen : ''].join(' ')}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      <Sidebar onClose={() => setSidebarOpen(false)} />

      <div className={styles.main}>
        <Topbar onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className={styles.content}>
          <div className={styles.inner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
