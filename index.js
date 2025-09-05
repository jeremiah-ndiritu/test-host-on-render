require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
let PORT = process.env.PORT || 8082;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "homePage.html"));
});

app.get("/api/names", (req, res) => {
  let names = ["Jeremiah", "Ndiritu", "Kiricu"];
  res.json({ names });
});

app.listen(PORT, () => {
  console.log(`running on http://localhost:${PORT}`);
});
