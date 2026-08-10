import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import TVShowsPage from './pages/TVShowsPage';
import NewPopularPage from './pages/NewPopularPage';
import WatchlistPage from './pages/WatchlistPage';
import PlayPage from './pages/PlayPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const isPlay = false; // pathname.startsWith('/play');

  return (
    <div className="app">
      {!isPlay && <Navbar />}
      <main className="main-content">
        <div className="portfolio-banner">
          <i className="fas fa-code" /> Demo / Portfolio Project - Not for commercial use
        </div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TVShowsPage />} />
          <Route path="/new-popular" element={<NewPopularPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/play/:type/:id" element={<PlayPage />} />
          <Route path="/play/:id" element={<PlayPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isPlay && <Footer />}
    </div>
  );
}