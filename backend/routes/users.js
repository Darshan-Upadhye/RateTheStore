const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all users (Admin)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, address, role FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new user
router.post("/", async (req, res) => {
  const { name, email, password, address, role } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role`,
      [name, email, password, address, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { name, email, password, address, role } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role`,
      [name, email, password, address, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add user error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update password
router.patch("/:id/password", async (req, res) => {
  const id = req.params.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const userRes = await pool.query("SELECT password FROM users WHERE id=$1", [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const storedPassword = userRes.rows[0].password;
    // Since you said auth is done, assuming plain for now - replace with hashed pw checks if needed
    if (storedPassword !== currentPassword) return res.status(400).json({ error: "Current password incorrect" });

    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [newPassword, id]);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
