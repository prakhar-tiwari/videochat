const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash=require('connect-flash');

const keys = require('./config/keys');

const authRoutes = require('./routes/auth');
const chatRoomRoutes = require('./routes/chatroom');
const userRoutes = require('./routes/users');


const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: keys.secretOrKey,
        resave: false,
        saveUninitialized: false
    })
);

app.use(flash());

app.use(authRoutes);
app.use(chatRoomRoutes);
app.use(userRoutes);


mongoose.connect(keys.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(res => {
        let socketsArray = [];
        console.log("mongodb connected");
        const server = app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`)
        });
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log(`client connected ${socket.id}`);

            socket.on('register-user',(userInfo)=>{
                socket.broadcast.emit('add-users', {
                    users: [socket.id],
                    receiver:userInfo.user
                });
            })

            socket.on('disconnect', () => {
                socketsArray.splice(socketsArray.indexOf(socket.id), 1);
                io.emit('remove-user', socket.id);
            });

            socket.on('make-offer', (data) => {
                socket.to(data.to).emit('offer-made', {
                    offer: data.offer,
                    socket: socket.id
                });
            });

            socket.on('make-answer', (data) => {
                socket.to(data.to).emit('answer-made', {
                    socket: socket.id,
                    answer: data.answer
                })
            })
        })
    })
    .catch(err => {
        console.log(err);
    })