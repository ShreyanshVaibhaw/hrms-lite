import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ServerWakeBanner from '../ui/ServerWakeBanner';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
};

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'HRMS Lite';
  const today = formatDate(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <ServerWakeBanner />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 md:ml-64">
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              </div>
              <p className="text-sm text-gray-500 hidden sm:block">{today}</p>
            </div>
          </header>
          <main className="p-4 sm:p-6 page-enter">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
