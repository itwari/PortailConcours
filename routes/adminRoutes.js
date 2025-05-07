// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.put('/candidats/:id/valider', verifyToken, verifyRole(['admin', 'super_admin']), adminController.validerCandidat);
router.put('/candidats/:id/resultat', verifyToken, verifyRole(['admin', 'super_admin']), adminController.mettreAJourResultat);
router.post('/import-candidats', verifyToken, verifyRole(['admin', 'super_admin']), upload.single('file'), adminController.importCandidats);
router.get('/export-resultats', verifyToken, verifyRole(['admin', 'super_admin']), adminController.exportResultats);

module.exports = router;
