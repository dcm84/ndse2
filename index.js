//читаем окружение (можно и через скрипт dev)
require('dotenv').config()

const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");

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

app.set("view engine", "ejs");

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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
});