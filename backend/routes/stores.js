const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all stores with their ratings
router.get("/", async (req, res) => {
  try {
    const storesResult = await pool.query("SELECT * FROM stores");
    const stores = storesResult.rows;

    // For each store, fetch its ratings
    for (let store of stores) {
      const ratingsResult = await pool.query(
        "SELECT user_id AS \"userId\", rating FROM ratings WHERE store_id = $1",
        [store.id]
      );
      store.ratings = ratingsResult.rows || [];
    }

    res.json(stores);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add new store
router.post("/", async (req, res) => {
  const { owner_id, name, email, address } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO stores (owner_id, name, email, address) VALUES ($1, $2, $3, $4) RETURNING *",
      [owner_id || null, name, email, address]
    );
    const newStore = result.rows[0];
    newStore.ratings = [];
    res.status(201).json(newStore);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update store details (optional)
router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, address } = req.body;

  try {
    const result = await pool.query(
      "UPDATE stores SET name=$1, email=$2, address=$3 WHERE id=$4 RETURNING *",
      [name, email, address, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Store not found" });

    // Fetch updated ratings
    const ratingsResult = await pool.query(
      "SELECT user_id AS \"userId\", rating FROM ratings WHERE store_id = $1",
      [id]
    );
    const store = result.rows[0];
    store.ratings = ratingsResult.rows || [];

    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add or update rating for a store by a user
router.patch("/:id/ratings", async (req, res) => {
  const store_id = req.params.id;
  const { userId, rating } = req.body;

  try {
    // Check if rating exists for this user and store
    const existingRes = await pool.query(
      "SELECT id FROM ratings WHERE store_id=$1 AND user_id=$2",
      [store_id, userId]
    );

    if (existingRes.rows.length > 0) {
      // Update existing rating
      await pool.query(
        "UPDATE ratings SET rating=$1 WHERE store_id=$2 AND user_id=$3",
        [rating, store_id, userId]
      );
    } else {
      // Insert new rating
      await pool.query(
        "INSERT INTO ratings (store_id, user_id, rating) VALUES ($1, $2, $3)",
        [store_id, userId, rating]
      );
    }

    // Return updated store info with ratings
    const storeRes = await pool.query("SELECT * FROM stores WHERE id = $1", [store_id]);
    if (storeRes.rows.length === 0) return res.status(404).json({ error: "Store not found" });

    const ratingsRes = await pool.query(
      "SELECT user_id AS \"userId\", rating FROM ratings WHERE store_id = $1",
      [store_id]
    );

    const store = storeRes.rows[0];
    store.ratings = ratingsRes.rows || [];

    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
