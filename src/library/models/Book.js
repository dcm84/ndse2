const uidGenerator = require('node-unique-id-generator');

class Book {
    constructor(title = "", desc = "", authors = "", favorite = "", fileCover = "", fileBook = "", id = uidGenerator.generateUniqueId()) {
        this.id = id;
        this.title = title;
        this.description = desc;
        this.authors = authors;
        this.favorite = favorite;
        this.fileCover = fileCover;
        this.fileBook = fileBook;
    }
}

module.exports = Book;