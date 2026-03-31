const connection = require("../connections/connDb");

function postCheckout(req, res) {
  //prendo i dati dalla request
  const { customer, total_price, shipping_fee } = req.body;

  //inserisco il cliente
  const sqlCustomer = `INSERT INTO customers 
    (first_name, second_name, email, cellphone, 
     billing_street, billing_city, billing_postal_code, billing_country,
     shipping_street, shipping_city, shipping_postal_code, shpping_country) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

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

  connection.query(sqlCustomer, customerValues, (err, customerResult) => {
    if (err) return res.status(500).json({ message: "Errore inserimento cliente", error: err.sqlMessage });

    const customerId = customerResult.insertId;

    //inserisco ordine

    const sqlOrder = `INSERT INTO orders (customer_id, date, total_price, status, shipping_fee) VALUES (?, NOW(), ?, 'pending',?);`;

    connection.query(sqlOrder, [customerId, total_price, shipping_fee || 0], (err, orderResult) => {
      if (err) return res.status(500).json({ message: "Errore inserimento ordine", error: err.sqlMessage });

      const orderId = orderResult.insertId;

      res.json({
        success: true,
        message: "Record aggiunti",
        newCustomerId: customerId,
        newOrderId: orderId,
      });
    });
  });
}
module.exports = { postCheckout };
