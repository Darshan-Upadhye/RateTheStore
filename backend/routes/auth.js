const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

router.post("/signup", async (req, res) => {
  const { name, email, password, address, role } = req.body;
  try {
    const userExist = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userExist.rows.length > 0) 
      return res.status(400).json({ msg: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, email, hashedPassword, address, role]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) 
      return res.status(400).json({ msg: "Invalid credentials" });

    const validPass = await bcrypt.compare(password, user.rows[0].password);
    if (!validPass) 
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: user.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
