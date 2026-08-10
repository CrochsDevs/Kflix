export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <button
        className="page-link prev"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <i className="fas fa-chevron-left" /> Previous
      </button>

      <div className="page-numbers">
        {start > 1 && (
          <>
            <button className="page-num" onClick={() => onChange(1)}>1</button>
            {start > 2 && <span className="page-dots">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            className={`page-num ${p === page ? 'active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="page-dots">…</span>}
            <button className="page-num" onClick={() => onChange(totalPages)}>
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        className="page-link next"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next <i className="fas fa-chevron-right" />
      </button>
    </div>
  );
}
