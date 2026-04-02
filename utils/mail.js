const nodemailer = require("nodemailer");

// crea il trasportatore colle credenziali gmail
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// funzione per mandare l'email di conferma ordine
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

module.exports = { sendOrderConfirmation };
