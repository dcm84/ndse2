const express = require('express');
const session = require('express-session')
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const passport = require("passport")


//middleware с обработкой ошибок
const error404Middleware = require('./middleware/error404');
const error500Middleware = require('./middleware/error500');
const loggedInMiddleware = require('./middleware/loggedIn');

//routes
const indexRouter = require('./routes/index');
const booksRouter = require('./routes/books');
const userRouter = require('./routes/user');
const apiUserRouter = require('./routes/api/user');
const apiBooksRouter = require('./routes/api/books');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

//настраиваем ejs
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));  //для того, чтобы обеспечить запуск не из корня проекта

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(cors());

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false
  }))

app.use(passport.authenticate('session'));
app.use(function(req, res, next) {
    var msgs = req.session.messages || [];
    res.locals.messages = msgs;
    res.locals.hasMessages = !! msgs.length;
    req.session.messages = [];
    next();
  });

app.use(loggedInMiddleware);

//статический маршрут
console.log(__dirname + "./public")
app.use('/public', express.static(__dirname + "/public"));

//маршруты ejs
app.use('/', indexRouter);
app.use('/books', booksRouter);
app.use('/user', userRouter);
//маршруты api
app.use('/api/user', apiUserRouter);
app.use('/api/books', apiBooksRouter);

//обработчики ошибок
app.use(error404Middleware);
app.use(error500Middleware);

//websocket
const Comment = require('./models/comment');

io.on('connection', (socket) => {
    const {id} = socket;
    console.log(`Подключение к web-сокету: ${id}`);

    // работа с комнатами
    const {bookID} = socket.handshake.query;
    console.log(`Сообщение к книге: ${bookID}`);
    socket.join(bookID);

    socket.on('message-to-room', async (msg) => {
        //В перспективе проверить, что сообщения от авторизованного пользователя
        socket.to(bookID).emit('message-to-room', msg);
        socket.emit('message-to-room', msg);

        const newComment = new Comment({
            bookID: bookID,
            userID: msg.userID,
            userName: msg.userName,
            message: msg.message
        });

        try {
            await newComment.save();
        } catch (e) {
            console.error(e);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Отключен от к web-сокета: ${id}`);
    });
});

//стартуем сервер
const PORT = process.env.LIBRARY_PORT || 3000;
const UserDB = process.env.DB_USERNAME || 'root';
const PasswordDB = process.env.DB_PASSWORD || 'root';
const NameDB = process.env.DB_NAME || 'library'
const HostDb = process.env.DB_HOST || 'mongodb://localhost:27017/'

async function start() {
    try {
        await mongoose.connect(HostDb, {
            user: UserDB,
            pass: PasswordDB,
            dbName: NameDB,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        server.listen(PORT, () => {
            console.log(`Сервер работает на порту ${PORT}`);
        })
    } catch (e) {
        console.log(e);
    }
}

start();