const nodemailer = require("nodemailer");

// crea il trasportatore con le credenziali Mailtrap per i test
// Mailtrap è un servizio che simula una casella email reale senza mandare email vere
// in produzione si può sostituire con Gmail cambiando solo host, port, user e pass
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// funzione per mandare l'email di conferma ordine al cliente
// viene chiamata dal orderController dopo che l'ordine è stato salvato nel database
// riceve i dati dell'ordine e manda una email al cliente con il riepilogo completo
// così il cliente sa esattamente cosa ha comprato, quanto ha pagato e dove verrà spedito
const sendOrderConfirmation = async (orderData) => {
  const { customer, cart_items, total_price, shipping_fee } = orderData;

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: customer.email,
    subject: "Conferma ordine WineGuys 🍷",
    html: `
        <h1>Grazie per il tuo ordine, ${customer.first_name}!</h1>
        <p>Il tuo ordine è stato ricevuto con successo.</p>
        <h2>Riepilogo ordine:</h2>
        <ul>
            ${cart_items
              .map(
                (item) =>
                  `<li>
            Prodotto ID: ${item.product_id} - Quantità: ${item.quantity} - Prezzo: €${item.price} 
            </li>`
              )
              .join("")}
        </ul>
        <p><strong>Totale: €${total_price}</strong></p>
        <p>Spese di spedizione: €${shipping_fee}</p>
        <p>Indirizzo di spedizione: ${customer.shipping_street}, ${
      customer.shipping_city
    }</p>
        <br>
        <p>Il team WineGuys 🍷</p>`,
  };

  await transporter.sendMail(mailOptions);
};

// funzione per mandare l'email di notifica nuovo ordine al gestore di WineGuys
// viene chiamata insieme a sendOrderConfirmation ogni volta che arriva un nuovo ordine
// serve per avvisare il gestore che deve preparare e spedire i prodotti ordinati
// contiene tutti i dati del cliente e i prodotti ordinati per facilitare la gestione
const sendOwnerNotification = async (orderData) => {
  const { customer, cart_items, total_price, shipping_fee } = orderData;

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_OWNER,
    subject: "Nuovo ordine ricevuto! 🍷",
    html: `
        <h1>Hai ricevuto un nuovo ordine!</h1>
        <h2>Dati del cliente:</h2>
        <p>Nome: ${customer.first_name} ${customer.second_name}</p>
        <p>Email: ${customer.email}</p>
        <p>Telefono: ${customer.cellphone}</p>
        <p>Indirizzo di spedizione: ${customer.shipping_street}, ${
      customer.shipping_city
    }, ${customer.shipping_postal_code}</p>
        <h2>Prodotti ordinati:</h2>
        <ul>
            ${cart_items
              .map(
                (item) =>
                  `<li>
            Prodotto ID: ${item.product_id} - Quantità: ${item.quantity} - Prezzo: €${item.price}
            </li>`
              )
              .join("")}
        </ul>
        <p><strong>Totale ordine: €${total_price}</strong></p>
        <p>Spese di spedizione: €${shipping_fee}</p>
        <br>
        <p>Il team WineGuys 🍷</p>`,
  };

  await transporter.sendMail(mailOptions);
};

// esportiamo le due funzioni per usarle nel orderController
module.exports = { sendOrderConfirmation, sendOwnerNotification };
