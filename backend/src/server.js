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

app.get("/listings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM listings
      ORDER BY opportunity_score DESC, first_seen DESC
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
      listing_id,
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
        listing_id,
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
        status,
        last_seen
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW()
      )
      RETURNING *
      `,
      [
        listing_id || null,
        title,
        city,
        district,
        neighborhood,
        Number(price),
        gross_m2 ? Number(gross_m2) : null,
        net_m2 ? Number(net_m2) : null,
        room_count || null,
        building_age || null,
        floor_info || null,
        typeof elevator === "boolean" ? elevator : null,
        url || null,
        source || "Manuel",
        discount_percent ? Number(discount_percent) : 0,
        opportunity_score ? Number(opportunity_score) : 0,
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

app.post("/listings/bulk", async (req, res) => {
  try {
    const { listings } = req.body;

    if (!Array.isArray(listings)) {
      return res.status(400).json({
        success: false,
        error: "listings array zorunlu"
      });
    }

    const saved = [];

    for (const item of listings) {
      if (!item.title || !item.city || !item.district || !item.price) {
        continue;
      }

      const result = await pool.query(
        `
        INSERT INTO listings (
          listing_id,
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
          status,
          last_seen
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW()
        )
        RETURNING *
        `,
        [
          item.listing_id || null,
          item.title,
          item.city,
          item.district,
          item.neighborhood || null,
          Number(item.price),
          item.gross_m2 ? Number(item.gross_m2) : null,
          item.net_m2 ? Number(item.net_m2) : null,
          item.room_count || null,
          item.building_age || null,
          item.floor_info || null,
          typeof item.elevator === "boolean" ? item.elevator : null,
          item.url || null,
          item.source || "Sahibinden",
          item.discount_percent ? Number(item.discount_percent) : 0,
          item.opportunity_score ? Number(item.opportunity_score) : 0,
          item.status || "active"
        ]
      );

      saved.push(result.rows[0]);
    }

    res.json({
      success: true,
      count: saved.length,
      data: saved
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
