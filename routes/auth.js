const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [
    body('email', 'Please enter a valid email')
        .isEmail(),
    body('password', 'Password must contain only numbers and text and atleast 5 characters')
        .isLength({ min: 5 })
        .isAlphanumeric()

], authController.postLogin);

router.post('/signup', [
    body('fullName','Name must contain only text and atleast 3 characters ')
    .isLength({min:3}),
    body('email', 'Please enter a valid email')
        .isEmail(),
    body('password', 'Password must be atleast 5 characters')
        .isLength({ min: 5 }),
    body('confirmPassword').custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Passwords have to match')
        }
        return true;
    })
    .trim()
],
    authController.postSignup);

module.exports = router;