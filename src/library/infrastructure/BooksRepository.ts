import { injectable } from 'inversify';
import { IBooksRepository } from '../interfaces/IBooksRepository';
import Book = require('../models/book');
import { IBook } from '../interfaces/IBook';

@injectable()
export class BooksRepository implements IBooksRepository {

    constructor(private bookDB: Book) {}

    async createBook(book: IBook) : Promise<Book> {
        const newBook = new this.bookDB.Book(book);
        return newBook.save();
    }

    async getBook(id: string) : Promise<Book> {
        return this.bookDB.findById(id).select('-__v');
    }

    async getBooks() : Promise<IBook[]> {
        return this.bookDB.find().select('-__v');
    }

    async updateBook(id : string, data: IBook) : Promise<Book> {
        return this.bookDB.findByIdAndUpdate(id, data)
    }

    async deleteBook(id : string): Promise<Book> {
        return this.bookDB.deleteOne({_id: id});
    }
}