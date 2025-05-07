// routes/historiqueRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyRole } = require('../middleware/roleMiddleware');

router.get('/', verifyToken, verifyRole(['admin', 'super_admin']), async (req, res) => {
  const db = req.app.locals.db;
  const { admin_id, start_date, end_date } = req.query;
  let query = "SELECT * FROM historique WHERE 1=1";
  let params = [];
  if (admin_id) {
    query += " AND admin_id = ?";
    params.push(admin_id);
  }
  if (start_date && end_date) {
    query += " AND timestamp BETWEEN ? AND ?";
    params.push(start_date, end_date);
  }
  try {
    const historique = await db.all(query, params);
    res.json(historique);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de l’historique" });
  }
});

module.exports = router;
