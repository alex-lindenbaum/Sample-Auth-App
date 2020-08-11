const fs = require('fs');
const jwt = require('jsonwebtoken');

const publicKey = fs.readFileSync('./assets/public.key');
const privateKey = fs.readFileSync('./assets/private.key');

module.exports = {
    sha256: input => require('crypto').createHash('sha256').update(input).digest('base64'),

    generateVerifyNumber: n => {
        let num = '';
        for (let i = 0; i < n; i++)
            num += Math.floor(Math.random() * 10);
        return num;
    },

    jwtSign: (email, cb) => jwt.sign({
        iss: 'Sample Auth App',
        sub: email,
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
    }, privateKey, { algorithm: 'RS256' }, cb),

    jwtVerify: (token, email, cb) => jwt.verify(token, publicKey, {
        issuer: 'Sample Auth App',
        subject: email
    }, cb)
}
