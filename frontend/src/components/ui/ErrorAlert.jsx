import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-red-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-900 underline"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
