const { ValidationError } = require('../errors');

const validateOrder = (order, error = 'Pagination order must either be ASC or DESC') =>  {
    if (typeof order !== 'string' || !['ASC', 'DESC'].find(o => o === order)) {
        throw new ValidationError('VALIDATION_ERROR', error);
    }
};

module.exports = {
    validateOrder,
};
