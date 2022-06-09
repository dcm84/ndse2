//нельзя использовать два мультера в одном роуте, поэтому такой грустный код:(
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (file.fieldname === "cover-img") {
            //из-за того, что проект уехал в src/library
            cb(null, path.join(__dirname, '../public/covers/'));
        } else {
            cb(null, path.join(__dirname, '../public/books/'));
        }
    },
    filename(req, file, cb) {
        cb(null, `${new Date().toISOString().replace(/:/g, '-')}-${file.originalname}`)
    }
});

//pdf, txt, doc/docx
const allowedBooksTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const allowedImagesTypes = ['image/png', 'image/jpg', 'image/jpeg'];

const fileFilter = (req, file, cb) => {
    if (file.fieldname === "cover-img" && allowedImagesTypes.includes(file.mimetype)) {
        cb(null, true)
    } else if (file.fieldname === "book-file" && allowedBooksTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        console.log("file is unsuitable")
        cb(null, false)
    }
};

module.exports = multer({
    storage,
    fileFilter
});