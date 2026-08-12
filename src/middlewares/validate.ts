import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error: any) {
    const issues = error?.issues || error?.errors;
    if (error && Array.isArray(issues)) {
      const errors = issues.map((err: any) => ({
        field: Array.isArray(err.path) ? err.path.filter((p: any) => p !== 'body' && p !== 'query' && p !== 'params').join('.') : '',
        message: err.message
      }));

      const primaryMessage = errors
        .map((e: any) => {
          if (e.field) {
            const fieldName = e.field.charAt(0).toUpperCase() + e.field.slice(1);
            return `${fieldName}: ${e.message}`;
          }
          return e.message;
        })
        .filter(Boolean)
        .join('. ') || 'Validation failed. Please check your inputs.';

      res.status(400).json({
        status: 'fail',
        message: primaryMessage,
        errors
      });
      return;
    }
    next(error);
  }
};

