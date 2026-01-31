import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);
  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image too large (max 3MB)'
        : err.message;
    return res.status(400).json({ message });
  }
  if (err instanceof Error && err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  type Err = { status?: number; message?: string };
  const e = err as Err;
  const status = e?.status || 500;
  const message = e?.message || 'Internal Server Error';
  res.status(status).json({ message });
}
/* eslint-enable @typescript-eslint/no-unused-vars */
