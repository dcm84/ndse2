const {Schema, model} = require('mongoose');
var crypto = require('crypto'); 

const userSchema = new Schema({
    login: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    }, 
    hash : String, 
    salt : String 
});

userSchema.methods.setPassword = function(password) { 
    this.salt = crypto.randomBytes(16).toString('hex'); 
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
}; 
     
userSchema.methods.validPassword = function(password) { 
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
    return this.hash === hash; 
}; 

module.exports = model('User', userSchema);