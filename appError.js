class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'failed' : 'passed';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor); //used for something :( 
     }
}

module.exports = AppError;