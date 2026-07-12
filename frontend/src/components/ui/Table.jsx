import { TableSkeleton } from './Loading';

export default function Table({ columns, data, onRowClick, loading, emptyMessage = 'No data found' }) {
  if (loading) return <TableSkeleton rows={5} cols={columns.length} />;

  if (!data || data.length === 0) {
    return (
      <div className="card overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg className="w-12 h-12 mb-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col) => (
                <th key={col.key} className={`px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`${onRowClick ? 'cursor-pointer' : ''} hover:bg-slate-50/50 transition-colors duration-150`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 text-sm text-slate-700 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
