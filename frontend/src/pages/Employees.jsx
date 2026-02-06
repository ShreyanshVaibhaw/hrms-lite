import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { fetchEmployees } from '../services/api';
import ErrorAlert from '../components/ui/ErrorAlert';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import EmployeeTable from '../components/employees/EmployeeTable';

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
      return <Skeleton rows={5} columns={6} />;
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
