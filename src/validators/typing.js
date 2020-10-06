const { ValidationError } = require('../errors');

const validateNumber = (number, error = 'Not a valid number') =>  {
    if (typeof number !== 'number') {
        throw new ValidationError('VALIDATION_ERROR', error);
    }
};

module.exports = {
    validateNumber,
};
