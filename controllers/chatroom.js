exports.getchatroom = (req, res, next) => {
    res.render('chatroom',{
        path:'/chatroom',
        title:'Chat Room',
        name:req.session.user.fullName || ''
    })
    }