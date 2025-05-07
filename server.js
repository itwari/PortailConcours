// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require("cors");
const { Server } = require('socket.io');
const initDatabase = require('./config/database');


const authRoutes = require('./routes/authRoutes');
const candidatRoutes = require('./routes/candidatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const historiqueRoutes = require('./routes/historiqueRoutes');

const app = express();
app.use(express.json());
app.use(cors()); // Allow all origins by default
// To make it more specific and secure, you can restrict the allowed origins:
const corsOptions = {
    origin: "http://localhost:3000", // Replace with your front-end URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
};
app.use(cors(corsOptions));

// Servir les fichiers statiques pour uploads et exports
app.use('/uploads', express.static('uploads'));
app.use('/exports', express.static('exports'));

// Définition des routes
app.use('/api/auth', authRoutes);
app.use('/api/candidats', candidatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/historique', historiqueRoutes);

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté via Socket.io !');
  // Vous pouvez ajouter ici des événements Socket
});

app.set('io', io);

// Démarrage du serveur après initialisation de la DB
const PORT = process.env.PORT || 5000;
initDatabase().then((db) => {
  app.locals.db = db;
  server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}).catch((err) => {
  console.error("Erreur lors de l'initialisation de la DB :", err);
});
