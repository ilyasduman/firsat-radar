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
app.get("/listings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM listings
      ORDER BY opportunity_score DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
app.post("/listings", async (req, res) => {
  try {
    const {
      title,
      city,
      district,
      neighborhood,
      price,
      gross_m2,
      net_m2,
      room_count,
      building_age,
      floor_info,
      elevator,
      url,
      source,
      discount_percent,
      opportunity_score,
      status
    } = req.body;

    if (!title || !city || !district || !price) {
      return res.status(400).json({
        success: false,
        error: "title, city, district ve price zorunlu"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO listings (
        title,
        city,
        district,
        neighborhood,
        price,
        gross_m2,
        net_m2,
        room_count,
        building_age,
        floor_info,
        elevator,
        url,
        source,
        discount_percent,
        opportunity_score,
        status
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      )
      RETURNING *
      `,
      [
        title,
        city,
        district,
        neighborhood,
        price,
        gross_m2,
        net_m2,
        room_count,
        building_age,
        floor_info,
        elevator,
        url,
        source || "Manuel",
        discount_percent || 0,
        opportunity_score || 0,
        status || "active"
      ]
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
