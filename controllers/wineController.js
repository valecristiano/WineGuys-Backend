// importa la connessione al database
const connection = require("../connections/connDb");

// INDEX - ritorna tutti i vini colla loro categoria
const index = (req, res) => {
  // query che prende tutti i prodotti e fa JOIN conlle categorie
  const sql = `
   SELECT p.*, c.category_name
   FROM products p
   JOIN mrk_categories c 
   ON p.category_id = c.id
   `;

  // esegue la query sul database
  connection.query(sql, (err, results) => {
    // se c'è un errore lo manda al client
    if (err) return res.status(500).json({ error: err.message });
    // se va bene manda i risultati al client
    res.json(results);
  });
};

const show = (req, res) => {
  res.json({ message: "Dettaglio vino" });
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

module.exports = { index, show, store };
