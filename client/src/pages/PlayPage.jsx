import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IMG, PLACEHOLDER, fmt, titleFor, dateFor } from '../api/images';
import { content, saveHistory } from '../api/client';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../context/ToastContext';
import MovieCard from '../components/MovieCard';

export default function PlayPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { has, toggle } = useWatchlist();

  const type = params.type === 'tv' ? 'tv' : 'movie';
  const id = params.id || params.type;
  const season = parseInt(searchParams.get('season') || '1', 10);
  const episode = parseInt(searchParams.get('episode') || '1', 10);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  // Player mode: 'trailer' (default, always works) | 'embed'
  const [sourceMode, setSourceMode] = useState('trailer');
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);

  useEffect(() => {
    if (!id) return navigate('/');
    setLoading(true);
    setSourceMode('trailer');
    setActiveSourceIndex(0);
    content(id, type)
      .then((res) => {
        setData(res.data);
        return saveHistory({
          movieId: res.data.id,
          title: titleFor(res.data, type),
          posterPath: res.data.poster_path,
          mediaType: type,
        });
      })
      .catch(() => navigate(type === 'tv' ? '/tv' : '/movies'))
      .finally(() => setLoading(false));
  }, [id, type, navigate]);

  const embeds = data?.embeds || [];
  const hasEmbeds = embeds.length > 0;
  const activeEmbed = embeds[activeSourceIndex] || null;

  if (loading || !data) {
    return (
      <div className="play-loading">
        <div className="spinner" />
      </div>
    );
  }

  const title = titleFor(data, type);
  const date = dateFor(data, type);
  const year = fmt.year(date);
  const rating = fmt.rating(data.vote_average);
  const inList = has(data.id);
  const trailer = data.trailer;
  const recommendations = data.recommendations || [];
  const cast = (data.credits?.cast || []).slice(0, 8);

  const renderPlayer = () => {
    if (sourceMode === 'embed' && hasEmbeds && activeEmbed) {
      return (
        <div className="embed-wrap">
          <iframe
            key={activeEmbed.url}
            className="player-frame"
            src={activeEmbed.url}
            title={title}
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
          <a
            className="embed-fallback"
            href={activeEmbed.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-external-link-alt" /> Open {activeEmbed.name} in new tab
          </a>
        </div>
      );
    }
    if (trailer) {
      return (
        <iframe
          className="player-frame"
          src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0&modestbranding=1`}
          title={`${title} trailer`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <div className="player-placeholder">
        <i className="fas fa-film" />
        <p>No playable source available.</p>
      </div>
    );
  };

  return (
    <div className="play-page">
      <header className="play-header">
        <a href={type === 'tv' ? '/tv' : '/movies'} className="back-link">
          <i className="fas fa-arrow-left" /> Back to {type === 'tv' ? 'TV Shows' : 'Movies'}
        </a>
      </header>

      <div className="player-wrapper">{renderPlayer()}</div>

      <div className="source-bar">
        <div className="source-label">
          <i className="fas fa-server" /> <span>SOURCE</span>
        </div>

        <div className="source-buttons">
          <button
            className={`source-mode ${sourceMode === 'trailer' ? 'active' : ''}`}
            onClick={() => setSourceMode('trailer')}
          >
            <i className="fab fa-youtube" /> Trailer
          </button>

          {hasEmbeds && (
            <button
              className={`source-mode ${sourceMode === 'embed' ? 'active' : ''}`}
              onClick={() => {
                setSourceMode('embed');
                setActiveSourceIndex(0);
              }}
            >
              <i className="fas fa-bolt" /> Full Movie
            </button>
          )}
        </div>

        {sourceMode === 'embed' && hasEmbeds && (
          <div className="source-buttons">
            {embeds.map((s, idx) => (
              <button
                key={s.name}
                className={`source-btn ${idx === activeSourceIndex ? 'active' : ''}`}
                onClick={() => setActiveSourceIndex(idx)}
              >
                <i className="fas fa-play" /> {s.name}
                <span className="source-dot" />
              </button>
            ))}
          </div>
        )}

        <div className="source-meta">
          {sourceMode === 'embed' ? (
            <>
              <i className="fas fa-exclamation-triangle" style={{ color: '#ffad1f' }} /> May show ads - external servers
            </>
          ) : (
            <>
              <i className="fas fa-shield-alt" /> Official YouTube trailer
            </>
          )}
        </div>
      </div>

      <div className="player-actions">
        {trailer && (
          <button className="btn-play-modal" onClick={() => setTrailerOpen(true)}>
            <i className="fab fa-youtube" style={{ color: '#ff0000' }} /> Watch Trailer
          </button>
        )}
        <button
          className={`watchlist-btn ${inList ? 'in-list' : ''}`}
          onClick={async () => {
            await toggle({
              id: data.id,
              title,
              posterPath: data.poster_path,
              voteAverage: data.vote_average,
              releaseDate: date,
              mediaType: type,
            });
            toast.success(inList ? 'Removed from My List' : 'Added to My List');
          }}
        >
          <i className={inList ? 'fas fa-heart' : 'far fa-heart'} />
          {inList ? 'In My List' : 'Add to List'}
        </button>
      </div>

      {type === 'tv' && (
        <div className="episode-selector">
          <h4>Season {season} · Episode {episode}</h4>
          <p className="ep-note">TV shows use the embed source above for full-episode playback.</p>
        </div>
      )}

      <div className="content-info">
        <div className="info-poster">
          <img
            src={IMG.poster(data.poster_path) || PLACEHOLDER}
            alt={title}
            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
          />
        </div>
        <div className="info-details">
          <h1 className="movie-title-row">{title}</h1>
          <div className="meta-data">
            <span className="rating-badge"><i className="fas fa-star" /> {rating}/10</span>
            <span><i className="far fa-calendar-alt" /> {year}</span>
            {type === 'movie' && data.runtime && (
              <span><i className="far fa-clock" /> {data.runtime} min</span>
            )}
            {type === 'tv' && data.number_of_seasons && (
              <span><i className="fas fa-calendar" /> {data.number_of_seasons} Seasons</span>
            )}
            {(data.genres || []).slice(0, 3).map((g) => (
              <span key={g.id} className="genre-pill">{g.name}</span>
            ))}
          </div>
          <p className="overview-text">{data.overview}</p>
          {cast.length > 0 && (
            <div className="cast-info">
              <strong><i className="fas fa-users" /> Cast:</strong>
              <span className="cast-names">
                {cast.map((c) => (
                  <span key={c.id}>{c.name}</span>
                ))}
              </span>
            </div>
          )}
        </div>
      </div>

      {recommendations.length > 0 && (
        <>
          <div className="recommendations-header">
            <h2><i className="fas fa-film" /> You Might Also Like</h2>
          </div>
          <div className="rec-grid">
            {recommendations
              .filter((r) => r.poster_path)
              .slice(0, 12)
              .map((rec) => {
                const recType = rec.title ? 'movie' : 'tv';
                return (
                  <MovieCard key={`${recType}-${rec.id}`} item={rec} type={recType} />
                );
              })}
          </div>
        </>
      )}

      {trailerOpen && trailer && (
        <div className="trailer-modal active" onClick={() => setTrailerOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fab fa-youtube" /> {title} — Trailer</h3>
              <button className="close-modal" onClick={() => setTrailerOpen(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="modal-body">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
