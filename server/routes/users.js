const router = require('express').Router();
const { getUsers, deleteUser } = require('../controllers/userController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth, adminOnly);

router.get('/', getUsers);
router.delete('/:id', deleteUser);

module.exports = router;
