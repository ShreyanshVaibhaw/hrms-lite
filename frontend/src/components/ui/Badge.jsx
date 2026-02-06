const variants = {
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  default: 'bg-gray-100 text-gray-700',
};

export default function Badge({ variant = 'default', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant] || variants.default}`}
    >
      {children}
    </span>
  );
}
