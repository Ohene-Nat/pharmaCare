const router = require('express').Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer } = require('../controllers/customerController');
const { validateCustomer } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', validateCustomer, createCustomer);
router.put('/:id', validateCustomer, updateCustomer);

module.exports = router;
