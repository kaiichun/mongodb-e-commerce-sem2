const express = require("express");
const router = express.Router();

const Product = require("../models/product");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const authMiddleware = require("../middleware/auth");
const isAdminMiddleware = require("../middleware/isAdmin");

router.get("/", async (request, response) => {
  try {
    const { category } = request.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }

    response.status(200).send(await Product.find(filter).sort({ _id: -1 }));
  } catch (error) {
    response.status(400).send({ message: "Product not found" });
  }
});

router.get("/:id", async (request, response) => {
  try {
    const data = await Product.findOne({ _id: request.params.id });
    response.status(200).send(data);
  } catch (error) {
    response.status(400).send({ message: "Product ID not found" });
  }
});

router.post("/", isAdminMiddleware, async (request, response) => {
  try {
    const newProduct = new Product({
      name: request.body.name,
      description: request.body.description,
      price: request.body.price,
      category: request.body.category,
      image: request.body.image,
    });
    await newProduct.save();
    response.status(200).send(newProduct);
  } catch (error) {
    response.status(400).send({ message: error._message });
  }
});

router.put("/:id", isAdminMiddleware, async (request, response) => {
  try {
    const product_id = request.params.id;

    const updatedProduct = await Product.findByIdAndUpdate(
      product_id,
      request.body,
      {
        new: true,
      }
    );
    response.status(200).send(updatedProduct);
  } catch (error) {
    response.status(400).send({ message: error._message });
  }
});

router.delete("/:id", isAdminMiddleware, async (request, response) => {
  try {
    const product_id = request.params.id;
    const deletePro = await Product.findByIdAndDelete(product_id);
    response.status(200).send(deletePro);
  } catch (error) {
    response.status(400).send({ message: error._message });
  }
});

module.exports = router;
