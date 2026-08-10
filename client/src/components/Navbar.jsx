import { NavLink } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';

export default function Navbar() {
  const { count } = useWatchlist();

  const link = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

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
      </div>
    </nav>
  );
}
