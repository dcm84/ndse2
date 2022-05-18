//читаем окружение (можно и через скрипт dev)
require('dotenv').config()

const express = require('express');
const cors = require('cors');
const formData = require("express-form-data");

const { Book } = require('./models');
const store = {
    books: [],
};

//немного демо-данных для теста
[1, 2, 3].map(el => {
    const newBook = new Book(`Book # ${el}`, `description for book # ${el}`);
    store.books.push(newBook);
});

const app = express();

app.use(formData.parse());
app.use(cors());

app.post(['/login/', '/api/user/'], (req, res) => {
    res.status(201);
    res.json({ id: 1, mail: "test@mail.ru" });
});

app.get('/api/books/', (req, res) => {
    res.json(store.books);
});

app.get('/api/books/:id', (req, res) => {
    const { books } = store;
    const { id } = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1) {
        res.json(books[idx]);
    } else {
        res.status(404);
        res.json("Такой книги у нас нет!");
    }
});

app.post('/api/books/', (req, res) => {
    const { books } = store;
    const { title, desc, authors, favorite, fileCover, fileName } = req.body;

    const newBook = new Book(title, desc, authors, favorite, fileCover, fileName);
    books.push(newBook);

    res.status(201);
    res.json(newBook);
});

app.put('/api/books/:id', (req, res) => {
    const { books } = store;
    const { title, desc, authors, favorite, fileCover, fileName } = req.body;
    const { id } = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1) {
        books[idx] = {
            ...books[idx],
            title,
            desc,
            authors,
            favorite,
            fileCover,
            fileName
        };
        res.json(books[idx]);
    } else {
        res.status(404);
        res.json("Такой книги у нас нет!");
    }
});

app.delete('/api/books/:id', (req, res) => {
    const { books } = store;
    const { id } = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1) {
        books.splice(idx, 1);
        res.json("ok");
    } else {
        res.status(404);
        res.json("Такой книги у нас нет!");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
});