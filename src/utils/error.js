export default function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error;
  error = Object.assign(err, error);

  return res.status(err.statusCode).json({
    status: err.status,
    name: err.name,
    code: err.code,
    errors: err.errorArray,
    message: err.message,
    stack: err.stack,
  });
}
