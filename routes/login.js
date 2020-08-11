const router = require('express').Router();
const { body, validationResult } = require('express-validator');

const User = require('../util/user-model');
const { generateVerifyNumber, jwtSign } = require('../util/secure');
const sendSMS = require('../util/sms');

router.post('/know', [
    body('email').isEmail().normalizeEmail(),
    body('password').trim()
], async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user)
        return res.status(404).json({ error: 'user does not exist' });

    if (!user.comparePassword(password))
        return res.status(403).json({ error: 'incorrect password' });

    // Send verification code
    const verificationCode = generateVerifyNumber(5);
    sendSMS(user.phone, `Your code is ${verificationCode}`);

    user.requestedCode = true;
    user.verificationCode = verificationCode;
    user.timeIssued = Date.now();

    try {
        await user.save();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'error saving user profile' });
    }

    res.status(200).json({ msg: `sent verification code to ${user.phone}` });
});

router.post('/have', [ body('email').isEmail().normalizeEmail() ], async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    if (!req.body.code)
        return res.status(400).json({ error: `field 'code' is missing` });

    const { email, code } = req.body;
    const user = await User.findOne({ email });
    
    if (!user)
        return res.status(404).json({ error: 'user does not exist' });

    if (!user.requestedCode)
        return res.status(403).json({ error: 'forbidden: user did not request verification code' });

    user.requestedCode = false;

    // 180 second code
    if (user.sinceIssued() >= 3 * 60 * 1000) {

        try {
            await user.save()
        } catch (error) {
            console.log(error);
        }

        return res.status(403).json({ error: 'forbidden: code expired. request code again' });
    }

    if (!user.compareCodes(code)) {

        try {
            await user.save()
        } catch (error) {
            console.log(error);
        }

        return res.status(403).json({ error: 'forbidden: incorrect code. request code again' });
    }

    // Send JWT token
    jwtSign(email, (err, token) => {
        if (err) {
            res.status(500).json({ error: 'error signing token' });
        } else {
            res.status(200).json({
                access_token: token,
                token_type: 'JWT',
                expires_in: 60 * 60
            });
        }

        try {
            await user.save()
        } catch (error) {
            console.log(error);
        }
    });
});

module.exports = router;
