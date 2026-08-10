import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MovieCard from './MovieCard';
import Pagination from './Pagination';
import MovieModal from './MovieModal';
import { discover, genres as fetchGenres } from '../api/client';

export default function MediaListPage({ type, titleFor, heroTypes }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const search = params.get('search') || '';
  const genreId = parseInt(params.get('genre') || '0', 10);
  const filter = params.get('filter') || 'day';
  const sort = params.get('sort') || 'popularity.desc';
  const page = parseInt(params.get('page') || '1', 10);

  const [data, setData] = useState({ results: [], totalPages: 1, totalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [genres, setGenres] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    fetchGenres(type).then((r) => setGenres(r.genres || []));
  }, [type]);

  useEffect(() => {
    setLoading(true);
    setError('');
    discover({ type, search, genre: genreId, filter, sort, page })
      .then((d) => setData(d))
      .catch((e) => setError(e.message || 'Error'))
      .finally(() => setLoading(false));
  }, [type, search, genreId, filter, sort, page]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    const map = { search: 'search', genreId: 'genre', filter: 'filter', sort: 'sort', page: 'page' };
    Object.entries(patch).forEach(([k, v]) => {
      const key = map[k];
      if (v === '' || v === 0 || v === 'day' || v === 'popularity.desc') next.delete(key);
      else next.set(key, String(v));
    });
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const heroItem = heroTypes && data.results?.[0] && search === '' && genreId === 0 && page === 1 ? data.results[0] : null;

  const headerTitle = useMemo(() => {
    if (search) {
      return `Search: "${search}"${data.totalResults ? ` (${data.totalResults} results)` : ''}`;
    }
    if (genreId > 0) {
      const g = genres.find((x) => x.id === genreId);
      return `${g?.name || 'Selected'} ${type === 'tv' ? 'TV Shows' : 'Movies'}`;
    }
    const map = { day: 'Trending Today', week: 'Trending This Week' };
    return titleFor?.[filter] || map[filter] || 'Trending';
  }, [search, genreId, genres, type, data.totalResults, filter, titleFor]);

  return (
    <>
      {heroItem && (
        <section
          className="hero-section"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%), url(https://image.tmdb.org/t/p/original${heroItem.backdrop_path})`,
          }}
        >
          <div className="hero-content">
            <h2 className="hero-title">{type === 'tv' ? heroItem.name : heroItem.title}</h2>
            <p className="hero-description">{(heroItem.overview || '').slice(0, 200)}…</p>
            <div className="hero-buttons">
              <button
                className="btn-play"
                onClick={() => navigate(`/play/${type}/${heroItem.id}`)}
              >
                <i className="fas fa-play" /> Play
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="main-layout">
        <Sidebar
          type={type}
          search={search}
          genreId={genreId}
          filter={filter}
          sort={sort}
          onChange={update}
        />

        <main className="main-content">
          <div className="results-header">
            <h1 className="section-title">{headerTitle}</h1>
            <span className="results-count">Showing {data.results.length} {type === 'tv' ? 'TV shows' : 'movies'}</span>
          </div>

          {error && <div className="error-msg">{error}</div>}

          {loading && (
            <div className="movie-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-poster" />
                  <div className="skeleton-footer">
                    <div className="skeleton-rating" />
                    <div className="skeleton-title" />
                    <div className="skeleton-meta" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && data.results.length === 0 && (
            <div className="no-results">
              <i className="fas fa-film" />
              <h3>No {type === 'tv' ? 'TV shows' : 'movies'} found</h3>
              <p>Try adjusting your filters.</p>
            </div>
          )}

          {!loading && data.results.length > 0 && (
            <div className="movie-grid">
              {data.results.map((item) => (
                <MovieCard
                  key={`${type}-${item.id}`}
                  item={item}
                  type={type}
                  onInfo={(it) => setActiveItem(it)}
                />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={data.totalPages}
            onChange={(p) => update({ page: p })}
          />
        </main>
      </div>

      {activeItem && (
        <MovieModal
          item={activeItem}
          type={type}
          onClose={() => setActiveItem(null)}
          onPlay={() => navigate(`/play/${type}/${activeItem.id}`)}
        />
      )}
    </>
  );
}
