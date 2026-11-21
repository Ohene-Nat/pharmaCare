const router = require('express').Router();
const { login, register, getProfile } = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validate');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/login', validateLogin, login);
router.post('/register', auth, adminOnly, validateRegister, register);
router.get('/profile', auth, getProfile);

module.exports = router;
