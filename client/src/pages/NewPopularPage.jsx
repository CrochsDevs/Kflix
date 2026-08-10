import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import MovieModal from '../components/MovieModal';
import { newPopular } from '../api/client';

const SORTS_MOVIE = ['popularity.desc', 'vote_average.desc', 'release_date.desc', 'title.asc'];
const SORTS_TV = ['popularity.desc', 'vote_average.desc', 'first_air_date.desc', 'name.asc'];

export default function NewPopularPage() {
  const [params, setParams] = useState(() => new URLSearchParams({ filter: 'day', page: '1' }));
  const filter = params.get('filter') || 'day';
  const page = parseInt(params.get('page') || '1', 10);
  const search = params.get('search') || '';

  const [data, setData] = useState({ results: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    setLoading(true);
    newPopular({ filter, page, search })
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [filter, page, search]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === 0 || v === 'day') next.delete(k);
      else next.set(k, String(v));
    });
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  return (
    <div className="main-layout">
      <Sidebar
        type="movie"
        search={search}
        genreId={0}
        filter={filter}
        sort="popularity.desc"
        onChange={update}
      />
      <main className="main-content">
        <div className="results-header">
          <h1 className="section-title">
            {search
              ? `Search: "${search}"`
              : filter === 'day'
              ? '🔥 New & Popular Today'
              : '📅 New & Popular This Week'}
          </h1>
          <span className="results-count">Showing {data.results.length} items</span>
        </div>

        {loading ? (
          <div className="movie-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-poster" />
              </div>
            ))}
          </div>
        ) : data.results.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-film" />
            <h3>No items found</h3>
          </div>
        ) : (
          <div className="movie-grid">
            {data.results.map((item) => {
              const type = item.title ? 'movie' : 'tv';
              return (
                <div key={`${type}-${item.id}`} className="movie-card-wrap">
                  <span className={`type-badge ${type}`}>{type === 'movie' ? 'MOVIE' : 'TV'}</span>
                  <MovieCard
                    item={item}
                    type={type}
                    onInfo={(it) => setActiveItem({ item: it, type })}
                  />
                </div>
              );
            })}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={data.totalPages}
          onChange={(p) => update({ page: p })}
        />
      </main>

      {activeItem && (
        <MovieModal
          item={activeItem.item}
          type={activeItem.type}
          onClose={() => setActiveItem(null)}
          onPlay={() => (window.location.href = `/play/${activeItem.type}/${activeItem.item.id}`)}
        />
      )}
    </div>
  );
}
