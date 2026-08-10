const { tmdbRequest } = require('../services/tmdb');
const { searchPlayableMovie } = require('../services/archive');

function pickYouTubeTrailer(videos = []) {
  const trailer = videos.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  );
  if (trailer) return trailer;
  const first = videos.find((v) => v.site === 'YouTube');
  return first || null;
}

function buildEmbedServers(type, movieId, season = 1, episode = 1) {
  if (type === 'tv') {
    return [
      {
        name: 'Server 1',
        url: `https://vidsrc.to/embed/tv/${movieId}/${season}/${episode}`,
        status: 'active',
      },
      {
        name: 'Server 2',
        url: `https://multiembed.mov/?video_id=${movieId}&s=${season}&e=${episode}`,
        status: 'active',
      },
    ];
  }
  return [
    {
      name: 'Server 1',
      url: `https://vidsrc.to/embed/movie/${movieId}`,
      status: 'active',
    },
    {
      name: 'Server 2',
      url: `https://multiembed.mov/?video_id=${movieId}`,
      status: 'active',
    },
  ];
}

async function getContent(req, res, next) {
  try {
    const type = req.query.type === 'tv' ? 'tv' : 'movie';
    const id = parseInt(req.query.id, 10);
    const season = parseInt(req.query.season, 10) || 1;
    const episode = parseInt(req.query.episode, 10) || 1;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing id' });
    }
    const data = await tmdbRequest(`/${type}/${id}`, {
      append_to_response: 'videos,credits,recommendations,similar',
    });

    const trailer = pickYouTubeTrailer(data.videos?.results || []);
    const recommendations =
      data.recommendations?.results?.length
        ? data.recommendations.results.slice(0, 12)
        : (data.similar?.results || []).slice(0, 12);

    // Public-domain / CC streams from archive.org (free, safe)
    const title = type === 'tv' ? data.name : data.title;
    const releaseDate = type === 'tv' ? data.first_air_date : data.release_date;
    const year = releaseDate ? releaseDate.slice(0, 4) : '';
    const archiveSources = type === 'movie' ? await searchPlayableMovie(title, year, 3) : [];

    // Embed servers (personal use only — third-party streams)
    const embeds = buildEmbedServers(type, id, season, episode);

    res.json({
      success: true,
      data: {
        ...data,
        mediaType: type,
        trailer,
        recommendations,
        sources: archiveSources,
        embeds,
      },
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    next(err);
  }
}

module.exports = { getContent };
