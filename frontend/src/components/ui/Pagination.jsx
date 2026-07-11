export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages, hasNextPage, hasPrevPage, totalItems } = meta;

  const pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-xl">
      <p className="text-sm text-gray-500">
        {totalItems} total
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              p === page
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
