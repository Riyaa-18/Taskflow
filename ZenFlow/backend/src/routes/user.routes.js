const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { searchUsers, updateProfile, changePassword, deleteAccount } = require('../controllers/user.controller');

router.use(authenticate);

router.get('/search', searchUsers);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.delete('/account', deleteAccount);

module.exports = router;
