const errorHandler = (err, req, res, next) => {
    if (err) {
        const statusCode = res.statusCode ? res.statusCode : 500;
        res.status(statusCode);
        res.json({
            status: false,
            message: err.message,
            stack: err.stack,
        });
    } else {
        next();
    }
};

module.exports = errorHandler;
