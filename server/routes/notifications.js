const router = require('express').Router();
const { getNotifications } = require('../controllers/notificationController');
const { auth, superAdminOnly } = require('../middleware/auth');

router.get('/', auth, superAdminOnly, getNotifications);

module.exports = router;
