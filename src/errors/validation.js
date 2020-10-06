class ValidationError extends Error {
    constructor(code, ...params) {
        super(...params);
    
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        }
    
        this.name = 'ValidationError';
        this.code = code;
    }
}

module.exports = ValidationError;
