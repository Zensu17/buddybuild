import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory request store
const ipStore: RateLimitStore = {};

// Clean up store periodically to prevent memory leaks (e.g. every 1 hour)
setInterval(() => {
  const now = Date.now();
  for (const ip in ipStore) {
    if (now > ipStore[ip].resetTime) {
      delete ipStore[ip];
    }
  }
}, 60 * 60 * 1000).unref(); // unref allows process to exit if only this interval is active

export interface LimiterOptions {
  windowMs: number;       // Time window in milliseconds
  max: number;            // Max requests per windowMs
  message: string;        // Custom response message
}

/**
 * Creates a lightweight, in-memory rate limiter middleware.
 */
export function rateLimiter(options: LimiterOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();

    if (!ipStore[ip] || now > ipStore[ip].resetTime) {
      // Initialize or reset limit window
      ipStore[ip] = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      return next();
    }

    // Increment count
    ipStore[ip].count++;

    if (ipStore[ip].count > options.max) {
      console.warn(`[RateLimiter] Rate limit exceeded for IP: ${ip} on path ${req.originalUrl}`);
      res.status(429).json({
        success: false,
        error: options.message,
      });
      return;
    }

    next();
  };
}
