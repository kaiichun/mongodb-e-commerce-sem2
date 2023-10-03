const express = require("express");
const axios = require("axios");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Order = require("../models/order");
const User = require("../models/user");

const {
  BILLPLZ_API_URL,
  BILLPLZ_API_KEY,
  BILLPLZ_COLLECTION_ID,
  JWT_SECRET,
} = require("../config");

const authMiddleware = require("../middleware/auth");
const isAdminMiddleware = require("../middleware/isAdmin");

router.get("/", authMiddleware, async (request, response) => {
  try {
    const token = request.headers.authorization.replace("Bearer ", "");
    const { status } = request.query;
    let filter = {};

    // decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // find user by _id
    const user = await User.findOne({ _id: decoded._id });

    if (status) {
      filter.status = status;
    }

    console.log(request.user);

    // only user will have this filter
    if (request.user && request.user.role === "user") {
      filter.customerEmail = request.user.email;
    }

    response
      .status(200)
      .send(await Order.find(filter).populate("products").sort({ _id: -1 }));
  } catch (error) {
    response.status(400).send({ message: "Order not found" });
  }
});

router.get("/:id", authMiddleware, async (request, response) => {
  try {
    const data = await Order.findOne({ _id: request.params.id });
    response.status(200).send(data);
  } catch (error) {
    response.status(400).send({ message: "Order not found" });
  }
});

router.post("/", async (request, response) => {
  try {
    // call the billplz API to create a bill
    const billplz = await axios({
      method: "POST",
      url: BILLPLZ_API_URL + "v3/bills",
      auth: {
        username: BILLPLZ_API_KEY,
        password: "",
      },
      data: {
        collection_id: BILLPLZ_COLLECTION_ID,
        email: request.body.customerEmail,
        name: request.body.customerName,
        amount: parseFloat(request.body.totalPrice) * 100,
        description: request.body.description,
        callback_url: "http://localhost:3000/verify-payment",
        redirect_url: "http://localhost:3000/verify-payment",
      },
    });
    // create order in database
    const newOrder = new Order({
      customerName: request.body.customerName,
      customerEmail: request.body.customerEmail,
      products: request.body.products,
      totalPrice: request.body.totalPrice,
      // store the billplz ID in our order
      billplz_id: billplz.data.id,
    });

    await newOrder.save();
    // return the billplz data
    response.status(200).send(billplz.data);
  } catch (error) {
    response.status(400).send({
      message: error._message
        ? error._message
        : error.response.data.error.message[0],
    });
  }
});

router.put("/:id", isAdminMiddleware, async (request, response) => {
  try {
    const order_id = request.params.id;

    const updatedOrder = await Order.findByIdAndUpdate(order_id, request.body, {
      new: true,
    });
    response.status(200).send(updatedOrder);
  } catch (error) {
    response.status(400).send({ message: error._message });
  }
});

router.delete("/:id", isAdminMiddleware, async (request, response) => {
  try {
    const order_id = request.params.id;

    const deleteOrder = await Order.findByIdAndDelete(order_id);
    response.status(200).send(deleteOrder);
  } catch (error) {
    response.status(400).send({ message: error._message });
  }
});

module.exports = router;
