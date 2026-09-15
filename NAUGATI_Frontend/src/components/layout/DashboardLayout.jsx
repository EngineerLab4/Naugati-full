import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topnav from './Topnav';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topnav />
        <main style={{ padding: '2rem', marginTop: 'var(--topbar-height)', flex: 1, overflowX: 'hidden' }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
