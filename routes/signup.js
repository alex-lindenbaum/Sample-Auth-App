const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const phone = require('phone');
const User = require('../util/user-model');
const { sha256 } = require('../util/secure');

router.post('/', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).trim(),
    body('phone').isMobilePhone()
], async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    let mobile = phone(req.body.phone);
    if (phone.length == 0)
        return res.status(400).json({ error: 'phone number invalid' });

    mobile = mobile[0].substring(1);

    const userExists = await User.exists({ email });

    if (userExists)
        return res.status(403).json({ error: 'user already exists' });

    const hashedPassword = sha256(password);
    const newUser = new User({
        email,
        phone: mobile,
        hashedPassword
    });

    try {
        await newUser.save();   
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'error saving user profile' });
    }
    
    res.status(200).json({ msg: 'successfully registered' });
});

module.exports = router;
