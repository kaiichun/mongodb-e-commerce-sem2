const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const Order = require("../models/order");
const { BILLPLZ_X_SIGNATURE } = require("../config");

// payment verification route
router.post("/", async (request, response) => {
  try {
    const billplz_id = request.body.billplz_id;
    const billplz_paid = request.body.billplz_paid;
    const billplz_paid_at = request.body.billplz_paid_at;
    const billplz_x_signature = request.body.billplz_x_signature;
    // verify the signature
    const billplz_string = `billplzid${billplz_id}|billplzpaid_at${billplz_paid_at}|billplzpaid${billplz_paid}`;
    const x_signature = crypto
      .createHmac(`sha256`, BILLPLZ_X_SIGNATURE)
      .update(billplz_string)
      .digest("hex");
    // compare signature
    if (billplz_x_signature !== x_signature) {
      response.status(400).send({ message: "Signature not valid" });
    }
    // signature is correct, then we proceed
    // find order by using the billplz_id
    const order = await Order.findOne({ billplz_id: billplz_id });

    // if order not found, return error
    if (!order) {
      response.status(400).send({ message: "Order not found" });
    }
    // if order is found, update the order status to paid
    order.status = billplz_paid === "true" ? "Paid" : "Failed";
    // when payment is made
    order.paid_at = billplz_paid_at;
    // save the order
    const newOrder = await order.save();
    // return the updated order
    response.status(200).send(newOrder);
  } catch (error) {
    console.log(error);
    response.status(400).send({ message: error._message });
  }
});

module.exports = router;
