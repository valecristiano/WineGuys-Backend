const connection = require("../connections/connDb");

function postCheckout(req, res) {
  //prendo i dati dalla request - cart_items è l'array dei prodotti che sono nell'ordine
  const { customer, total_price, shipping_fee, cart_items } = req.body;

  //inserisco il cliente
  const sqlCustomer = `INSERT INTO customers 
    (first_name, second_name, email, cellphone, 
     billing_street, billing_city, billing_postal_code, billing_country,
     shipping_street, shipping_city, shipping_postal_code, shpping_country) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

  //dati sul cliente
  const customerValues = [
    customer.first_name,
    customer.second_name,
    customer.email,
    customer.cellphone,
    customer.billing_street,
    customer.billing_city,
    customer.billing_postal_code,
    customer.billing_country,
    customer.shipping_street,
    customer.shipping_city,
    customer.shipping_postal_code,
    customer.shpping_country,
  ];

  //query di ricezione dati cliente
  connection.query(sqlCustomer, customerValues, (err, customerResult) => {
    if (err) return res.status(500).json({ message: "Errore inserimento cliente", error: err.sqlMessage });

    //recupero l'id del nuovo cliente assegnato da workbench
    const customerId = customerResult.insertId;

    //inserisco l'ordine
    const sqlOrder = `INSERT INTO orders (customer_id, date, total_price, status, shipping_fee) VALUES (?, NOW(), ?, 'pending', ?);`;

    //query di ricezione dati dell'ordine
    connection.query(sqlOrder, [customerId, total_price, shipping_fee || 0], (err, orderResult) => {
      if (err) return res.status(500).json({ message: "Errore inserimento ordine", error: err.sqlMessage });

      //recupero l'id del nuovo ordine assegnato da workbench
      const orderId = orderResult.insertId;

      //se non arriva l'array dei prodotti o è vuoto evito errore
      if (!cart_items || cart_items.length === 0) {
        return res.json({ success: true, message: "Ordine creato senza prodotti", orderId });
      }

      //variabile contatore per controllare il ciclo sull'array dei prodotti acquistati
      let wineUnit = 0;
      //switch per evitare errore per doppia risposta
      let errorSent = false;

      //ciclo di query sui singoli prodotti acqistati
      cart_items.forEach((wine) => {
        //inserisco il vino nella tabella orders_products
        const sqlCartItem = `INSERT INTO orders_products (order_id, product_id, quantity, current_price) VALUES (?, ?, ?, ?)`;

        // query di ricezione dati sul vino
        connection.query(sqlCartItem, [orderId, wine.product_id, wine.quantity, wine.price], (err) => {
          if (err && !errorSent) {
            errorSent = true;
            return res.status(500).json({ message: "Errore inserimento ordine", error: err.sqlMessage });
          }

          //elimino la quantità venduta dalla colonna stock_quantity del singolo vino
          const sqlUpdateStock = `
          UPDATE products 
          SET stock_quantity = stock_quantity - ? 
          WHERE id = ? 
          AND stock_quantity >= ? `;
          //query eliminazione quantità
          connection.query(sqlUpdateStock, [wine.quantity, wine.product_id, wine.quantity], (err, result) => {
            if (err && !errorSent) {
              errorSent = true;
              return res.status(500).json({ message: "Errore aggiornamento quantità", error: err.sqlMessage });
            }
            if (result.affectedRows === 0 && !errorSent) {
              errorSent = true;
              return res.status(400).json({ message: `Quantità insufficiente per il prodotto ${wine.product_name}` });
            }
          });

          // aumento il contatore se l'inserimento del vino è andata a buon fine
          wineUnit++;

          // rispondo solo quando il contatore corrisponde al numero di prodotti nell'ordine
          if (wineUnit === cart_items.length && !errorSent) {
            res.json({
              success: true,
              message: "Ordine completato con successo!",
              newCustomerId: customerId,
              newOrderId: orderId,
            });
          }
        });
      });
    });
  });
}

module.exports = { postCheckout };
