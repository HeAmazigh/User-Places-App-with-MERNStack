class HttpError extends Error {
    constructor(messege, errorCode) {
        super(messege);
        this.code = errorCode;
    }
}

module.exports = HttpError;