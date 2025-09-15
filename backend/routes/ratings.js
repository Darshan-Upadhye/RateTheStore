const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
  const { user_id, store_id, rating } = req.body;
  try {
    const exist = await pool.query("SELECT * FROM ratings WHERE user_id=$1 AND store_id=$2", [user_id, store_id]);
    if (exist.rows.length > 0) {
      await pool.query("UPDATE ratings SET rating=$1 WHERE user_id=$2 AND store_id=$3", [rating, user_id, store_id]);
      return res.json({ msg: "Rating updated" });
    }
    const newRating = await pool.query(
      "INSERT INTO ratings (user_id, store_id, rating) VALUES ($1,$2,$3) RETURNING *",
      [user_id, store_id, rating]
    );
    res.json(newRating.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:store_id", async (req, res) => {
  const { store_id } = req.params;
  try {
    const ratings = await pool.query("SELECT r.*, u.name, u.email FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id=$1", [store_id]);
    res.json(ratings.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
