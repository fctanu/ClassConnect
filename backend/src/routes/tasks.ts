import { Router, Request, Response } from 'express';
import Task from '../models/Task';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = Router();

function getUserIdFromHeader(req: Request) {
  const auth = req.headers.authorization as string | undefined;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret') as {
      sub?: string;
    };
    return payload.sub;
  } catch (err) {
    return null;
  }
}

router.get('/', async (req: Request, res: Response) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { 
    category, 
    priority, 
    dueBefore, 
    dueAfter,
    search,
    sortBy,
    order = 'desc'
  } = req.query;

  const filter: any = { owner: userId };

  if (category) {
    filter.category = category;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (dueBefore || dueAfter) {
    filter.dueDate = {};
    if (dueBefore) {
      filter.dueDate.$lte = new Date(dueBefore as string);
    }
    if (dueAfter) {
      filter.dueDate.$gte = new Date(dueAfter as string);
    }
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const sort: any = {};
  if (sortBy) {
    sort[sortBy as string] = order === 'asc' ? 1 : -1;
  } else {
    sort.createdAt = -1;
  }

  const tasks = await Task.find(filter).sort(sort);
  res.json(tasks);
});

router.post(
  '/',
  body('title').isString().isLength({ min: 1 }).withMessage('title is required'),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid date'),
  body('priority').optional().isIn(['P1', 'P2', 'P3', 'P4']).withMessage('priority must be P1, P2, P3, or P4'),
  body('category').optional().isString(),
  body('reminder').optional().isBoolean(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const userId = getUserIdFromHeader(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { title, description, dueDate, priority, category, reminder } = req.body;
    const task = await Task.create({ 
      title, 
      description, 
      dueDate,
      priority,
      category,
      reminder,
      owner: userId 
    });
    res.json(task);
  },
);

router.put(
  '/:id',
  body('title').optional().isString(),
  body('completed').optional().isBoolean(),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid date'),
  body('priority').optional().isIn(['P1', 'P2', 'P3', 'P4']).withMessage('priority must be P1, P2, P3, or P4'),
  body('category').optional().isString(),
  body('reminder').optional().isBoolean(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const userId = getUserIdFromHeader(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: userId }, req.body, {
      new: true,
    });
    if (!task) return res.status(404).json({ message: 'Not found' });
    res.json(task);
  },
);

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromHeader(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: userId,
  });
  if (!task) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
});

export default router;
