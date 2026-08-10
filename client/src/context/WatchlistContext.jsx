import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  addToWatchlist as apiAdd,
  getWatchlist,
  removeFromWatchlist as apiRemove,
  watchlistStatus,
} from '../api/client';

const WatchlistContext = createContext(null);
const USER_ID = 'guest';

export function WatchlistProvider({ children }) {
  const [ids, setIds] = useState(new Set());
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await getWatchlist({ userId: USER_ID, itemsPerPage: 100 });
      const items = (res.data || []).map((i) => i.movieId);
      setIds(new Set(items));
      setCount(res.total || items.length);
    } catch (e) {
      console.warn('Watchlist refresh failed:', e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (item) => {
      const movieId = item.id || item.movieId;
      const inList = ids.has(movieId);
      try {
        if (inList) {
          await apiRemove(movieId, USER_ID);
          setIds((prev) => {
            const next = new Set(prev);
            next.delete(movieId);
            return next;
          });
          setCount((c) => Math.max(0, c - 1));
        } else {
          await apiAdd({
            id: movieId,
            title: item.title || item.name,
            posterPath: item.posterPath || item.poster_path || '',
            voteAverage: item.voteAverage ?? item.vote_average ?? 0,
            releaseDate: item.releaseDate || item.release_date || '',
            mediaType: item.mediaType || (item.first_air_date ? 'tv' : 'movie'),
            userId: USER_ID,
          });
          setIds((prev) => new Set(prev).add(movieId));
          setCount((c) => c + 1);
        }
      } catch (e) {
        console.error('Toggle failed', e);
      }
    },
    [ids]
  );

  const checkStatus = useCallback(async (movieId) => {
    try {
      const res = await watchlistStatus(movieId, USER_ID);
      return !!res.inWatchlist;
    } catch {
      return false;
    }
  }, []);

  const value = {
    ids,
    count,
    has: (id) => ids.has(id),
    refresh,
    toggle,
    checkStatus,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
