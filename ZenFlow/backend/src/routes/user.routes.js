const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { searchUsers, updateProfile, changePassword } = require('../controllers/user.controller');

router.use(authenticate);

router.get('/search', searchUsers);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

module.exports = router;
