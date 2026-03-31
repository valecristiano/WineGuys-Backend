function handleFailQuery(err, res) {
  const responseData = {
    message: "database query failed",
  };
  console.log(err.message);
  return res.status(500).json(responseData);
}

function handleResourceNotFound(res) {
  return res.status(404).json({message:"resource not found"})
}

module.exports = { handleFailQuery, handleResourceNotFound };