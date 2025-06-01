const express = require('express');
const router = express.Router();


const signupController = require('../controllers/signupcontroller');
const { login } = require('../controllers/Logincontroller');




router.post('/signup', signupController.signup);
router.post('/login', login);



module.exports = router;