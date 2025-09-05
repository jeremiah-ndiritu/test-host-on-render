require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
let PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "homePage.html"));
});

app.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
});
