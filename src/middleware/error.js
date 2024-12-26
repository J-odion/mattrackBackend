// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
  // Log the error stack trace
  console.error(err.stack);

  // Determine appropriate status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Respond with the error details
  res.status(statusCode).json({
    error: "Something went wrong",
    message: err.message,
    // Hide stack trace in production
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
