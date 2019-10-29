exports.getchatroom = (req, res, next) => {
    res.render('chatroom',{
        path:'/chatroom',
        title:'Chat Room',
        sender:req.session.user.fullName,
        receiver:req.params.username
    })
    }