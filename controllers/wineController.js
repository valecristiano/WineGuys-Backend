// importa la connessione al database
const connection = require("../connections/connDb");

// importa le funzion di utilità per gestire gli errori
const { handleFailQuery, handleResourceNotFound } = require("../utils/dbUtils");

// INDEX - ritorna tutti i vini senza categorie con filtri opzionali
const index = (req, res) => {
  // legge i parametri di filtro dall'URL
  const { tipo, annata, vitigno, prezzo } = req.query;

  // costruisce la query dinamicamnete coi filtri
  const conditions = [];
  const values = [];

  // se il filtro tipo è presente aggiunge la condizione
  if (tipo) {
    conditions.push("type = ?");
    values.push(tipo);
  }

  // se il filtro annata è presente aggiunge la condizione
  if (annata) {
    conditions.push("vintage = ?");
    values.push(annata);
  }

  // se il filtro vitigno è presente aggiunge la condizione
  if (vitigno) {
    conditions.push("grape = ?");
    values.push(vitigno);
  }

  // se il filtro prezzo è presente aggounge la conizione
  if (prezzo === "0-20") {
    conditions.push("price <=20");
  } else if (prezzo === "20-50") {
    conditions.push("price > 20 AND price <=50");
  } else if (prezzo === "50+") {
    conditions.push("price >50");
  }

  // costruisce la WHERE clause solo se ci sono filtri
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // costruisce la SQL con i filtri
  const sql = `
    SELECT *,
    CONCAT('http://localhost:3000/wines/', img) AS img_url
    FROM products
    ${whereClause}
  `;

  // esegue la query sul database
  connection.query(sql, values, (err, results) => {
    // se c'è un errore lo manda al client
    if (err) return handleFailQuery(err, res);
    // se va bene manda i risultati al client
    res.json(results);
  });
};

// INDEX - Categoria Vini in promo
const indexPromo = (req, res) => {
  const sql = `
   SELECT 
    p.*, 
    CONCAT('http://localhost:3000/wines/', p.img) AS img_url,
    c.category_name
  FROM products p
  JOIN mrk_categories c ON p.category_id = c.id
  WHERE c.id = 3
   `;
  connection.query(sql, (err, results) => {
    if (err) return handleFailQuery(err, res);
    res.json(results);
  });
};

// INDEX - categoria vini premiati
const indexPremi = (req, res) => {
  const sql = `
   SELECT 
    p.*, 
    CONCAT('http://localhost:3000/wines/', p.img) AS img_url,
    c.category_name
  FROM products p
  JOIN mrk_categories c ON p.category_id = c.id
  WHERE c.id = 2
   `;
  connection.query(sql, (err, results) => {
    if (err) return handleFailQuery(err, res);
    res.json(results);
  });
};

// INDEX - categoria vini più venduti
const indexPiuVenduti = (req, res) => {
  const sql = `
   SELECT 
    p.*, 
    CONCAT('http://localhost:3000/wines/', p.img) AS img_url,
    c.category_name
  FROM products p
  JOIN mrk_categories c ON p.category_id = c.id
  WHERE c.id = 1
   `;
  connection.query(sql, (err, results) => {
    if (err) return handleFailQuery(err, res);
    res.json(results);
  });
};

// INDEX - categoria vini di primavera
const indexPrimavera = (req, res) => {
  const sql = `
   SELECT 
    p.*, 
    CONCAT('http://localhost:3000/wines/', p.img) AS img_url,
    c.category_name
  FROM products p
  JOIN mrk_categories c ON p.category_id = c.id
  WHERE c.id = 4
   `;
  connection.query(sql, (err, results) => {
    if (err) return handleFailQuery(err, res);
    res.json(results);
  });
};

// SHOW - ritorna il dettaglio di un singolo vino tramite slug
const show = (req, res) => {
  const { slug } = req.params;
  const sql = `
    SELECT *, 
    CONCAT('http://localhost:3000/wines/', img) AS img_url 
    FROM products 
    WHERE slug = ?
  `;
  connection.query(sql, [slug], (err, results) => {
    if (err) return handleFailQuery(err, res);
    const wine = results[0];
    if (!wine) return handleResourceNotFound(res);
    const wineResponse = {
      ...wine,
      is_available: wine.stock_quantity > 0,
      status_message:
        wine.stock_quantity > 0
          ? `Disponibilità: ${wine.stock_quantity} bottiglie`
          : "Prodotto attualmente esaurito",
    };
    res.json({ result: wineResponse });
  });
};

module.exports = {
  index,
  indexPromo,
  indexPremi,
  indexPiuVenduti,
  indexPrimavera,
  show,
};
