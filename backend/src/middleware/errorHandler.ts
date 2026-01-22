import { Request, Response, NextFunction } from 'express';

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);
  type Err = { status?: number; message?: string };
  const e = err as Err;
  const status = e?.status || 500;
  const message = e?.message || 'Internal Server Error';
  res.status(status).json({ message });
}
/* eslint-enable @typescript-eslint/no-unused-vars */
