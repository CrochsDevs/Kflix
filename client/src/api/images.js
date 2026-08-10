export const IMG = {
  poster: (path, size = 'w500') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  backdrop: (path, size = 'original') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
};

export const PLACEHOLDER = 'https://via.placeholder.com/500x750?text=No+Image';

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
