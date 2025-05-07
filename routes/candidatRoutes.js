// routes/candidatRoutes.js
const express = require('express');
const router = express.Router();
const candidatController = require('../controllers/candidatController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/inscription', candidatController.inscription);
router.post('/verifier-email', candidatController.verifierEmail);
router.post('/reenvoyer-code', candidatController.renvoyerCode);
router.get('/statut', verifyToken, candidatController.getStatut);
router.post('/upload', upload.single('document'), candidatController.uploadDocument);

module.exports = router;
