import { IBook } from "./IBook";
import Book from "../models/Book";

export abstract class IBooksRepository {
    abstract createBook(book: IBook) : Promise<Book>
    abstract getBook(id: string) : Promise<Book> 
    abstract getBooks() : Promise<IBook[]>
    abstract updateBook(id : string, data: IBook) : Promise<Book>
    abstract deleteBook(id : string): Promise<Book>
}
