const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: '인증이 필요합니다.' });
    }
}

router.get('/check', (req, res) => {
    if (req.session && req.session.user) {
        res.status(200).json({ authenticated: true });
    } else {
        res.status(401).json({ message: '인증이 필요합니다.' });
    }
});

router.post('/login', authController.login);

module.exports = { router, isAuthenticated };