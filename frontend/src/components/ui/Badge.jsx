const variants = {
  available: 'badge-available',
  low: 'badge-low',
  sold: 'badge-sold',
  in_transit: 'badge bg-cyan-50 text-cyan-700 border border-cyan-200/50',
  in_service: 'badge bg-purple-50 text-purple-700 border border-purple-200/50',
  admin: 'badge-admin',
  user: 'badge-user',
  default: 'badge-default',
};

export default function Badge({ children, variant = 'default', className = '', dot }) {
  return (
    <span className={`${variants[variant] || variants.default} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        variant === 'available' ? 'bg-emerald-500' :
        variant === 'low' ? 'bg-amber-500' :
        variant === 'sold' ? 'bg-red-500' : 'bg-slate-400'
      }`} />}
      {children}
    </span>
  );
}
