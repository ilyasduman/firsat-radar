const pool = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    project: "Firsat Radar"
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend aktif"
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      time: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/opportunities", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM opportunities
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
app.post("/opportunities", async (req, res) => {
  try {
    const { title, company, city, url, source } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "title zorunlu"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO opportunities (title, company, city, url, source)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [title, company, city, url, source]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
