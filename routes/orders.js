const express = require("express");
const router = express.Router();
const fs = require("fs");

const { ordersPath, productsPath } = require("../index");

// Get all orders
router.get("/orders", (req, res) => {
  try {
    let result = [];
    if (!fs.existsSync(ordersPath)) {
      return res.json({ orders: [] });
    }
    result = fs.readFileSync(ordersPath);
    result = JSON.parse(result);
    if (!result) {
      return res.json({ orders: [] });
    }
    res.json({ orders: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// add new order
router.post("/add-order", (req, res) => {
  try {
    const { product, quantity, price } = req.body;
    if (!product || !quantity || !price) {
      return res.json({ success: false, error: "All fields required!" });
    }

    let order = {
      product,
      quantity: Number(quantity),
      price: Number(price),
      total: Number(price) * Number(quantity),
      timestamp: new Date().toISOString(),
    };

    let existing = [];
    if (fs.existsSync(ordersPath)) {
      let raw = fs.readFileSync(ordersPath, "utf-8");
      if (raw) existing = JSON.parse(raw);
    }

    existing.push(order);
    fs.writeFileSync(ordersPath, JSON.stringify(existing, null, 2));

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
