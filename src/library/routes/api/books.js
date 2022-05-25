const fs = require('fs');
const express = require('express');
const router = express.Router();
const fileMiddleware = require('../../middleware/file');

const { Book } = require('../../models');
const store = {
    books: [],
};

//немного демо-данных для теста
[1, 2, 3].map(el => {
    const newBook = new Book(`Book # ${el}`, `description for book # ${el}`);
    store.books.push(newBook);
});

router.get('/', (req, res) => {
    res.json(store.books);
});

router.get('/:id', (req, res) => {
    const { books } = store;
    const { id } = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1) {
        res.json(books[idx]);
    } else {
        res.status(404);
        res.json({ error: "Такой книги у нас нет!" });
    }
});

router.post('/', fileMiddleware.fields([
    { name: 'cover-img', maxCount: 1 },
    { name: 'book-file', maxCount: 1 }
]), (req, res) => {
    const { books } = store;
    const { title, desc, authors, favorite } = req.body;

    if ('cover-img' in req.files && 'book-file' in req.files && title.trim() != "") {
        const newBook = new Book(
            title, desc, authors, favorite,
            req.files['cover-img'][0]['path'],
            req.files['book-file'][0]['path']
        );
        books.push(newBook);

        res.status(201);
        res.json(newBook);
    } else {
        res.status(500);
        res.json({ error: "Обязательно загрузите хотя бы обложку, файл книги и ее название" });
    }
});

router.put('/:id', fileMiddleware.fields([
    { name: 'cover-img', maxCount: 1 },
    { name: 'book-file', maxCount: 1 }
]), (req, res) => {
    const { books } = store;
    const { title, desc, authors, favorite } = req.body;
    const { id } = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1) {
        if ('cover-img' in req.files && 'book-file' in req.files && title.trim() != "") {
            if (books[idx].fileCover) {
                fs.unlink(books[idx].fileCover, (err => {}));
            }
            if (books[idx].fileBook) {
                fs.unlink(books[idx].fileBook, (err => {}));
            }

            books[idx] = {
                ...books[idx],
                title,
                desc,
                authors,
                favorite,
                fileCover: req.files['cover-img'][0]['path'],
                fileBook: req.files['book-file'][0]['path']
            };

            res.json(books[idx]);
        } else {
            res.status(500);
            res.json({ error: "Обязательно загрузите хотя бы обложку, файл книги и ее название" });
        }

    } else {
        res.status(404);
        res.json({ error: "Такой книги у нас нет!" });
    }
});

router.delete('/:id', (req, res) => {
    const { books } = store;
    const { id } = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1) {
        if (books[idx].fileCover) {
            fs.unlink(books[idx].fileCover, (err => {}));
        }
        if (books[idx].fileBook) {
            fs.unlink(books[idx].fileBook, (err => {}));
        }

        books.splice(idx, 1);
        res.json("ok");
    } else {
        res.status(404);
        res.json({ error: "Такой книги у нас нет!" });
    }
});

router.get('/:id/download', (req, res) => {
    const { books } = store;
    const { id } = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1 && books[idx].fileBook) {
        res.download(__dirname + '/../' + books[idx].fileBook, books[idx].title + books[idx].fileBook.replace(/.*(\.[a-z0-9]+)$/, "$1"), err => {
            if (err) {
                res.status(404).json({ error: "Ошибка выгрузки файла" });
            }
        });
    } else {
        res.status(404).json({ error: "Файл не найден!" });
    }

});

module.exports = router;