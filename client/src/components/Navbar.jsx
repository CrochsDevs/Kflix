import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';

export default function Navbar() {
  const { count } = useWatchlist();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const link = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/movies?search=${encodeURIComponent(q)}`);
      setQuery('');
    }
  };

  return (
    <nav className="netflix-nav">
      <div className="nav-content">
        <NavLink to="/" className="logo-section">
          <h1 className="netflix-logo">KFLIX</h1>
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/tv" className={link}>TV Shows</NavLink>
          <NavLink to="/movies" className={link}>Movies</NavLink>
          <NavLink to="/new-popular" className={link}>New &amp; Popular</NavLink>
          <NavLink to="/watchlist" className={link}>
            My List
            {count > 0 && <span className="watchlist-badge">{count}</span>}
          </NavLink>
        </div>

        <form className="nav-search" onSubmit={handleSearch}>
          <i className="fas fa-search nav-search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & TV shows..."
            className="nav-search-input"
            aria-label="Search"
          />
        </form>
      </div>
    </nav>
  );
}