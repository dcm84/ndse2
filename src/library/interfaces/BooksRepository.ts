abstract class BooksRepository {
    abstract createBook(book: Book) : boolean
    abstract getBook(id: number) : Book
    abstract getBooks() : Book[]
    abstract updateBook(id : number) : boolean
    abstract deleteBook(id : number): boolean
}