import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import ConfirmModal from '../ui/ConfirmModal';
import { deleteEmployee } from '../../services/api';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function EmployeeTable({ employees, onRefresh }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.employee_id);
      toast.success(`${deleteTarget.full_name} deleted successfully`);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      toast.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <p className="mb-3 text-sm text-gray-500">
        Showing {employees.length} employee{employees.length !== 1 && 's'}
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-700">Employee ID</th>
              <th className="px-4 py-3 font-medium text-gray-700">Full Name</th>
              <th className="px-4 py-3 font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 font-medium text-gray-700">Department</th>
              <th className="px-4 py-3 font-medium text-gray-700">Joined</th>
              <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr
                key={emp.employee_id}
                className={`border-b border-gray-100 hover:bg-gray-100 transition-colors ${
                  idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="px-4 py-3 font-medium text-blue-600">
                  {emp.employee_id}
                </td>
                <td className="px-4 py-3 text-gray-900">{emp.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                <td className="px-4 py-3">
                  <Badge>{emp.department}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(emp.created_at)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setDeleteTarget(emp)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Delete ${emp.full_name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.full_name}? This will also remove all their attendance records.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        variant="danger"
      />
    </>
  );
}
