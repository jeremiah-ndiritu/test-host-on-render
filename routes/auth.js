const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const router = express.Router();

const { usersPath } = require("../index"); // JSON storage

// ===== REGISTER =====
router.post("/register", async (req, res) => {
  try {
    const { username, phonenumber, password } = req.body;

    if (!username || !phonenumber || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    let users = [];
    if (fs.existsSync(usersPath)) {
      const raw = fs.readFileSync(usersPath, "utf-8");
      if (raw) users = JSON.parse(raw);
    }

    // Check if phonenumber already exists
    if (users.find((u) => u.phonenumber === phonenumber)) {
      return res
        .status(400)
        .json({ success: false, error: "Phone number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      username,
      phonenumber,
      password: hashedPassword,
      dateRegistered: new Date().toISOString(),
    };

    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.json({
      success: true,
      message: `You have registered successfully!`,
      user: { id: newUser.id, username, phonenumber },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const { phonenumber, password } = req.body;

    if (!phonenumber || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Phone number and password required" });
    }

    if (!fs.existsSync(usersPath)) {
      return res
        .status(400)
        .json({ success: false, error: "No users registered" });
    }

    const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
    const user = users.find((u) => u.phonenumber === phonenumber);

    if (!user) {
      return res.status(400).json({ success: false, error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid password" });
    }

    // Return user info without password
    const { password: pwd, ...userData } = user;
    res.json({ success: true, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
