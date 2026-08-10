import { useEffect, useState } from 'react';

export default function Sidebar({ type, search, genreId, filter, sort, onChange }) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    import('../api/client').then(({ genres }) =>
      genres(type).then((res) => setGenres((res.genres || []).slice(0, 15)))
    );
  }, [type]);

  const update = (patch) => onChange({ ...{ search, genreId, filter, sort }, ...patch });

  const sortOptions =
    type === 'tv'
      ? [
          ['popularity.desc', 'Popularity'],
          ['vote_average.desc', 'Rating'],
          ['first_air_date.desc', 'First Air Date'],
          ['name.asc', 'Name A-Z'],
        ]
      : [
          ['popularity.desc', 'Popularity'],
          ['vote_average.desc', 'Rating'],
          ['release_date.desc', 'Release Date'],
          ['title.asc', 'Title A-Z'],
        ];

  const showClear = !!search || genreId > 0 || filter !== 'day';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3><i className="fas fa-sliders-h" /> Filters</h3>
      </div>

      <div className="sidebar-search">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ search: e.target.search.value.trim() });
          }}
        >
          <div className="search-wrapper">
            <i className="fas fa-search search-icon-input" />
            <input
              type="text"
              name="search"
              className="search-input"
              placeholder={`Search ${type === 'tv' ? 'TV shows' : 'movies'}…`}
              defaultValue={search}
            />
          </div>
        </form>
      </div>

      <div className="filter-section">
        <h4><i className="fas fa-tags" /> Genres</h4>
        <div className="genre-list">
          <button
            className={`genre-item ${genreId === 0 ? 'active' : ''}`}
            onClick={() => update({ genreId: 0 })}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              className={`genre-item ${genreId === g.id ? 'active' : ''}`}
              onClick={() => update({ genreId: g.id })}
            >
              {g.n || g.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4><i className="fas fa-clock" /> Time</h4>
        <div className="time-filters">
          <button
            className={`time-btn ${filter === 'day' ? 'active' : ''}`}
            onClick={() => update({ filter: 'day' })}
          >
            Today
          </button>
          <button
            className={`time-btn ${filter === 'week' ? 'active' : ''}`}
            onClick={() => update({ filter: 'week' })}
          >
            This Week
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h4><i className="fas fa-sort-amount-down" /> Sort By</h4>
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
        >
          {sortOptions.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {showClear && (
        <button className="clear-filters-btn" onClick={() => onChange({ search: '', genreId: 0, filter: 'day', sort: 'popularity.desc' })}>
          <i className="fas fa-undo-alt" /> Clear All Filters
        </button>
      )}
    </aside>
  );
}
