// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { email, password, role } = req.body;
  const db = req.app.locals.db;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO utilisateurs (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role || 'admin']
    );
    res.json({ message: 'Compte créé !' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la création de compte' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const db = req.app.locals.db;
  try {
    const user = await db.get('SELECT * FROM utilisateurs WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Identifiants incorrects !' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
};
