# Написать следующие запросы для MongoDB:

## 1. Запрос для вставки данных минимум о двух книгах в коллекцию books

```
db.books.insertMany([
   { title: "Book 1", description: "Lazy book", authors: "Lazy M.A."},
   { title: "Book 2", description: "Funny book", authors: "Funny W.O."},
   { title: "Book 3", description: "Boring book", authors: "Borring P.E."},
   { title: "Book 4", description: "Stupid book", authors: "Stupid H.U."}
]);
```

## 2.Запрос для поиска полей документов коллекции books по полю title

Все книги с вхождением "Book" в title, отображаем поля title и authors:

```
db.books.find(
	{title: /.*Book.*/},
	{title: 1, authors: 1}
)
```

## 3. Запрос для редактирования полей: description и authors коллекции books по _id записи

Обновляем по _id

```
db.books.updateOne(
   {_id: ObjectId("628eab9753cbc97c448eae15")},
   {
     $set: { description: "Not Well done book", authors: "Not W.E." }
   }
)
```

Обновляем по вхождению Lazy в description

```
db.books.updateMany(
   {description: /.*Lazy.*/},
   {
     $set: { description: "Well done book", authors: "Well D.O." }
   }
)
```
