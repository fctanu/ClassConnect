import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import Post from '../models/Post';
import PostLike from '../models/PostLike';
import User from '../models/User';
import Comment from '../models/Comment';
import { postCreationLimiter, commentLimiter, likeLimiter } from '../middleware/rateLimiter';

const router = Router();
const uploadRoot = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    // Block path traversal attempts
    if (file.originalname.includes('..') ||
      file.originalname.includes('/') ||
      file.originalname.includes('\\')) {
      return cb(new Error('Invalid filename - path traversal detected'), '');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]+/gi, '-')
      .slice(0, 40);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${base || 'image'}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    // Strict whitelist of allowed file types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedMimes.includes(file.mimetype) || !allowedExts.includes(ext)) {
      return cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
    }
    cb(null, true);
  },
});

function getUserIdFromHeader(req: Request) {
  const auth = req.headers.authorization as string | undefined;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret') as {
      sub?: string;
    };
    return payload.sub || null;
  } catch {
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

function toPublicPost(post: any, likedByMe = false) {
  const obj = post.toObject();
  return { ...obj, likedByMe };
}

router.get('/', async (req: Request, res: Response) => {
  const viewerId = getUserIdFromHeader(req);
  const posts = await Post.find().sort({ createdAt: -1 });
  let likedSet = new Set<string>();
  if (viewerId) {
    const likes = await PostLike.find({
      user: viewerId,
      post: { $in: posts.map((post) => post._id) },
    }).select('post');
    likedSet = new Set(likes.map((like) => like.post.toString()));
  }
  res.json(
    posts.map((post) => toPublicPost(post, likedSet.has(post._id.toString()))),
  );
});

router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid post ID'),
  validate,
  async (req: Request, res: Response) => {
    const viewerId = getUserIdFromHeader(req);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    let likedByMe = false;
    if (viewerId) {
      const exists = await PostLike.exists({ post: post._id, user: viewerId });
      likedByMe = !!exists;
    }
    res.json(toPublicPost(post, likedByMe));
  },
);

router.post(
  '/',
  postCreationLimiter,
  upload.array('images', 6),
  body('title').trim().isLength({ min: 1, max: 120 }).withMessage('title is required'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('description too long'),
  body('images').optional().isArray({ max: 6 }).withMessage('images must be an array'),
  body('images.*').optional().isString(),
  body('imageUrls').optional().isString(),
  validate,
  async (req: Request, res: Response) => {
    const userId = getUserIdFromHeader(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { title, description, images, imageUrls } = req.body;
    const urlImages = Array.isArray(images)
      ? images
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
      : [];
    const extraUrls =
      typeof imageUrls === 'string'
        ? imageUrls
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
        : [];
    const uploadedFiles = Array.isArray(req.files)
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];
    const normalizedImages = [...urlImages, ...extraUrls, ...uploadedFiles].slice(0, 6);
    const post = await Post.create({
      title,
      description,
      images: normalizedImages,
      owner: user._id,
      authorName: user.name,
    });

    res.status(201).json(toPublicPost(post, false));
  },
);

router.put(
  '/:id',
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('title').optional().trim().isLength({ min: 1, max: 120 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('images').optional().isArray({ max: 6 }),
  body('images.*').optional().isString(),
  validate,
  async (req: Request, res: Response) => {
    const userId = getUserIdFromHeader(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const update: Record<string, unknown> = {};
    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.description !== undefined) update.description = req.body.description;
    if (req.body.images !== undefined) {
      update.images = Array.isArray(req.body.images)
        ? req.body.images
          .filter((item: unknown) => typeof item === 'string')
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0)
          .slice(0, 6)
        : [];
    }

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      update,
      { new: true, includeResultMetadata: false },
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    let likedByMe = false;
    const exists = await PostLike.exists({ post: post._id, user: userId });
    likedByMe = !!exists;
    res.json(toPublicPost(post, likedByMe));
  },
);

router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid post ID'),
  validate,
  async (req: Request, res: Response) => {
    const userId = getUserIdFromHeader(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const post = await Post.findOneAndDelete({ _id: req.params.id, owner: userId }, { includeResultMetadata: false });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await PostLike.deleteMany({ post: post._id });
    res.json({ success: true });
  },
);

router.post(
  '/:id/like',
  likeLimiter,
  param('id').isMongoId().withMessage('Invalid post ID'),
  validate,
  async (req: Request, res: Response) => {
    const userId = getUserIdFromHeader(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const existing = await PostLike.findOne({ post: post._id, user: userId });
    if (existing) {
      await existing.deleteOne();
      await Post.updateOne(
        { _id: post._id, likeCount: { $gt: 0 } },
        { $inc: { likeCount: -1 } },
      );
      const refreshed = await Post.findById(post._id);
      return res.json({ likeCount: refreshed?.likeCount || 0, likedByMe: false });
    }

    try {
      await PostLike.create({ post: post._id, user: new mongoose.Types.ObjectId(userId) });
      await Post.updateOne({ _id: post._id }, { $inc: { likeCount: 1 } });
    } catch (err: unknown) {
      // ignore duplicate like attempts
    }
    const refreshed = await Post.findById(post._id);
    return res.json({ likeCount: refreshed?.likeCount || 0, likedByMe: true });
  },
);

// Get comments for a post
router.get(
  '/:id/comments',
  param('id').isMongoId().withMessage('Invalid post ID'),
  validate,
  async (req: Request, res: Response) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ post: post._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(comments);
  },
);

// Create a comment on a post
router.post(
  '/:id/comments',
  commentLimiter,
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment content is required (max 500 characters)'),
  validate,
  async (req: Request, res: Response) => {
    const userId = getUserIdFromHeader(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      content: req.body.content,
      post: post._id,
      author: user._id,
      authorName: user.name,
    });

    res.status(201).json(comment);
  },
);

export default router;
