module.exports = (err, req, res, next) => {
    res.status(500)
    res.render("errors/500", {
        error: err.toString()
    });
};