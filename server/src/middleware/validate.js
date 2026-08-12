// server/src/middleware/validate.js
const ApiError = require("../utils/ApiError");

/**
 * Validates req.body (or req.query) against a Zod schema.
 * Usage: router.post('/', validate(studentCreateSchema), controller.create)
 */
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return next(new ApiError(422, "Validation failed", details));
  }

  req[source] = result.data;
  next();
};

module.exports = validate;
