const connection = require("../connections/connDb");

const { handleFailQuery, handleResourceNotFound } = require("../utils/dbUtils");


const searchSql = (req, res) => {
  const { search, type, winery, grape, minPrice, maxPrice } = req.query;


  //mando direttamente il prezzo finale gia calcolato

  let sql = `
  SELECT 
    *,
    COALESCE(promotion_price, price) AS final_price 
  FROM products 
  WHERE 1=1
`;
  const params = [];

  // cerco il termine search su più campi
  if (search) {
    sql += ` AND (
      product_name LIKE ? OR 
      description LIKE ? OR 
      winery LIKE ? OR 
      grape LIKE ?
    )`;

    //cerco tutti i prodotti che hanno la parola inserita
    const searchTerm = `%${search}%`;
    params.push(
      searchTerm, //product_name
      searchTerm, //description
      searchTerm, //winery
      searchTerm, //grape
    ); 
  }

  // filtro tipo (rosso, bianco, ecc.)
  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }

  // filtro cantina
  if (winery) {
    sql += " AND winery LIKE ?";
    params.push(`%${winery}%`);
  }

  // filtro vitigno
  if (grape) {
    sql += " AND grape LIKE ?";
    params.push(`%${grape}%`);
  }

  //  prezzo minimo (considera anche promotion_price)(COALESCE = prende il PRIMO valore NOT NULL tra quelli che passiamo)
  if (minPrice) {
    sql += " AND COALESCE(promotion_price, price) >= ?";
    params.push(minPrice);
  }

  // prezzo massimo
  if (maxPrice) {
    sql += " AND COALESCE(promotion_price, price) <= ?";
    params.push(maxPrice);
  }

  // solo prodotti disponibili
  sql += " AND stock_quantity > 0";

  connection.query(sql, params, (err, results) => {
    if (err) return handleFailQuery(err, res);

    res.json({
      count: results.length,
      results,
    });
  });
};

module.exports = { searchSql };
