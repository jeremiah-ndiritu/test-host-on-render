const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const { Product } = require("../classes");
const { upload } = require("../storage_setup");

const { ordersPath, productsPath } = require("../index");

// Get all products
router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(productsPath)) {
      return res.json({ products: [] });
    }
    let result = fs.readFileSync(productsPath);
    result = JSON.parse(result);
    result = result.filter((rp) => rp.name && rp.price);

    console.log("result :>> ", result);
    res.json({ products: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add new product with image
router.post("/api/add-product", upload.single("image"), (req, res) => {
  try {
    const { name, price, discount } = req.body;

    if (!name)
      return res.json({ success: false, error: "Product name required!" });
    if (!price)
      return res.json({ success: false, error: "Product price required!" });

    // if image was uploaded
    let imagePath = null;
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename; // static URL
    }

    // Add id and dateAdded
    const id = Date.now().toString(); // unique id based on timestamp
    const dateAdded = new Date().toISOString();

    let cProduct = new Product(name, price, discount, imagePath);
    cProduct.id = id;
    cProduct.dateAdded = dateAdded;

    // read file safely
    let existing = [];
    if (fs.existsSync(productsPath)) {
      let raw = fs.readFileSync(productsPath, "utf-8");
      if (raw) existing = JSON.parse(raw);
    }

    existing.push(cProduct);

    fs.writeFileSync(productsPath, JSON.stringify(existing, null, 2));

    return res.json({ success: true, product: cProduct });
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE a product by ID or name
router.delete("/delete-product/:id", (req, res) => {
  try {
    const { id } = req.params; // can be product ID or name
    if (!fs.existsSync(productsPath)) {
      return res
        .status(404)
        .json({ success: false, error: "No products found" });
    }

    let products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
    const initialLength = products.length;

    // Remove the product matching the id
    products = products.filter((p) => p.id !== id);

    if (products.length === initialLength) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
