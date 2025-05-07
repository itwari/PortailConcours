// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ error: 'Accès refusé, token manquant !' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY', (err, user) => {
    if (err) return res.status(401).json({ error: 'Token invalide !' });
    req.user = user;
    next();
  });
};
