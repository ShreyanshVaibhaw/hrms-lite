import { useState, useEffect } from 'react';
import { CalendarPlus, Search, Calendar, X } from 'lucide-react';
import {
  fetchEmployees,
  fetchAttendance,
  fetchAttendanceSummary,
} from '../services/api';
import ErrorAlert from '../components/ui/ErrorAlert';
import EmptyState from '../components/ui/EmptyState';
import MarkAttendanceForm from '../components/attendance/MarkAttendanceForm';
import AttendanceTable from '../components/attendance/AttendanceTable';
import AttendanceSummaryCards from '../components/attendance/AttendanceSummary';

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-44 rounded bg-gray-200" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-gray-200" /></td>
      <td className="px-4 py-3"><div className="h-4 w-36 rounded bg-gray-200" /></td>
    </tr>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-medium text-gray-700">Date</th>
            <th className="px-4 py-3 font-medium text-gray-700">Status</th>
            <th className="px-4 py-3 font-medium text-gray-700">Marked On</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetchEmployees()
      .then((data) => setEmployees(data.employees))
      .catch(() => setEmployees([]));
  }, []);

  const loadAttendance = async (empId, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      const [attData, summData] = await Promise.all([
        fetchAttendance(empId, params),
        fetchAttendanceSummary(empId),
      ]);
      setRecords(attData.records);
      setSummary(summData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedId(empId);
    setDateFrom('');
    setDateTo('');
    setActiveFilters({});
    if (empId) {
      loadAttendance(empId);
    } else {
      setRecords([]);
      setSummary(null);
    }
  };

  const handleFilter = () => {
    if (!selectedId) return;
    const filters = {};
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    setActiveFilters(filters);
    loadAttendance(selectedId, filters);
  };

  const handleClearFilter = () => {
    setDateFrom('');
    setDateTo('');
    setActiveFilters({});
    if (selectedId) {
      loadAttendance(selectedId);
    }
  };

  const handleMarkSuccess = () => {
    if (selectedId) {
      loadAttendance(selectedId, activeFilters);
    }
  };

  const renderContent = () => {
    if (!selectedId) {
      return (
        <EmptyState
          icon={Search}
          title="Select an Employee"
          description="Choose an employee from the dropdown to view their attendance records."
        />
      );
    }

    if (error) {
      return (
        <ErrorAlert
          message={error}
          onRetry={() => loadAttendance(selectedId, activeFilters)}
        />
      );
    }

    if (loading) {
      return <SkeletonTable />;
    }

    if (records.length === 0) {
      return (
        <EmptyState
          icon={Calendar}
          title="No Attendance Records"
          description="No attendance has been recorded for this employee yet."
        />
      );
    }

    return (
      <>
        {summary && <AttendanceSummaryCards summary={summary} />}
        <AttendanceTable records={records} />
      </>
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          Mark Attendance
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>
          <select
            value={selectedId}
            onChange={handleEmployeeChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select an employee to view attendance
            </option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_id} — {emp.full_name}
              </option>
            ))}
          </select>
        </div>

        {selectedId && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFilter}
                disabled={!dateFrom && !dateTo}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-40 transition-colors"
              >
                <Search className="h-4 w-4" />
                Filter
              </button>
              {(dateFrom || dateTo) && (
                <button
                  onClick={handleClearFilter}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {renderContent()}

      <MarkAttendanceForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleMarkSuccess}
      />
    </div>
  );
}
