const fs = require('fs');
const request  = require('request')
const express = require('express');
const router = express.Router();
const fileMiddleware = require('../middleware/file');

const COUNTER_URL = process.env.COUNTER_URL || "http://localhost";
const COUNTER_PORT = process.env.COUNTER_PORT || 3001;
console.log(`Ищу счетчик ${COUNTER_URL} : ${COUNTER_PORT}`)

const { Book } = require('../models');
const store = {
    books: [],
};

//немного демо-данных для теста
[1, 2, 3].map(el => {
    const newBook = new Book(`Book # ${el}`, `description for book # ${el}`);
    store.books.push(newBook);
});

router.get('/', (req, res) => {
    const { books } = store;
    res.render("books/index", {
        title: "Library",
        books
    });
});

router.get('/create', (req, res) => {
    res.render("books/create", {
        title: "Добавление книги",
        book: {},
    });
});

router.post('/create', fileMiddleware.fields([
    { name: 'cover-img', maxCount: 1 },
    { name: 'book-file', maxCount: 1 }
]), (req, res) => {
    const { books } = store;
    const { title, desc, authors, favorite } = req.body;

    if ('cover-img' in req.files && 'book-file' in req.files && title.trim() != "") {
        const newBook = new Book(
            title, desc, authors, favorite,
            req.files['cover-img'][0]['path'].replaceAll(/[\\]+/g, '/'),
            req.files['book-file'][0]['path'].replaceAll(/[\\]+/g, '/')
        );
        books.push(newBook);
        res.redirect('/books')
    } else {
        res.status(500).render("errors/500", {
            error: "Обязательно загрузите хотя бы обложку, файл книги и ее название"
        });
    }
});

router.get('/:id', (req, res) => {
    const { books } = store;
    const { id } = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1) {
        let cbook = books[idx]
        let bookURL = COUNTER_URL + ":" + COUNTER_PORT + '/' + cbook['id'] + '/incr'

        request.post(
            bookURL,
            {},
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let parsedData = JSON.parse(body)
                    cbook['cnt'] = parsedData['value'] !=null ? parsedData['value'] : 0
                    res.render("books/view", {
                        title: "Просмотр информации о книге",
                        book: books[idx],
                    });
                }
                else {
                    res.status(500).render("errors/500", {
                        error: "Ошибка связи со счетчиком посещений"
                    });
                }
            }
        );
    } else {
        res.status(404).redirect('/404');
    }
});

router.get('/update/:id', (req, res) => {
    const { books } = store;
    const { id } = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1) {
        res.render("books/update", {
            title: "Редактирование книги",
            book: books[idx],
        });
    } else {
        res.status(404).redirect('/404');
    }
});

router.post('/update/:id', fileMiddleware.fields([
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
                fileCover: req.files['cover-img'][0]['path'].replaceAll(/[\\]+/g, '/'),
                fileBook: req.files['book-file'][0]['path'].replaceAll(/[\\]+/g, '/')
            };

            res.redirect(`/books/${id}`);
        } else {
            res.status(500).render("errors/500", {
                error: "Обязательно загрузите хотя бы обложку, файл книги и ее название"
            });
        }

    } else {
        res.status(404).redirect('/404');
    }
});

router.post('/delete/:id', (req, res) => {
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
        res.redirect(`/books`);
    } else {
        res.status(404).redirect('/404');
    }
});

router.get('/:id/download', (req, res) => {
    const { books } = store;
    const { id } = req.params;
    const idx = books.findIndex(el => el.id === id);

    if (idx !== -1 && books[idx].fileBook) {
        res.download(__dirname + '/../' + books[idx].fileBook, books[idx].title + books[idx].fileBook.replace(/.*(\.[a-z0-9]+)$/, "$1"), err => {});
    } else {
        res.status(404).redirect('/404');
    }

});

module.exports = router;