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

// INDEX - Cateforia Vini in promo
const indexPromo = (req, res) => {
  // query che prende tutti i prodotti e fa JOIN conlle categorie
  const sql = `
   SELECT 
    p.*, 
    CONCAT('http://localhost:3000/wines/', p.img) AS img_url,
    c.category_name
  FROM products p
  JOIN mrk_categories c ON p.category_id = c.id
  WHERE c.id = 3
   `;

  // esegue la query sul database
  connection.query(sql, (err, results) => {
    // se c'è un errore lo manda al client
    if (err) return handleFailQuery(err, res);
    // se va bene manda i risultati al client
    res.json(results);
  });
};

// INDEX - categoria vini premiati
const indexPremi = (req, res) => {
  // query che prende tutti i prodotti e fa JOIN conlle categorie
  const sql = `
   SELECT 
    p.*, 
    CONCAT('http://localhost:3000/wines/', p.img) AS img_url,
    c.category_name
  FROM products p
  JOIN mrk_categories c ON p.category_id = c.id
  WHERE c.id = 2
   `;

  // esegue la query sul database
  connection.query(sql, (err, results) => {
    // se c'è un errore lo manda al client
    if (err) return handleFailQuery(err, res);
    // se va bene manda i risultati al client
    res.json(results);
  });
};

// INDEX - categoria vini più venduti
const indexPiuVenduti = (req, res) => {
  // query che prende tutti i prodotti e fa JOIN conlle categorie
  const sql = `
   SELECT 
    p.*, 
    CONCAT('http://localhost:3000/wines/', p.img) AS img_url,
    c.category_name
  FROM products p
  JOIN mrk_categories c ON p.category_id = c.id
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

// INDEX - categoria vini di primavera
const indexPrimavera = (req, res) => {
  // query che prende tutti i prodotti e fa JOIN conlle categorie
  const sql = `
   SELECT 
    p.*, 
    CONCAT('http://localhost:3000/wines/', p.img) AS img_url,
    c.category_name
  FROM products p
  JOIN mrk_categories c ON p.category_id = c.id
  WHERE c.id = 4
   `;

  // esegue la query sul database
  connection.query(sql, (err, results) => {
    // se c'è un errore lo manda al client
    if (err) return handleFailQuery(err, res);
    // se va bene manda i risultati al client
    res.json(results);
  });
};

//SHOW
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

module.exports = { index, indexPromo, indexPremi, indexPiuVenduti, indexPrimavera, show, store };
