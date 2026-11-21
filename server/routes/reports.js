const router = require('express').Router();
const { getDailyReport, getSummary, getWeeklySummary } = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/daily', getDailyReport);
router.get('/summary', getSummary);
router.get('/weekly', getWeeklySummary);

module.exports = router;
