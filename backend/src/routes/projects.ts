import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Project from '../models/Project';

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

const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
    body('description')
      .optional()
      .trim(),
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color (e.g., #FF5733)')
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { name, description, color } = req.body;
      const userId = getUserIdFromHeader(req);
      
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const project = new Project({
        name,
        description,
        color,
        owner: userId
      });

      await project.save();

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error creating project' });
    }
  }
);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    const projects = await Project.find({ owner: userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().trim(),
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color (e.g., #FF5733)')
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, color } = req.body;
      const userId = getUserIdFromHeader(req);

      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const project = await Project.findOne({ _id: id, owner: userId });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (name !== undefined) project.name = name;
      if (description !== undefined) project.description = description;
      if (color !== undefined) project.color = color;

      await project.save();

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: 'Error updating project' });
    }
  }
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = getUserIdFromHeader(req);

      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const project = await Project.findOneAndDelete({
        _id: id,
        owner: userId
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting project' });
    }
  }
);

export default router;
