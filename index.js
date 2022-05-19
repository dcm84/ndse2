//читаем окружение (можно и через скрипт dev)
require('dotenv').config()

const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");

//middleware с обработкой ошибок
const error404Middleware = require('./middleware/error404');
const error500Middleware = require('./middleware/error500');

//routes
const userRouter = require('./routes/user');
const booksRouter = require('./routes/books');

const app = express();

app.use(cors());

//статический маршрут
app.use('/public', express.static(__dirname + "/public"));

//маршруты api
app.use('/api/user', userRouter);
app.use('/api/books', booksRouter);

//обработчики ошибок
app.use(error404Middleware);
app.use(error500Middleware);

//стартуем сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
});