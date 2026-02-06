import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-gray-700">Page Not Found</h2>
      <p className="mt-2 text-gray-500 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
