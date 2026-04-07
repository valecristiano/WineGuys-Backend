const connection = require("../connections/connDb");

//dati spedizione
const shippingFee = 7.9;
const shippingFreeSpend = 60.0;

//POST - Checkout
function postCheckout(req, res) {
  //prendo i dati dalla request - cart_items è l'array dei prodotti che sono nell'ordine
  const { customer, cart_items, discount_code } = req.body;

  //validazione dati
  if (!customer.first_name || !customer.second_name || !customer.email || !customer.cellphone || !customer.billing_street || !customer.billing_city || !customer.billing_postal_code) {
    return res.status(400).json({ success: false, message: "Dati cliente incompleti o mancanti." });
  }

  //CONTROLLO QUANTITà INIZIALE
  //se non arriva l'array dei prodotti o è vuoto do errore
  if (!cart_items || cart_items.length === 0) {
    return res.json({ success: false, message: "Il carrello è vuoto" });
  }

  // mappo gli id dei prodotti in cart_items
  const productIds = cart_items.map((item) => item.product_id);

  //seleziono i dati dei prodotti in cart_items tramite id
  const sqlCheck = `SELECT id, product_name, stock_quantity, price, promotion_price FROM products WHERE id IN (?)`;

  //query di controllo delle quantità dei prodotti
  connection.query(sqlCheck, [productIds], (err, winesList) => {
    if (err) return res.status(500).json({ success: false, message: "Errore controllo stock", error: err.sqlMessage });

    //calcolo prezzo e controllo stock
    let serverTotal = 0;
    const validatedItems = [];

    //verifichiamo lo stock di ogni prodotto nel carrello
    for (const item of cart_items) {
      const wine = winesList.find((product) => product.id === item.product_id);

      if (!wine || wine.stock_quantity < item.quantity) {
        return res.status(400).json({
          message: `Stock insufficiente per ${wine ? wine.product_name : "ID " + item.product_id}`,
        });
      }
      // prendo il prezzo (promo o normale) dal DB
      const realPrice = wine.promotion_price !== null ? wine.promotion_price : wine.price;

      // calcolo totale in base alle quantità
      serverTotal += realPrice * item.quantity;

      // salvo i dati validati in validatedItems
      validatedItems.push({
        ...item,
        price: realPrice,
      });
    }

    //CONTROLLO PRESENZA COUPON
    let finalPrice = serverTotal;

    //se è stato inserito un codice sconto
    if (discount_code) {
      //selezioniamo i dati del coupon inserito
      const sqlCoupon = `SELECT * FROM coupons WHERE discount_code = ? AND valid = 1`;

      //query per validare coupon e calcolare prezzo scontato
      connection.query(sqlCoupon, [discount_code], (err, couponResults) => {
        if (err) return res.status(500).json({ success: false, message: "Errore coupon" });

        const coupon = couponResults[0];
        const now = new Date();

        // Validazione coupon
        if (!coupon) {
          return res.status(400).json({ message: "Codice sconto non esistente o non valido" });
        }
        if (now < new Date(coupon.start_date) || now > new Date(coupon.end_date)) {
          return res.status(400).json({ message: "Codice sconto scaduto" });
        }
        if (serverTotal < coupon.min_spending) {
          return res.status(400).json({ message: `Spesa minima dello sconto non raggiunta (${coupon.min_spending}€)` });
        }

        // calcolo il prezzo finale scontato
        finalPrice = serverTotal * (1 - parseFloat(coupon.discount_value));

        // Proseguiamo con il prezzo scontato
        startInsertion(finalPrice, validatedItems);
      });
    } else {
      // Se non c'è coupon, proseguiamo col prezzo originale
      startInsertion(finalPrice, validatedItems);
    }

    //INSERIMENTO CLIENTE E ORDINE
    function startInsertion(price, itemsForCart) {
      //controllo spese di spedizione gratuite
      const finalShippingFee = price >= shippingFreeSpend ? 0 : shippingFee;

      //inserisco il CLIENTE
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
        if (err) return res.status(500).json({ success: false, message: "Errore inserimento cliente", error: err.sqlMessage });

        //recupero l'id del nuovo cliente assegnato da workbench
        const customerId = customerResult.insertId;

        //inserisco l'ORDINE
        const sqlOrder = `INSERT INTO orders (customer_id, date, total_price, status, shipping_fee) VALUES (?, NOW(), ?, 'pending', ?);`;

        //query di ricezione dati dell'ordine
        connection.query(sqlOrder, [customerId, price, finalShippingFee || 0], (err, orderResult) => {
          if (err) return res.status(500).json({ success: false, message: "Errore inserimento ordine", error: err.sqlMessage });

          //recupero l'id del nuovo ordine assegnato da workbench
          const orderId = orderResult.insertId;

          //variabile contatore per controllare il ciclo sull'array dei prodotti acquistati
          let wineUnit = 0;
          //switch per evitare errore per doppia risposta
          let errorSent = false;

          //ciclo di query sui singoli prodotti acqistati
          itemsForCart.forEach((wine) => {
            //inserisco il vino nella tabella orders_products
            const sqlCartItem = `INSERT INTO orders_products (order_id, product_id, quantity, current_price) VALUES (?, ?, ?, ?)`;

            // query di ricezione dati sul vino
            connection.query(sqlCartItem, [orderId, wine.product_id, wine.quantity, wine.price], (err) => {
              if (err && !errorSent) {
                errorSent = true;
                return res.status(500).json({ success: false, message: "Errore inserimento ordine", error: err.sqlMessage });
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
                  return res.status(500).json({ success: false, message: "Errore aggiornamento quantità", error: err.sqlMessage });
                }
                if (result.affectedRows === 0 && !errorSent) {
                  errorSent = true;
                  return res.status(400).json({ success: false, message: `Quantità insufficiente per il prodotto ${wine.product_name}` });
                }

                // aumento il contatore se l'inserimento del vino è andata a buon fine
                wineUnit++;

                // rispondo solo quando il contatore corrisponde al numero di prodotti nell'ordine
                if (wineUnit === cart_items.length && !errorSent) {
                  res.json({
                    success: true,
                    message: "Ordine completato con successo!",
                    newCustomerId: customerId,
                    order_summary: {
                      newOrderId: orderId,
                      total: price.toFixed(2),
                      shipping: finalShippingFee.toFixed(2),
                      final_total: (price + finalShippingFee).toFixed(2),
                    },
                  });
                }
              });
            });
          });
        });
      });
    }
  });
}
//POST - Coupon
function validateCoupon(req, res) {
  const { discount_code, total_amount } = req.body;

  if (!discount_code) {
    return res.status(400).json({ success: false, message: "Inserisci un codice" });
  }

  const sqlCoupon = `SELECT * FROM coupons WHERE discount_code = ? AND valid = 1`;

  connection.query(sqlCoupon, [discount_code], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Errore database" });

    const coupon = results[0];
    const now = new Date();

    // controllo esistenza codice
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Codice sconto non esistente o non valido" });
    }

    // controllo validità
    if (now < new Date(coupon.start_date) || now > new Date(coupon.end_date)) {
      return res.status(400).json({ success: false, message: "Codice sconto scaduto o non ancora attivo" });
    }

    // controllo pesa minima
    if (total_amount < coupon.min_spending) {
      return res.status(400).json({
        success: false,
        message: `Spesa minima per lo sconto non raggiunta. Aggiungi ${(coupon.min_spending - total_amount).toFixed(2)}€ per usare questo codice.`,
      });
    }

    res.json({
      success: true,
      message: "Codice applicato!",
      coupon: {
        discount_code: coupon.discount_code,
        discount_value: coupon.discount_value,
      },
    });
  });
}

module.exports = { postCheckout, validateCoupon };
