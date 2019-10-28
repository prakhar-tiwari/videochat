const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getLogin = (req, res, next) => {
    res.render('login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: '',
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    })
}

exports.postLogin = (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: []
                })
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        })
                    }
                    else {
                        return res.status(422).render('login', {
                            path: '/login',
                            pageTitle: 'Login',
                            errorMessage: 'Invalid email or password.',
                            oldInput: {
                                email: email,
                                password: password
                            },
                            validationErrors: []
                        })
                    }
                })
                .catch(err => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error);
                })

        })
}

exports.getSignup = (req, res, next) => {
    res.render('signup', {
        path: '/signup',
        pageTitle: 'Sign Up',
        errorMessage: '',
        oldInput: {
            fullName: '',
            userName: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    })
}

exports.postSignup = (req, res, next) => {
    const { fullName, userName, email, password, confirmPassword } = req.body;
    console.log(fullName)
    bcrypt.hash(password, 12)
        .then(hashPassword => {
            const user = new User({
                fullName: fullName,
                userName: userName,
                email: email,
                password: hashPassword
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};