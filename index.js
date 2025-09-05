require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
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
let usersPath = path.join(__dirname, "storage", "users.json");
module.exports = { productsPath, ordersPath, usersPath };

//routes
const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");

app.use("/api", productsRouter);
app.use("/api", ordersRouter);
app.use("/auth", authRouter);

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
