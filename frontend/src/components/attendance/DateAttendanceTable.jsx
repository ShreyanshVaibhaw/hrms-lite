import { useState, useRef } from 'react';
import { UserCheck, UserX, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { upsertAttendance, bulkMarkAttendance } from '../../services/api';

export default function DateAttendanceTable({ dateStr, records, onRefresh }) {
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [flashRow, setFlashRow] = useState(null);
  const [bulkStatus, setBulkStatus] = useState(null);
  const flashTimers = useRef({});

  const allIds = records.map((r) => r.employee_id);
  const allSelected = allIds.length > 0 && selected.size === allIds.length;

  const toggleSelect = (empId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) next.delete(empId);
      else next.add(empId);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  };

  const flashSuccess = (empId) => {
    setFlashRow(empId);
    setSaved((prev) => ({ ...prev, [empId]: true }));

    if (flashTimers.current[empId]) clearTimeout(flashTimers.current[empId]);
    flashTimers.current[empId] = setTimeout(() => {
      setFlashRow((prev) => (prev === empId ? null : prev));
      setSaved((prev) => ({ ...prev, [empId]: false }));
    }, 1200);
  };

  const handleInlineMark = async (empId, status) => {
    setSaving((prev) => ({ ...prev, [empId]: true }));
    try {
      await upsertAttendance({ employee_id: empId, date: dateStr, status });
      flashSuccess(empId);
      onRefresh();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to mark attendance');
    } finally {
      setSaving((prev) => ({ ...prev, [empId]: false }));
    }
  };

  const handleBulk = async (status) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    setBulkStatus({ status, done: 0, total: ids.length });
    const bulkRecords = ids.map((id) => ({
      employee_id: id,
      date: dateStr,
      status,
    }));

    try {
      const result = await bulkMarkAttendance(bulkRecords);
      toast.success(`Attendance marked for ${result.success} employee${result.success !== 1 ? 's' : ''}`);
      setSelected(new Set());
      onRefresh();
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Bulk operation failed');
    } finally {
      setBulkStatus(null);
    }
  };

  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-gray-300 accent-blue-600"
            />
            Select All
          </label>
          {selected.size > 0 && (
            <span className="text-xs text-gray-500">
              {selected.size} of {allIds.length} selected
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleBulk('Present')}
            disabled={selected.size === 0 || bulkStatus !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5" />
            {bulkStatus?.status === 'Present'
              ? `Marking...`
              : 'Mark All Present'}
          </button>
          <button
            onClick={() => handleBulk('Absent')}
            disabled={selected.size === 0 || bulkStatus !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            <UserX className="h-3.5 w-3.5" />
            {bulkStatus?.status === 'Absent'
              ? `Marking...`
              : 'Mark All Absent'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-10 px-3 py-3" />
              <th className="px-4 py-3 font-medium text-gray-700">Employee ID</th>
              <th className="px-4 py-3 font-medium text-gray-700">Full Name</th>
              <th className="px-4 py-3 font-medium text-gray-700 hidden sm:table-cell">Department</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-center">Status</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => {
              const isFlash = flashRow === rec.employee_id;
              const isSaving = saving[rec.employee_id];
              const isSaved = saved[rec.employee_id];

              return (
                <tr
                  key={rec.employee_id}
                  className={`border-b border-gray-100 transition-colors duration-500 ${
                    isFlash ? 'bg-green-50' : idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(rec.employee_id)}
                      onChange={() => toggleSelect(rec.employee_id)}
                      className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-blue-600">{rec.employee_id}</td>
                  <td className="px-4 py-3 text-gray-900">{rec.full_name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{rec.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleInlineMark(rec.employee_id, 'Present')}
                        disabled={isSaving}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
                          rec.status === 'Present'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600'
                        }`}
                      >
                        P
                      </button>
                      <button
                        onClick={() => handleInlineMark(rec.employee_id, 'Absent')}
                        disabled={isSaving}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
                          rec.status === 'Absent'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-600'
                        }`}
                      >
                        A
                      </button>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium border ${
                          rec.status === null
                            ? 'bg-gray-100 text-gray-400 border-gray-200'
                            : 'bg-white text-gray-300 border-gray-100'
                        }`}
                      >
                        —
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {isSaved && (
                      <Check className="h-4 w-4 text-green-500 inline-block" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400 text-center">
        Showing attendance for {formattedDate}
      </p>
    </div>
  );
}
