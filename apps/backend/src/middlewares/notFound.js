const notFound = (req, res, next) => {
  console.log(`❌ ROUTE NOT FOUND: ${req.originalUrl} | Method: ${req.method} | Origin: ${req.headers.origin || 'no-origin'}`);
  console.log(`❌ Available routes check - this should help debug 404 issues`);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export default notFound;
