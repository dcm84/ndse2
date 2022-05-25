//нельзя использовать два мультера в одном роуте, поэтому такой грустный код:(
const multer = require('multer');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (file.fieldname === "cover-img") {
            cb(null, 'public/covers/');
        } else {
            cb(null, 'public/books/');
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
        cb(null, false)
    }
};

module.exports = multer({
    storage,
    fileFilter
});