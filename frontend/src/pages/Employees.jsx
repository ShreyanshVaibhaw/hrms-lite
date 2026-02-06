import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { fetchEmployees } from '../services/api';
import ErrorAlert from '../components/ui/ErrorAlert';
import EmptyState from '../components/ui/EmptyState';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import EmployeeTable from '../components/employees/EmployeeTable';

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200" /></td>
      <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-gray-200" /></td>
      <td className="px-4 py-3"><div className="h-4 w-40 rounded bg-gray-200" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-gray-200" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-gray-200" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-gray-200" /></td>
    </tr>
  );
}

function SkeletonTable() {
  return (
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
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmployees();
      setEmployees(data.employees);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const renderContent = () => {
    if (error) {
      return <ErrorAlert message={error} onRetry={loadEmployees} />;
    }

    if (loading) {
      return <SkeletonTable />;
    }

    if (employees.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title="No Employees Yet"
          description="Get started by adding your first employee."
          actionLabel="Add Employee"
          onAction={() => setModalOpen(true)}
        />
      );
    }

    return <EmployeeTable employees={employees} onRefresh={loadEmployees} />;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Employee Directory</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {renderContent()}

      <AddEmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadEmployees}
      />
    </div>
  );
}
