const express = require("express");
const router = express.Router();
const pool = require("../db");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.use(verifyToken);
router.use(isAdmin);

router.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role FROM users");
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/stores", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stores");
    res.json({ success: true, stores: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/users", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, password, role]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/stores", async (req, res) => {
  const { name, location, owner_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO stores (name, location, owner_id) VALUES ($1, $2, $3) RETURNING *",
      [name, location, owner_id]
    );
    res.json({ success: true, store: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/stores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM stores WHERE id = $1", [id]);
    res.json({ success: true, message: "Store deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
