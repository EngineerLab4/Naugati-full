import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardRouter from '../components/Dashboard';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardRouter />
    </DashboardLayout>
  );
}
