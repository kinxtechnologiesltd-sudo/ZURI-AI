import multer from "multer";

export function errorHandler(
  err,
  req,
  res,
  next
) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: err.code,
      field: err.field,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    error:
      err.message ||
      "Internal server error.",
  });
}