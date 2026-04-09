require("dotenv").config();
const express = require("express");
const app = express();

// imports
const winesRouter = require("./Routers/wines");
const ordersRouter = require("./Routers/orders");
const emailRouter = require("./Routers/email");
const searchRouter = require("./Routers/search");
const paypalRouter = require("./Routers/paypal");

// middlewares
const cors = require("cors");
app.use(express.static("public"));
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Routers
app.use("/vini", winesRouter);
app.use("/ordini", ordersRouter);
app.use("/email", emailRouter);
app.use("/cerca", searchRouter);
app.use("/paypal", paypalRouter);

// Error Handling
const errorMiddlewares = require("./middlewares/errorsHandler");
app.use(errorMiddlewares.error404);
app.use(errorMiddlewares.error500);

app.listen(process.env.APP_PORT, () => {
  console.log("server listening");
});
