class DatabaseError extends Error {
    constructor(code, ...params) {
        super(...params);
    
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DatabaseError);
        }
    
        this.name = 'DatabaseError';
        this.code = code;
    }
}

module.exports = DatabaseError;
