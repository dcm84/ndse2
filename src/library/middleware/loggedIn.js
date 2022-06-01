module.exports = (req, res, next) => {
    global.authUser =  req.user ? req.user.login : false;
    next();
};