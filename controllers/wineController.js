const connection = require("../connections/connDb");

const {
  handleFailQuery,
  handleResourceNotFound, 
} = require("../utils/dbUtils"); 

const index = (req, res) => {
  res.json({ message: "Lista vini" });
};

const show = (req, res) => {
  const { id } = req.params; 
  
  const sql = "SELECT * FROM products WHERE id = ?";

  connection.query(sql, [id], (err, result) => {
    if (err) return handleFailQuery(err, res);
    const wine = result[0];
    if (!wine) return handleResourceNotFound(res);
    res.json({result: wine});
  });
};

const store = (req, res) => {
  res.json({ message: "Vino aggiunto" });
};


module.exports = { index, show, store, };
