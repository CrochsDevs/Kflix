import { IMG, PLACEHOLDER, fmt, titleFor, dateFor } from '../api/images';

export default function MovieCard({ item, type = 'movie', onInfo }) {
  const title = titleFor(item, type);
  const date = dateFor(item, type);
  const poster = IMG.poster(item.poster_path) || PLACEHOLDER;
  const year = fmt.year(date);
  const rating = fmt.rating(item.vote_average);
  const isMovie = type === 'movie';

  return (
    <div className="movie-card" data-id={item.id}>
      <div className="card-poster">
        <img
          src={poster}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        <div className="card-overlay">
          <button
            className="play-icon"
            title="Play"
            onClick={() => (window.location.href = `/play/${type}/${item.id}`)}
          >
            <i className="fas fa-play" />
          </button>
          {onInfo && (
            <button
              className="info-icon"
              title="More info"
              onClick={(e) => {
                e.stopPropagation();
                onInfo(item);
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
          <span className="maturity-rating">{item.adult ? 'R' : isMovie ? 'PG-13' : 'TV-14'}</span>
        </div>
      </div>
    </div>
  );
}
