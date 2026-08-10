import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const HomePage = lazy(() => import('./pages/HomePage'));
const MoviesPage = lazy(() => import('./pages/MoviesPage'));
const TVShowsPage = lazy(() => import('./pages/TVShowsPage'));
const NewPopularPage = lazy(() => import('./pages/NewPopularPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const PlayPage = lazy(() => import('./pages/PlayPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="play-loading">
      <div className="spinner" />
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  const isPlay = false;

  return (
    <div className="app">
      {!isPlay && <Navbar />}
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </main>
      {!isPlay && <Footer />}
    </div>
  );
}