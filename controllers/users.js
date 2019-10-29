const User = require('../models/User');

exports.getUsers = (req, res, next) => {
    User.find({_id:{$ne:req.session.user._id}})
        .then(result => {
            res.render('users', {
                path: '/',
                title: 'Users',
                users: result
            })
        })
        .catch(err => {
            console.log(err);
        })
}