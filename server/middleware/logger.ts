import { Request, Response, NextFunction } from "express";

/**
 * A lightweight request logging middleware.
 * Logs method, path, response status, and duration.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Clean request path
  const path = req.originalUrl || req.url;

  // Once request is finished, log the details
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Select color wrapper depending on status (helps log visibility in development)
    let statusText = `[${status}]`;
    if (status >= 500) {
      statusText = `\x1b[31m[${status}]\x1b[0m`; // Red
    } else if (status >= 400) {
      statusText = `\x1b[33m[${status}]\x1b[0m`; // Yellow
    } else if (status >= 200) {
      statusText = `\x1b[32m[${status}]\x1b[0m`; // Green
    }

    console.log(
      `[Server] ${req.method} to ${path} - Status: ${statusText} - Duration: ${duration}ms`
    );
  });

  next();
}
