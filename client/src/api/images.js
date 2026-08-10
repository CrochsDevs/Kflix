// Build TMDB image URLs at the size we actually need (saves bandwidth)
const IMG = {
  poster: (path, size = 'w342') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  backdrop: (path, size = 'w780') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
};

// Pre-computed blur placeholders (tiny inline SVG, <100 bytes each)
const blurDataURL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyIDEzIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImIiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSIxMyIgZmlsbD0iIzFhMWExYSIvPjxnIGZpbHRlcj0idXJsKCNiKSIgb3BhY2l0eT0iLjUiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjEzIiBmaWxsPSIjMjQyNDI0Ii8+PC9nPjwvc3ZnPg==';

export const PLACEHOLDER = blurDataURL;

// Slim response field mapping (server sends short keys to save bytes)
// m -> title/name, p -> poster_path, b -> backdrop_path, r -> vote_average,
// y -> year, o -> overview, a -> adult, g -> genre_ids, t -> type ('movie'|'tv')
function fromSlim(item) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title || item.n,
    name: item.n || item.title,
    poster_path: item.p,
    backdrop_path: item.b,
    overview: item.o,
    vote_average: item.r,
    vote_count: item.v,
    release_date: item.y ? `${item.y}-01-01` : '',
    first_air_date: item.y ? `${item.y}-01-01` : '',
    adult: item.a === 1,
    genre_ids: item.g,
    popularity: item.pop,
    mediaType: item.t,
  };
}

export function slimToCard(item) {
  const slimmed = fromSlim(item);
  return slimmed;
}

export const fmt = {
  year: (date) => (date && date.length >= 4 ? date.slice(0, 4) : 'N/A'),
  rating: (n) => (n ? Number(n).toFixed(1) : 'N/A'),
};

export const titleFor = (item, type) => {
  if (!item) return '';
  if (type === 'tv') return item.name || item.title || '';
  return item.title || item.name || '';
};

export const dateFor = (item, type) => {
  if (type === 'tv') return item.first_air_date || '';
  return item.release_date || '';
};