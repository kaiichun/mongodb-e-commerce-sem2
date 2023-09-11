const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// middleware to handle JSON request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = 8880;

// setup cors
const corsHandler = cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
  preflightContinue: true,
});

app.use(corsHandler);

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/ecommerce")
  .then(() => console.log("MongoDB Connected or not ... "))
  .catch((err) => console.log(err));

// routes
const orderRouter = require("./routes/order");
const productRouter = require("./routes/product");

app.use("/orders", orderRouter);
app.use("/products", productRouter);

app.get("/", (request, response) => {
  response.send("E-Commerce");
});

// Server listening
app.listen(port, () => console.log(`Server started on port ${port}`));
