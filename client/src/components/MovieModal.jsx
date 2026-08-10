import { useEffect, useState } from 'react';
import { IMG, PLACEHOLDER, fmt } from '../api/images';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../context/ToastContext';

export default function MovieModal({ item, type = 'movie', onClose, onPlay }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { has, toggle } = useWatchlist();
  const toast = useToast();

  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    setLoading(true);
    import('../api/client').then(({ content }) =>
      content(item.id, type).then((res) => {
        if (!cancelled) {
          setDetails(res.data);
          setLoading(false);
        }
      }).catch(() => {
        if (!cancelled) setLoading(false);
      })
    );
    return () => {
      cancelled = true;
    };
  }, [item, type]);

  if (!item) return null;

  const d = details || item;
  const title = type === 'tv' ? d.name || item.title : d.title || item.name;
  const date = type === 'tv' ? d.first_air_date : d.release_date;
  const year = fmt.year(date);
  const rating = fmt.rating(d.vote_average);
  const isInList = has(item.id);

  const handleToggle = async () => {
    await toggle({
      id: item.id,
      title,
      posterPath: d.poster_path || item.poster_path,
      voteAverage: d.vote_average || 0,
      releaseDate: date,
      mediaType: type,
    });
    toast.success(isInList ? 'Removed from My List' : 'Added to My List');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times" />
        </button>
        <div className="modal-body">
          {loading && (
            <div className="spinner-container">
              <div className="spinner" />
            </div>
          )}
          <div className="modal-movie-content">
            <div className="modal-movie-poster">
              <img
                src={IMG.poster(d.poster_path) || PLACEHOLDER}
                alt={title}
                onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
              />
            </div>
            <div className="modal-movie-info">
              <h2 className="modal-movie-title">{title}</h2>
              <div className="modal-movie-meta">
                <span className="modal-movie-rating">⭐ {rating}</span>
                <span className="modal-movie-year">{year}</span>
                {type === 'movie' && d.runtime && (
                  <span className="modal-movie-runtime">{d.runtime} min</span>
                )}
                {type === 'tv' && d.number_of_seasons && (
                  <span className="modal-movie-runtime">{d.number_of_seasons} seasons</span>
                )}
              </div>
              {d.tagline && <p className="modal-movie-tagline">"{d.tagline}"</p>}
              <p className="modal-movie-overview">{d.overview || 'No overview available.'}</p>
              {d.genres?.length > 0 && (
                <div className="modal-movie-details">
                  <div className="modal-movie-detail">
                    <strong>Genres:</strong> {d.genres.map((g) => g.name).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-play-modal" onClick={onPlay}>
            <i className="fas fa-play" /> Watch Now
          </button>
          <button className="btn-add-list" onClick={handleToggle}>
            <i className={isInList ? 'fas fa-heart' : 'far fa-heart'} />
            {isInList ? 'In My List' : 'My List'}
          </button>
        </div>
      </div>
    </div>
  );
}
