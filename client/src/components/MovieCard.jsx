import { useState } from 'react';
import { IMG, PLACEHOLDER, fmt, titleFor, dateFor } from '../api/images';

export default function MovieCard({ item, type = 'movie', onInfo }) {
  const raw = item;
  const title = titleFor(raw, type);
  const date = dateFor(raw, type);
  const year = fmt.year(date);
  const rating = fmt.rating(raw.vote_average);
  const isMovie = type === 'movie';

  // w342 = good quality for grid cards, smaller than w500
  const poster = IMG.poster(raw.poster_path, 'w342') || PLACEHOLDER;

  return (
    <div className="movie-card" data-id={raw.id}>
      <div className="card-poster">
        <img
          src={poster}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
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