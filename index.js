require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const { Product } = require("./classes");
const { upload } = require("./storage_setup");

const app = express();
app.use(cors());
let PORT = process.env.PORT || 8082;

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "homePage.html"));
});

app.get("/api/names", (req, res) => {
  let names = ["Jeremiah", "Ndiritu", "Kiricu"];
  res.json({ names });
});

// storage paths
let productsPath = path.join(__dirname, "storage", "products.json");
let ordersPath = path.join(__dirname, "storage", "orders.json");

// =============================
// PRODUCTS
// =============================

// Add new product with image
app.post("/api/add-product", upload.single("image"), (req, res) => {
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

    let cProduct = new Product(name, price, discount, imagePath);

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

// Get all products
app.get("/api/products", (req, res) => {
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

// =============================
// ORDERS
// =============================

// Get all orders
app.get("/api/orders", (req, res) => {
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
app.post("/api/add-order", (req, res) => {
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

// get stats
app.get("/api/stats", (req, res) => {
  let orders = [];
  if (fs.existsSync(ordersPath)) {
    let raw = fs.readFileSync(ordersPath, "utf-8");
    if (raw) orders = JSON.parse(raw);
  }

  let totalRevenue = 0;
  let totalOrders = orders.length;
  let productSales = {};

  orders.forEach((o) => {
    totalRevenue += o.total;
    if (!productSales[o.product]) productSales[o.product] = 0;
    productSales[o.product] += o.total;
  });

  res.json({
    totalOrders,
    totalRevenue,
    productSales,
  });
});

app.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
});
