const express = require('express');
const router = express.Router();

const { list, trendingCombined } = require('../controllers/discoverController');
const { getGenres } = require('../controllers/genresController');
const { getContent } = require('../controllers/contentController');
const watchlist = require('../controllers/watchlistController');
const history = require('../controllers/historyController');

router.get('/discover', list);
router.get('/discover/new-popular', trendingCombined);
router.get('/genres', getGenres);
router.get('/content', getContent);

router.get('/watchlist', watchlist.list);
router.post('/watchlist', watchlist.add);
router.delete('/watchlist/:id', watchlist.remove);
router.delete('/watchlist', watchlist.clear);
router.get('/watchlist/status', watchlist.status);

router.post('/history', history.add);
router.get('/history', history.list);

module.exports = router;
