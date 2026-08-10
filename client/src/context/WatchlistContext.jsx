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
      // Silent — UI works without persisted data on first load
    }
  }, []);

  useEffect(() => {
    // Slight delay so the page can render first; UI works without this completing
    const t = setTimeout(refresh, 200);
    return () => clearTimeout(t);
  }, [refresh]);

  const toggle = useCallback(
    async (item) => {
      const movieId = item.id || item.movieId;
      const inList = ids.has(movieId);
      // Optimistic update
      setIds((prev) => {
        const next = new Set(prev);
        if (inList) next.delete(movieId);
        else next.add(movieId);
        return next;
      });
      setCount((c) => Math.max(0, c + (inList ? -1 : 1)));
      try {
        if (inList) {
          await apiRemove(movieId, USER_ID);
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
        }
      } catch (e) {
        // Rollback optimistic update on failure
        setIds((prev) => {
          const next = new Set(prev);
          if (inList) next.add(movieId);
          else next.delete(movieId);
          return next;
        });
        setCount((c) => Math.max(0, c + (inList ? 1 : -1)));
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