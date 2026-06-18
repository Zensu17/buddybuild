import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  details?: any;
}

/**
 * Global centralized error handling middleware.
 * Prevents system details from leaking to the frontend while logging stack traces.
 */
export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  // Detailed logging on server console
  console.error(`[ServerError] Error occurred during ${req.method} ${req.originalUrl}:`);
  console.error(err.stack || err);

  res.status(statusCode).json({
    success: false,
    error: err.message || "An unexpected error occurred on the server.",
    ...(err.details ? { details: err.details } : {}),
    ...(!isProduction ? { stack: err.stack } : {}),
  });
}
