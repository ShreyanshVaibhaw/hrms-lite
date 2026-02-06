function pct(part, total) {
  if (total === 0) return '0';
  return Math.round((part / total) * 100);
}

const cards = [
  {
    key: 'total_days',
    label: 'Total Days Recorded',
    border: 'border-blue-500',
    textColor: 'text-blue-700',
    bg: 'bg-blue-50',
    format: (s) => s.total_days,
  },
  {
    key: 'present_days',
    label: 'Present Days',
    border: 'border-green-500',
    textColor: 'text-green-700',
    bg: 'bg-green-50',
    format: (s) => `${s.present_days} (${pct(s.present_days, s.total_days)}%)`,
  },
  {
    key: 'absent_days',
    label: 'Absent Days',
    border: 'border-red-500',
    textColor: 'text-red-700',
    bg: 'bg-red-50',
    format: (s) => `${s.absent_days} (${pct(s.absent_days, s.total_days)}%)`,
  },
];

export default function AttendanceSummary({ summary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`rounded-lg border-l-4 ${card.border} ${card.bg} p-4`}
        >
          <p className={`text-2xl font-bold ${card.textColor}`}>
            {card.format(summary)}
          </p>
          <p className="mt-1 text-xs text-gray-600">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
