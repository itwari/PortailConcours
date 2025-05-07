const bcrypt = require('bcryptjs');
(async () => {
    const hashedPassword = await bcrypt.hash("admin", 10);
    console.log("Mot de passe haché :", hashedPassword);
})();