import { Router } from 'express';
import { body } from 'express-validator';
import Task from '../models/Task.js';
import { validate } from '../validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const statuses = ['todo', 'in-progress', 'done'];
const priorities = ['low', 'medium', 'high'];

const createRules = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 120 }).withMessage('Title must be 120 characters or fewer.'),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }).withMessage('Description must be 2000 characters or fewer.'),
  body('status').optional({ values: 'falsy' }).isIn(statuses).withMessage('Choose a valid status.'),
  body('priority').optional({ values: 'falsy' }).isIn(priorities).withMessage('Choose a valid priority.'),
  body('dueDate').optional({ values: 'falsy' }).isISO8601({ strict: true }).withMessage('Use a valid date.'),
];

const updateRules = [
  body('title').optional().trim().notEmpty().withMessage('Title is required.').isLength({ max: 120 }).withMessage('Title must be 120 characters or fewer.'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be 2000 characters or fewer.'),
  body('status').optional().isIn(statuses).withMessage('Choose a valid status.'),
  body('priority').optional().isIn(priorities).withMessage('Choose a valid priority.'),
  body('dueDate').optional({ values: 'falsy' }).isISO8601({ strict: true }).withMessage('Use a valid date.'),
];

router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

router.post('/', validate(createRules), async (req, res, next) => {
  try {
    const task = await Task.create({
      user: req.user._id,
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'todo',
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate || '',
    });
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validate(updateRules), async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.status !== undefined) task.status = req.body.status;
    if (req.body.priority !== undefined) task.priority = req.body.priority;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate || '';
    await task.save();
    res.json({ task });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
