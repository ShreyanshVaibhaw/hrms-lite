import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchCalendarSummary } from '../../services/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function CalendarPicker({ selectedDate, onSelectDate }) {
  const today = new Date();
  const todayStr = toDateStr(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [daySummary, setDaySummary] = useState({});

  useEffect(() => {
    setDaySummary({});
    fetchCalendarSummary(viewYear, viewMonth + 1)
      .then((data) => {
        const map = {};
        for (const day of data.days) {
          map[day.date] = { present: day.present, absent: day.absent };
        }
        setDaySummary(map);
      })
      .catch(() => setDaySummary({}));
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const getDotColor = (dateStr) => {
    const info = daySummary[dateStr];
    if (!info) return null;
    if (info.absent > 0 && info.present > 0) return 'bg-amber-400';
    if (info.absent > 0) return 'bg-red-400';
    return 'bg-green-400';
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-gray-900">
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={nextMonth}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {DAYS.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-gray-400">
            {d}
          </div>
        ))}

        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`e-${idx}`} className="h-9" />;
          }

          const dateStr = toDateStr(new Date(viewYear, viewMonth, day));
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isFuture = dateStr > todayStr;
          const dotColor = getDotColor(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => {
                if (!isFuture) onSelectDate(isSelected ? null : dateStr);
              }}
              disabled={isFuture}
              className={`relative flex flex-col items-center justify-center h-9 w-full rounded-full text-xs font-medium transition-colors
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${!isSelected && isToday ? 'ring-2 ring-blue-400' : ''}
                ${!isSelected && !isFuture ? 'text-gray-700 hover:bg-gray-100' : ''}
                ${isFuture ? 'text-gray-300 cursor-default' : 'cursor-pointer'}
              `}
            >
              {day}
              {dotColor && !isSelected && (
                <span className={`absolute bottom-0.5 h-1 w-1 rounded-full ${dotColor}`} />
              )}
              {dotColor && isSelected && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
