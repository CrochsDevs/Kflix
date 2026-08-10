import { useEffect, useRef, useState } from 'react';
import { IMG, PLACEHOLDER, fmt, titleFor, dateFor } from '../api/images';

export default function MovieCard({ item, type = 'movie', onInfo }) {
  // Accept either slim payload (from /api/discover) or full TMDB object
  const raw = item;
  const title = titleFor(raw, type);
  const date = dateFor(raw, type);
  const year = fmt.year(date);
  const rating = fmt.rating(raw.vote_average);
  const isMovie = type === 'movie';

  // Use small image (w185) for grid — sharp enough, ~10KB each
  const poster = IMG.poster(raw.poster_path, 'w185') || PLACEHOLDER;

  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // IntersectionObserver — don't even start loading until card is near viewport
  useEffect(() => {
    if (!imgRef.current) return;
    if (loaded) return;
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            const img = new Image();
            img.onload = () => setLoaded(true);
            img.onerror = () => setLoaded(true);
            img.src = poster;
            obs.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      obs.observe(imgRef.current);
      return () => obs.disconnect();
    } else {
      setLoaded(true);
    }
  }, [poster, loaded]);

  return (
    <div className="movie-card" data-id={raw.id}>
      <div className="card-poster" ref={imgRef}>
        {loaded ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
        ) : (
          <div className="poster-skeleton" />
        )}
        <div className="card-overlay">
          <button
            className="play-icon"
            title="Play"
            onClick={() => (window.location.href = `/play/${type}/${raw.id}`)}
          >
            <i className="fas fa-play" />
          </button>
          {onInfo && (
            <button
              className="info-icon"
              title="More info"
              onClick={(e) => {
                e.stopPropagation();
                onInfo(raw);
              }}
            >
              <i className="fas fa-info-circle" />
            </button>
          )}
        </div>
      </div>
      <div className="card-footer">
        <div className="card-rating">
          <span className="rating-badge">⭐ {rating}</span>
        </div>
        <p className="movie-title">{title}</p>
        <div className="movie-meta">
          <span className="release-year">{year}</span>
          <span className="maturity-rating">{raw.adult ? 'R' : isMovie ? 'PG-13' : 'TV-14'}</span>
        </div>
      </div>
    </div>
  );
}