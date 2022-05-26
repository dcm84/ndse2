const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

//middleware с обработкой ошибок
const error404Middleware = require('./middleware/error404');
const error500Middleware = require('./middleware/error500');

//routes
const indexRouter = require('./routes/index');
const booksRouter = require('./routes/books');
const apiUserRouter = require('./routes/api/user');
const apiBooksRouter = require('./routes/api/books');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());

//настраиваем ejs
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));  //для того, чтобы обеспечить запуск не из корня проекта

//статический маршрут
app.use('/public', express.static(__dirname + "/public"));

//маршруты ejs
app.use('/', indexRouter);
app.use('/books', booksRouter);

//маршруты api
app.use('/api/user', apiUserRouter);
app.use('/api/books', apiBooksRouter);

//обработчики ошибок
app.use(error404Middleware);
app.use(error500Middleware);

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

        app.listen(PORT, () => {
            console.log(`Сервер работает на порту ${PORT}`);
        })
    } catch (e) {
        console.log(e);
    }
}

start();