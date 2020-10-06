const { ValidationError } = require('../errors');

const validateLatitude = (latitude, error = 'Latitude must be -90 to 90 degrees') =>  {
    if (latitude < -90 || latitude > 90) {
        throw new ValidationError('VALIDATION_ERROR', error);
    }
};

const validateLongitude = (latitude, error = 'Longitude must be -180 to 180 degrees') =>  {
    if (latitude < -90 || latitude > 90) {
        throw new ValidationError('VALIDATION_ERROR', error);
    }
};

const validateName = (name, error = 'Name must be a non empty string') =>  {
    if (typeof name !== 'string' || name.length < 1) {
        throw new ValidationError('VALIDATION_ERROR', error);
    }
};

module.exports = {
    validateLatitude,
    validateLongitude,
    validateName,
};
