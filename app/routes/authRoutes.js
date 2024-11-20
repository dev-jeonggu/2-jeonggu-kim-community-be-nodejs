const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require("../middleware/authenticateToken");

router.get('/', authenticateToken, (req, res) => {
    return res.status(200).json({
        authenticated: true
    });
});
router.post('/login', authController.login);

module.exports = { router };