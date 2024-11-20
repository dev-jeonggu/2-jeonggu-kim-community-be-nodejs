const jwt = require('jsonwebtoken');

const secretKey = "your_secret_key";

const generateToken = (payload, expiresIn = "1h") => {
    return jwt.sign(payload, secretKey, { expiresIn });
};

module.exports = { generateToken };