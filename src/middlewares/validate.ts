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
    if (error && error.errors && Array.isArray(error.errors)) {
      const errors = error.errors.map((err: any) => ({
        field: err.path.slice(1).join('.'),
        message: err.message
      }));
      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors
      });
      return;
    }
    next(error);
  }
};
