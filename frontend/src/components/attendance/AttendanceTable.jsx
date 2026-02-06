import Badge from '../ui/Badge';

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimestamp(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AttendanceTable({ records }) {
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
          {records.map((record, idx) => (
            <tr
              key={record.id}
              className={`border-b border-gray-100 hover:bg-gray-100 transition-colors ${
                idx % 2 === 1 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <td className="px-4 py-3 text-gray-900">
                {formatDate(record.date)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={record.status === 'Present' ? 'success' : 'danger'}>
                  {record.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatTimestamp(record.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
