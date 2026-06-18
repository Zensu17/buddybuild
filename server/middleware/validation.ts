import { Request, Response, NextFunction } from "express";

export type ValidationRule = 
  | { type: "string"; minLength?: number; maxLength?: number; required?: boolean }
  | { type: "number"; min?: number; max?: number; required?: boolean }
  | { type: "boolean"; required?: boolean }
  | { type: "array"; required?: boolean };

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Validates req.body against a provided schema.
 * Sends a structured 400 Bad Request error if validation fails.
 */
export function validateBody(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { [key: string]: string } = {};
    const body = req.body || {};

    for (const key of Object.keys(schema)) {
      const rule = schema[key];
      const val = body[key];

      // Check for required field
      if (rule.required && (val === undefined || val === null || val === "")) {
        errors[key] = `Field '${key}' is required.`;
        continue;
      }

      // If not required and not provided, skip type/length validation
      if (val === undefined || val === null) {
        continue;
      }

      // Type validation
      if (rule.type === "string") {
        if (typeof val !== "string") {
          errors[key] = `Field '${key}' must be a string.`;
        } else {
          if (rule.minLength !== undefined && val.trim().length < rule.minLength) {
            errors[key] = `Field '${key}' must be at least ${rule.minLength} characters long.`;
          }
          if (rule.maxLength !== undefined && val.trim().length > rule.maxLength) {
            errors[key] = `Field '${key}' must not exceed ${rule.maxLength} characters.`;
          }
        }
      } else if (rule.type === "number") {
        if (typeof val !== "number" || Number.isNaN(val)) {
          errors[key] = `Field '${key}' must be a valid number.`;
        } else {
          if (rule.min !== undefined && val < rule.min) {
            errors[key] = `Field '${key}' must be at least ${rule.min}.`;
          }
          if (rule.max !== undefined && val > rule.max) {
            errors[key] = `Field '${key}' must not exceed ${rule.max}.`;
          }
        }
      } else if (rule.type === "boolean") {
        if (typeof val !== "boolean") {
          errors[key] = `Field '${key}' must be a boolean value.`;
        }
      } else if (rule.type === "array") {
        if (!Array.isArray(val)) {
          errors[key] = `Field '${key}' must be an array.`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        error: "Validation failed.",
        details: errors,
      });
      return;
    }

    next();
  };
}
