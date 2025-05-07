// config/database.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function initDatabase() {
  const db = await open({
    filename: path.join(__dirname, '../database.sqlite'),
    driver: sqlite3.Database
  });

  // Création des tables
  await db.exec(`CREATE TABLE IF NOT EXISTS candidats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telephone TEXT NOT NULL,
    statut TEXT DEFAULT 'en attente',
    resultat TEXT DEFAULT 'en attente',
    email_verifie INTEGER DEFAULT 0,
    verification_code TEXT,
    verification_expires TIMESTAMP
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'candidat' CHECK (role IN ('super_admin', 'admin', 'candidat'))
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidat_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    action TEXT CHECK (action IN ('validé', 'rejeté')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    commentaire TEXT,
    FOREIGN KEY (candidat_id) REFERENCES candidats(id),
    FOREIGN KEY (admin_id) REFERENCES utilisateurs(id)
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS historique (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT CHECK (action IN ('import', 'export')),
    fichier TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES utilisateurs(id)
  )`);

  return db;
}

module.exports = initDatabase;
