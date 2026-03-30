function notFound(req, res, next) {
  return res.status(404).json({
    message: "endpoint not found",
  });
}

module.exports = notFound;
