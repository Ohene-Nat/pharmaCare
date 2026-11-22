const router = require('express').Router();
const { createTest, getTestsByCustomer, getAllTests } = require('../controllers/testController');
const { validateTest } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/', validateTest, createTest);
router.get('/', getAllTests);
router.get('/customer/:id', getTestsByCustomer);

module.exports = router;
