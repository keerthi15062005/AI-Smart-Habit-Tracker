import { useState } from 'react';
import Sidebar from '../Dashboard/Sidebar';
import DashboardPage from '../Dashboard/DashboardPage';
import AnalyticsPage from '../Analytics/AnalyticsPage';

export default function MainLayout() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'analytics'>('dashboard');

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {currentPage === 'dashboard' ? <DashboardPage /> : <AnalyticsPage />}
        </div>
      </main>
    </div>
  );
}
