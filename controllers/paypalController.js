const paypal = require("@paypal/paypal-server-sdk");

// configura il client PayPal con le credenziali dalla sandbox
// in produzione si cambia Environment.Sandbox con Environment.Production
const client = new paypal.Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: process.env.PAYPAL_CLIENT_ID,
    oAuthClientSecret: process.env.PAYPAL_SECRET,
  },
  environment:
    process.env.PAYPAL_MODE === "sandbox"
      ? paypal.Environment.Sandbox
      : paypal.Environment.Production,
});

// istanza del controller degli ordini PayPal
const ordersController = new paypal.OrdersController(client);

// crea un ordine PayPal con il totale ricevuto dal frontend
const createOrder = async (req, res) => {
  const { total_price } = req.body;

  try {
    const { result } = await ordersController.createOrder({
      body: {
        intent: "CAPTURE",
        purchaseUnits: [
          {
            amount: {
              currencyCode: "EUR",
              value: total_price,
            },
          },
        ],
      },
    });

    // manda l'id dell'ordine PayPal al frontend
    res.json({ id: result.id });
  } catch (error) {
    console.error("Errore creazione ordine PayPal:", error);
    res
      .status(500)
      .json({ success: false, message: "Errore creazione ordine PayPal" });
  }
};

// cattura il pagamento dopo che il cliente ha approvato su PayPal
const captureOrder = async (req, res) => {
  const { orderID } = req.params;

  try {
    const { result } = await ordersController.captureOrder({
      id: orderID,
    });

    // manda la conferma del pagamento al frontend
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Errore cattura pagamento PayPal:", error);
    res
      .status(500)
      .json({ success: false, message: "Errore cattura pagamento PayPal" });
  }
};

module.exports = { createOrder, captureOrder };
