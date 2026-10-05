import { validationResult } from 'express-validator';

export function validate(checks) {
  return [
    ...checks,
    (req, res, next) => {
      const result = validationResult(req);
      if (result.isEmpty()) return next();
      res.status(400).json({
        message: 'Check the highlighted fields.',
        errors: result.array().map((error) => ({ field: error.path, message: error.msg })),
      });
    },
  ];
}
