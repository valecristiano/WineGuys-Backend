// importa la connessione al database
const connection = require("../connections/connDb");

// importa le funzioni di utilità per gestire gli errori
const { handleFailQuery, handleResourceNotFound } = require("../utils/dbUtils");

// INDEX - ritorna tutti in vini senza categorie
const index = (req, res) => {
  const sql = `SELECT * FROM products`;

  // esegue la query sul database
  connection.query(sql, (err, results) => {
    if (err) return handleFailQuery(err, res);
    res.json(results);
  });
};

// INDEX - ritorna tutti i vini colla loro categoria
const indexPromo = (req, res) => {
  // query che prende tutti i prodotti e fa JOIN conlle categorie
  const sql = `
   SELECT p.*, c.category_name
   FROM products p
   JOIN mrk_categories c 
   ON p.category_id = c.id
   WHERE c.id = 1
   `;

  // esegue la query sul database
  connection.query(sql, (err, results) => {
    // se c'è un errore lo manda al client
    if (err) return handleFailQuery(err, res);
    // se va bene manda i risultati al client
    res.json(results);
  });
};

const show = (req, res) => {
  // prende lo slug dall'url
  const { slug } = req.params;

  // query che cerca il prodotto tramite slug
  const sql = "SELECT * FROM products WHERE slug = ?";

  // esegue la query sul database
  connection.query(sql, [slug], (err, results) => {
    // se c'è un errore lo manda al client
    if (err) return handleFailQuery(err, res);
    // prende il primo riusltato
    const wine = results[0];
    // se non trova il vino manda 404
    if (!wine) return handleResourceNotFound(res);
    // se va bene manda il risultato al client
    res.json({ result: wine });
  });
};

const store = (req, res) => {
  res.json({ message: "Vino aggiunto" });
};

module.exports = { index, indexPromo, show, store };
