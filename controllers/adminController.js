// controllers/adminController.js
const sendResultEmail = require('../services/emailService').sendResultEmail;
const xlsx = require('xlsx');
const path = require('path');

exports.validerCandidat = async (req, res) => {
  const { action, commentaire } = req.body;
  const adminId = req.user.id;
  const db = req.app.locals.db;
  try {
    await db.run("UPDATE candidats SET statut = ? WHERE id = ?", [action, req.params.id]);
    await db.run("INSERT INTO validations (candidat_id, admin_id, action, commentaire) VALUES (?, ?, ?, ?)",
       [req.params.id, adminId, action, commentaire]);
    const io = req.app.get('io');
    io.emit('statutMisAJour', { id: req.params.id, statut: action });
    res.json({ message: "Validation enregistrée !" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur lors de la validation" });
  }
};

exports.mettreAJourResultat = async (req, res) => {
  const { resultat } = req.body;
  const db = req.app.locals.db;
  try {
    await db.run("UPDATE candidats SET resultat = ? WHERE id = ?", [resultat, req.params.id]);
    const candidat = await db.get("SELECT email, nom FROM candidats WHERE id = ?", [req.params.id]);
    sendResultEmail(candidat.email, candidat.nom, resultat);
    res.json({ message: "Résultat mis à jour et notification envoyée !" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour du résultat" });
  }
};

exports.importCandidats = async (req, res) => {
  const db = req.app.locals.db;
  const xlsx = require('xlsx');
  const uploadFile = req.file;
  if (!uploadFile) {
    return res.status(400).json({ error: "Aucun fichier reçu !" });
  }
  try {
    const workbook = xlsx.readFile(uploadFile.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const candidats = xlsx.utils.sheet_to_json(sheet);
    for (const candidat of candidats) {
      await db.run("INSERT INTO candidats (nom, prenom, email, telephone) VALUES (?, ?, ?, ?)",
         [candidat.nom, candidat.prenom, candidat.email, candidat.telephone]);
    }
    await db.run("INSERT INTO historique (admin_id, action, fichier) VALUES (?, 'import', ?)", [req.user.id, uploadFile.filename]);
    res.json({ message: "Importation réussie et enregistrée !" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'importation" });
  }
};

exports.exportResultats = async (req, res) => {
  const db = req.app.locals.db;
  try {
    const candidats = await db.all("SELECT nom, prenom, email, telephone, resultat FROM candidats");
    const worksheet = xlsx.utils.json_to_sheet(candidats);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Résultats");
    const filePath = path.join(__dirname, '..', 'exports', 'resultats.xlsx');
    xlsx.writeFile(workbook, filePath);
    await db.run("INSERT INTO historique (admin_id, action, fichier) VALUES (?, 'export', 'resultats.xlsx')", [req.user.id]);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l’exportation des résultats" });
  }
};
