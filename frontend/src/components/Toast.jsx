export default function Toast({ message, type = 'success', onClose }) {
  const icons = {
    success: (
      <svg className="w-5 h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
  };

  return (
    <div className={`toast-${type} animate-slide-up`}>
      {icons[type] || icons.success}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 p-1 rounded-lg hover:bg-black/5 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
