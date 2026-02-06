import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { fetchDashboard } from '../services/api';
import ErrorAlert from '../components/ui/ErrorAlert';

const cards = [
  {
    key: 'total_employees',
    label: 'Total Employees',
    icon: Users,
    border: 'border-blue-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    key: 'present_today',
    label: 'Present Today',
    icon: UserCheck,
    border: 'border-green-500',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    key: 'absent_today',
    label: 'Absent Today',
    icon: UserX,
    border: 'border-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    key: 'unmarked_today',
    label: 'Unmarked Today',
    icon: Clock,
    border: 'border-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

function SkeletonCard() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border-l-4 border-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-16 rounded bg-gray-200 mb-2" />
          <div className="h-4 w-28 rounded bg-gray-200" />
        </div>
        <div className="h-11 w-11 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, border, iconBg, iconColor }) {
  return (
    <div
      className={`rounded-lg bg-white p-6 shadow-sm border-l-4 ${border} hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-sm text-gray-500">{label}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (error) {
    return <ErrorAlert message={error} onRetry={loadDashboard} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? cards.map((c) => <SkeletonCard key={c.key} />)
          : cards.map((c) => (
              <StatCard
                key={c.key}
                label={c.label}
                value={data?.[c.key] ?? 0}
                icon={c.icon}
                border={c.border}
                iconBg={c.iconBg}
                iconColor={c.iconColor}
              />
            ))}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Today&apos;s Date:{' '}
          <span className="font-medium text-gray-900">{formatDate(new Date())}</span>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Manage your workforce efficiently with HRMS Lite.
        </p>
      </div>
    </div>
  );
}
