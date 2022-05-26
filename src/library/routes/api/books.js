const fs = require('fs');
const express = require('express');
const router = express.Router();
const fileMiddleware = require('../../middleware/file');

const Book = require('../../models/book');

router.get('/', async (req, res) => {
    const books = await Book.find().select('-__v');
    res.json(books);
});

router.get('/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const book = await Book.findById(id).select('-__v');
        res.json(book);
    } catch (e) {
        console.error(e);
        res.status(404).json({
            errrorCode: 404,
            errorMessage: "Книга не найдена"
        });
    }
});

router.post('/', fileMiddleware.fields([
    { name: 'cover-img', maxCount: 1 },
    { name: 'book-file', maxCount: 1 }
]), async (req, res) => {
    const { title, desc, authors, favorite } = req.body;

    if ('cover-img' in req.files && 'book-file' in req.files && title.trim() != "") {

        const newBook = new Book({
            title, 
            description: desc, authors, favorite,
            fileCover: req.files['cover-img'][0]['path'].replaceAll(/[\\]+/g, '/'),
            fileBook: req.files['book-file'][0]['path'].replaceAll(/[\\]+/g, '/')
        });

        try {
            await newBook.save();
            res.json(newBook);
        } catch (e) {
            console.error(e);
            res.status(500).json({
                errrorCode: 500,
                errorMessage: "Ошибка сохранения данных"
            });
        }
    
    } else {
        res.status(500).json({
            errrorCode: 500,
            errorMessage: "Обязательно загрузите хотя бы обложку, файл книги и ее название"
        });
    }
});

router.put('/:id', fileMiddleware.fields([
    { name: 'cover-img', maxCount: 1 },
    { name: 'book-file', maxCount: 1 }
]), async (req, res) => {

    const { title, desc, authors, favorite } = req.body;
    const { id } = req.params;

    //проверяем, что такой объект еще есть (нужно будет удалять старые файлы)
    try {
        let book = await Book.findById(id);

        //если загружены новые файлы 
        if ('cover-img' in req.files && 'book-file' in req.files && title.trim() != "") {
            if (book.fileCover) {
                fs.unlink(book.fileCover, (err => {}));
            }
            if (book.fileBook) {
                fs.unlink(book.fileBook, (err => {}));
            }

            try {
                await Book.findByIdAndUpdate(id, {
                    title, 
                    description: desc, authors, favorite,
                    fileCover: req.files['cover-img'][0]['path'].replaceAll(/[\\]+/g, '/'),
                    fileBook: req.files['book-file'][0]['path'].replaceAll(/[\\]+/g, '/')
                });

                res.redirect(`/api/books/${id}`);
            } catch (e) {
                console.error(e);
                res.status(500).json({
                    errrorCode: 500,
                    errorMessage: "Ошибка обновления данных"
                });
            }

        } else {
            res.status(500).json({
                errrorCode: 500,
                errorMessage: "Обязательно загрузите хотя бы обложку, файл книги и ее название"
            });
        }
    } catch (e) {
        console.error(e);
        res.status(404).json({
            errrorCode: 404,
            errorMessage: "Книга не найдена"
        });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    //проверяем, что такой объект еще есть, нужно удалить файлы в фс
    try {
        let book = await Book.findById(id);
        
        if (book.fileCover) {
            fs.unlink(book.fileCover, (err => {}));
        }
        if (book.fileBook) {
            fs.unlink(book.fileBook, (err => {}));
        }      
        
        try {
            await Book.deleteOne({_id: id});
            res.json('ok');
        } catch (e) {
            console.error(e);
            res.status(500).json({
                error: "Ошибка удаления данных"
            });
        }

    } catch (e) {
        console.error(e);
        res.status(404).json({
            errrorCode: 404,
            errorMessage: "Книга не найдена"
        });
    }
});

router.get('/:id/download', async (req, res) => {
    const { id } = req.params;
    try {
        let book = await Book.findById(id);
        
        if(book.fileBook) {
            res.download(__dirname + '/../' + book.fileBook, book.title + book.fileBook.replace(/.*(\.[a-z0-9]+)$/, "$1"), err => {});
        }
        else {
            res.status(404).json({
                errrorCode: 404,
                errorMessage: "Файл книги отсутствует"
            });
        }
    } catch (e) {
        console.error(e);
        res.status(404).json({
            errrorCode: 404,
            errorMessage: "Книга не найдена"
        });
    }

});

module.exports = router;