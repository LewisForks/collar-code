const validator = require('validator');

const validateSignupInput = (name, email, password, dateOfBirth) => {

    const errors = {};

    // Validate name
    if (!name || !validator.isLength(name, { min: 1 })) {
        errors.name = "Name is required.";
    } else if (!validator.isAlpha(name.replace(/\s+/g, ''))) {
        errors.name = "Name can only contain letters and spaces.";
    }

    // Validate email
    if (!email || !validator.isEmail(email)) {
        errors.email = "Valid email is required.";
    }

    // Validate password
    if (!password || !validator.isLength(password, { min: 8 })) {
        errors.password = "Password must be at least 8 characters.";
    }

    // Validate date of birth
    if (!dateOfBirth || !validator.isDate(dateOfBirth, { format: 'YYYY-MM-DD', strictMode: false })) {
        errors.dateOfBirth = "Valid date of birth (YYYY-MM-DD) is required.";
    }

    // Check if there are any validation errors
    if (Object.keys(errors).length === 0) {
        return null; // No errors, validation successful
    }

    // Return the validation errors
    return {
        status: "FAILED",
        message: "Validation failed.",
        errors,
    };
};

module.exports = {
    validateSignupInput,
};
