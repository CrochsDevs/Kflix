import { useEffect, useState } from 'react';
import { IMG, PLACEHOLDER } from '../api/images';
import { getWatchlist, clearWatchlist } from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../context/ToastContext';
import MovieCard from '../components/MovieCard';

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('date-added');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { refresh } = useWatchlist();
  const toast = useToast();

  const load = () => {
    setLoading(true);
    getWatchlist({ sortBy: sort, itemsPerPage: 50 })
      .then((r) => setItems(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [sort]);

  const handleClear = async () => {
    await clearWatchlist();
    setItems([]);
    setConfirmOpen(false);
    refresh();
    toast.success('Watchlist cleared');
  };

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3 style={{ color: 'var(--primary-color)' }}>
            <i className="fas fa-sliders-h" /> My Watchlist
          </h3>
        </div>

        <div className="filter-section">
          <h4><i className="fas fa-filter" /> Sort By</h4>
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date-added">Date Added (Newest)</option>
            <option value="title">Title (A-Z)</option>
            <option value="rating">Rating (Highest)</option>
            <option value="year">Year (Newest)</option>
          </select>
        </div>

        <div className="filter-section">
          <h4><i className="fas fa-trash" /> Actions</h4>
          <button className="clear-filters-btn" onClick={() => setConfirmOpen(true)}>
            <i className="fas fa-trash-alt" /> Clear All
          </button>
        </div>

        <div className="watchlist-stats">
          <p>
            <span>Total Movies:</span>
            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{items.length}</span>
          </p>
        </div>
      </aside>

      <main className="main-content">
        <div className="results-header">
          <h1 className="section-title">
            <i className="fas fa-bookmark" style={{ marginRight: 10 }} /> My Watchlist
          </h1>
          <span className="results-count">{items.length} items</span>
        </div>

        {loading ? (
          <div className="movie-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-poster" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-watchlist">
            <i className="fas fa-bookmark" />
            <h3>Your watchlist is empty</h3>
            <p>Start adding movies to see them here!</p>
            <a href="/" className="clear-filters-btn" style={{ display: 'inline-block', width: 'auto', padding: '10px 30px', marginTop: 20, textDecoration: 'none' }}>
              <i className="fas fa-film" /> Browse Movies
            </a>
          </div>
        ) : (
          <div className="movie-grid">
            {items.map((m) => (
              <MovieCard
                key={`${m.mediaType}-${m.movieId}`}
                item={{
                  id: m.movieId,
                  title: m.title,
                  poster_path: m.posterPath,
                  vote_average: m.voteAverage,
                  release_date: m.releaseDate,
                }}
                type={m.mediaType || 'movie'}
              />
            ))}
          </div>
        )}
      </main>

      {confirmOpen && (
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)}>
          <div className="modal-container" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 30 }}>
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: 15 }} />
              <h3 style={{ marginBottom: 10, color: '#fff' }}>Clear Watchlist?</h3>
              <p style={{ color: 'var(--text-dim)', marginBottom: 25 }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 15, justifyContent: 'center' }}>
                <button className="clear-filters-btn" style={{ width: 'auto', padding: '10px 25px', margin: 0, background: 'transparent' }} onClick={() => setConfirmOpen(false)}>
                  Cancel
                </button>
                <button
                  style={{ padding: '10px 25px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={handleClear}
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
