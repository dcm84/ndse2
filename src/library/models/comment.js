const {Schema, model} = require('mongoose');

const commentSchema = new Schema({
    bookID: {
        type: String,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    }
});

module.exports = model('Comment', commentSchema);