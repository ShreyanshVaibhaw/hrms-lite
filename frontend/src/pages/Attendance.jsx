import { useState, useEffect } from 'react';
import { CalendarPlus, Search, Calendar, X, Users, UserCheck, UserX, Clock } from 'lucide-react';
import {
  fetchEmployees,
  fetchAttendance,
  fetchAttendanceSummary,
  fetchDateAttendance,
} from '../services/api';
import ErrorAlert from '../components/ui/ErrorAlert';
import EmptyState from '../components/ui/EmptyState';
import MarkAttendanceForm from '../components/attendance/MarkAttendanceForm';
import AttendanceTable from '../components/attendance/AttendanceTable';
import AttendanceSummaryCards from '../components/attendance/AttendanceSummary';
import CalendarPicker from '../components/attendance/CalendarPicker';
import DateAttendanceTable from '../components/attendance/DateAttendanceTable';
import Skeleton from '../components/ui/Skeleton';

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [calendarDate, setCalendarDate] = useState(null);
  const [dateRecords, setDateRecords] = useState(null);
  const [dateLoading, setDateLoading] = useState(false);
  const [dateError, setDateError] = useState(null);

  const [selectedId, setSelectedId] = useState('');
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetchEmployees()
      .then((data) => setEmployees(data.employees))
      .catch(() => setEmployees([]));
  }, []);

  const loadDateAttendance = async (dateStr) => {
    setDateLoading(true);
    setDateError(null);
    try {
      const data = await fetchDateAttendance(dateStr);
      setDateRecords(data);
    } catch (err) {
      setDateError(err);
    } finally {
      setDateLoading(false);
    }
  };

  const handleCalendarSelect = (dateStr) => {
    setCalendarDate(dateStr);
    if (dateStr) {
      loadDateAttendance(dateStr);
    } else {
      setDateRecords(null);
    }
  };

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
    if (calendarDate) loadDateAttendance(calendarDate);
    if (selectedId) loadAttendance(selectedId, activeFilters);
  };

  const formatSelectedDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderEmployeeView = () => {
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
      return <Skeleton rows={5} columns={3} />;
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          Mark Attendance
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CalendarPicker
            selectedDate={calendarDate}
            onSelectDate={handleCalendarSelect}
          />
        </div>

        <div className="lg:col-span-2">
          {calendarDate && dateRecords ? (
            <div className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {formatSelectedDate(calendarDate)}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-blue-50 p-3 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-lg font-bold text-blue-700">
                      {dateRecords.records.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 border-l-4 border-green-500">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-green-700">
                      {dateRecords.present}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Present</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 border-l-4 border-red-500">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 text-red-600" />
                    <span className="text-lg font-bold text-red-700">
                      {dateRecords.absent}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Absent</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 border-l-4 border-amber-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-lg font-bold text-amber-700">
                      {dateRecords.unmarked}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Unmarked</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-white p-8 shadow-sm border border-gray-200">
              <div className="text-center">
                <Calendar className="mx-auto h-10 w-10 text-gray-300" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-gray-500">
                  Select a date on the calendar to view attendance
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {calendarDate && (
        <div className="mb-8">
          {dateLoading ? (
            <Skeleton rows={5} columns={5} />
          ) : dateError ? (
            <ErrorAlert
              message={dateError}
              onRetry={() => loadDateAttendance(calendarDate)}
            />
          ) : dateRecords && dateRecords.records.length > 0 ? (
            <DateAttendanceTable
              dateStr={calendarDate}
              records={dateRecords.records}
              onRefresh={() => loadDateAttendance(calendarDate)}
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No Employees"
              description="Add employees first to start marking attendance."
            />
          )}
        </div>
      )}

      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Attendance History</h2>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="att_select_employee" className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              id="att_select_employee"
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
                <label htmlFor="att_date_from" className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <input
                  id="att_date_from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="att_date_to" className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  id="att_date_to"
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
                    aria-label="Clear date filters"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {renderEmployeeView()}
      </div>

      <MarkAttendanceForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleMarkSuccess}
      />
    </div>
  );
}
