require("dotenv").config();
const express = require("express");
const app = express();



// imports 
const winesRouter = require("./Routers/wines");

// middlewares
const cors = require("cors");
app.use(express.static("public"));
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());


// Routers
app.use("/vini", winesRouter);

// Error Handling
const errorMiddlewares = require("./middlewares/errorsHandler");
app.use(errorMiddlewares.error404);
app.use(errorMiddlewares.error500);



app.listen(process.env.APP_PORT, () => {
  console.log(
    "server listening on " + process.env.APP_URL + ":" + process.env.APP_PORT
  );
});
