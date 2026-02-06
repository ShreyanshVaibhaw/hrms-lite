import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 lg:w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200">
        <LayoutDashboard className="h-7 w-7 text-blue-600 shrink-0" />
        <span className="text-lg font-bold text-gray-900 hidden lg:block">
          HRMS Lite
        </span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 hidden lg:block">v1.0.0</p>
      </div>
    </aside>
  );
}
