import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';
import { fetchEmployees, markAttendance } from '../../services/api';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function MarkAttendanceForm({ isOpen, onClose, onSuccess }) {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    date: todayStr(),
    status: 'Present',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingEmployees(true);
    fetchEmployees()
      .then((data) => setEmployees(data.employees))
      .catch(() => setEmployees([]))
      .finally(() => setLoadingEmployees(false));
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.employee_id) {
      newErrors.employee_id = 'Please select an employee';
    }

    if (!form.date) {
      newErrors.date = 'Date is required';
    } else if (form.date > todayStr()) {
      newErrors.date = 'Date cannot be in the future';
    }

    if (!form.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await markAttendance(form);
      toast.success('Attendance marked successfully');
      handleClose();
      onSuccess();
    } catch (err) {
      setApiError(err);
      toast.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ employee_id: '', date: todayStr(), status: 'Present' });
    setErrors({});
    setApiError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Mark Attendance" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {apiError}
          </div>
        )}

        <div>
          <label htmlFor="att_employee_id" className="block text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>
          <select
            id="att_employee_id"
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            disabled={loadingEmployees}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.employee_id ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="" disabled>
              {loadingEmployees ? 'Loading employees...' : 'Select an employee'}
            </option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_id} — {emp.full_name}
              </option>
            ))}
          </select>
          {errors.employee_id && (
            <p className="mt-1 text-xs text-red-600">{errors.employee_id}</p>
          )}
        </div>

        <div>
          <label htmlFor="att_date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="att_date"
            type="date"
            name="date"
            value={form.date}
            max={todayStr()}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.date ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-600">{errors.date}</p>
          )}
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </legend>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, status: 'Present' }))}
              className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                form.status === 'Present'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
              aria-pressed={form.status === 'Present'}
            >
              Present
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, status: 'Absent' }))}
              className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                form.status === 'Absent'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
              aria-pressed={form.status === 'Absent'}
            >
              Absent
            </button>
          </div>
          {errors.status && (
            <p className="mt-1 text-xs text-red-600">{errors.status}</p>
          )}
        </fieldset>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Saving...' : 'Mark Attendance'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
