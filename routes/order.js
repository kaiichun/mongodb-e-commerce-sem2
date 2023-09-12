const express = require("express");
const router = express.Router();

const Order = require("../models/order");

router.get("/", async (request, response) => {
  try {
    const { status } = request.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }
    response.status(200).send(await Order.find(filter).populate("products"));
  } catch (error) {
    response.status(400).send({ message: "Order not found" });
  }
});

router.get("/:id", async (request, response) => {
  try {
    const data = await Order.findOne({ _id: request.params.id });
    response.status(200).send(data);
  } catch (error) {
    response.status(400).send({ message: "Order not found" });
  }
});

router.post("/", async (request, response) => {
  try {
    const newOrder = new Order({
      customerName: request.body.customerName,
      customerEmail: request.body.customerEmail,
      products: request.body.products,
      totalPrice: request.body.totalPrice,
      status: request.body.status,
    });

    await newOrder.save();
    response.status(200).send(newOrder);
  } catch (error) {
    response.status(400).send({ message: error._message });
  }
});

router.put("/:id", async (request, response) => {
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

router.delete("/:id", async (request, response) => {
  try {
    const order_id = request.params.id;

    const deleteOrder = await Order.findByIdAndDelete(order_id);
    response.status(200).send(deleteOrder);
  } catch (error) {
    response.status(400).send({ message: error._message });
  }
});

module.exports = router;
