import { Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import User, { publicUser } from '../models/User.js';
import { validate } from '../validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Enter a valid email.')
  .customSanitizer((value) => value.toLowerCase());

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post(
  '/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 60 }).withMessage('Name must be 60 characters or fewer.'),
    emailRule,
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ]),
  async (req, res, next) => {
    try {
      const existing = await User.findOne({ email: req.body.email });
      if (existing) {
        return res.status(409).json({
          message: 'An account with that email already exists.',
          errors: [{ field: 'email', message: 'This email is already registered.' }],
        });
      }
      const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      res.status(201).json({ token: signToken(user), user: publicUser(user) });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  validate([emailRule, body('password').notEmpty().withMessage('Password is required.')]),
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select('+password');
      if (!user || !(await user.comparePassword(req.body.password))) {
        return res.status(401).json({ message: 'Email or password is incorrect.' });
      }
      res.json({ token: signToken(user), user: publicUser(user) });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.get('/demo', async (_req, res, next) => {
  try {
    const user = await User.findOne({ email: 'demo@taskmanager.local' });
    res.json({ available: Boolean(user) });
  } catch (error) {
    next(error);
  }
});

export default router;
