const colors = {
  available: 'bg-emerald-100 text-emerald-700',
  reserved: 'bg-amber-100 text-amber-700',
  sold: 'bg-red-100 text-red-700',
  in_transit: 'bg-blue-100 text-blue-700',
  in_service: 'bg-purple-100 text-purple-700',
  admin: 'bg-purple-100 text-purple-700',
  user: 'bg-blue-100 text-blue-700',
  default: 'bg-gray-100 text-gray-700',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant] || colors.default} ${className}`}>
      {children}
    </span>
  );
}
