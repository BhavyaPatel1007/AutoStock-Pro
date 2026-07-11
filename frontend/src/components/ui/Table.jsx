export default function Table({ columns, data, onRowClick, loading, emptyMessage = 'No data found' }) {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="p-8 text-center text-gray-400">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card overflow-hidden">
        <div className="p-8 text-center text-gray-400">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
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
