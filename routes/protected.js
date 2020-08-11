const router = require('express').Router();
const { body, validationResult } = require('express-validator');

const { jwtVerify } = require('../util/secure');

router.get('/', [ body('email').isEmail().normalizeEmail() ], async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(400).json({ error: `field 'access_token' is missing or invalid` });

    const email = req.body.email;
    const access_token = authHeader.substring(7);

    jwtVerify(access_token, email, err => {
        if (err) {
            res.status(400).json({ error: 'invalid JWT' });
        } else {
            res.status(200).json({ secretMessage: 'This is a secret message. You should only be able to see this after 2FA and authorizing with JWT.' });
        }
    });
});

module.exports = router;
