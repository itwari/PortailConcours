// controllers/candidatController.js
const crypto = require('crypto');
const sendVerificationEmail = require('../services/emailService');
  
exports.inscription = async (req, res) => {
  const { nom, prenom, email, telephone } = req.body;
  const db = req.app.locals.db;
  const verificationCode = crypto.randomBytes(3).toString('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
  
  try {
    await db.run(
      `INSERT INTO candidats (nom, prenom, email, telephone, verification_code, verification_expires)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email, telephone, verificationCode, expiresAt]
    );
    sendVerificationEmail(email, nom, verificationCode);
    res.json({ message: 'Inscription réussie ! Vérifiez votre email dans 10 minutes.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l’inscription du candidat : ',error });
  }
};

exports.verifierEmail = async (req, res) => {
  const { email, code } = req.body;
  const db = req.app.locals.db;
  try {
    const candidat = await db.get("SELECT verification_code, verification_expires FROM candidats WHERE email = ?", [email]);
    if (!candidat || candidat.verification_code !== code) {
      return res.status(400).json({ error: 'Code invalide !' });
    }
    if (new Date(candidat.verification_expires) < new Date()) {
      return res.status(400).json({ error: 'Code expiré, demandez un nouveau !' });
    }
    await db.run("UPDATE candidats SET email_verifie = 1 WHERE email = ?", [email]);
    res.json({ message: 'Email validé avec succès !' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la validation de l’email' });
  }
};

exports.renvoyerCode = async (req, res) => {
  const { email } = req.body;
  const db = req.app.locals.db;
  const newCode = crypto.randomBytes(3).toString('hex');
  const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  try {
    await db.run("UPDATE candidats SET verification_code = ?, verification_expires = ? WHERE email = ?", [newCode, newExpiresAt, email]);
    sendVerificationEmail(email, "Candidat", newCode);
    res.json({ message: 'Nouveau code envoyé !' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la réémission du code' });
  }
};

exports.getStatut = async (req, res) => {
  const db = req.app.locals.db;
  const userEmail = req.user.email;
  try {
    const candidat = await db.get("SELECT statut, resultat FROM candidats WHERE email = ?", [userEmail]);
    if (!candidat) {
      return res.status(404).json({ error: 'Candidat non trouvé !' });
    }
    res.json({ statut: candidat.statut, resultat: candidat.resultat });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
  }
};

exports.uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fichier non reçu ou format invalide !' });
  }
  res.json({ message: 'Fichier uploadé avec succès', filePath: req.file.path });
};
