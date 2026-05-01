const router = require('express').Router();
const { body } = require('express-validator');
const { signup, login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/signup', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], signup);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], login);

router.get('/me', authenticate, getMe);

module.exports = router;
