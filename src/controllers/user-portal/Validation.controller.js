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
    if (!password || !validator.isLength(password, { min: 8, max: 32 })) {
        errors.password = "Password must be between 8 and 32 characters.";
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

const validateAccountUpdateInput = (name, email, password, dateOfBirth) => {

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
    if (password && !validator.isLength(password, { min: 8, max: 32 })) {
        errors.password = "Password must be between 8 and 32 characters.";
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

const validateResetPasswordInput = (password) => {

    const errors = {};

    // Validate password
    if (!password || !validator.isLength(password, { min: 8 })) {
        errors.password = "Password must be at least 8 characters.";
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

const validatePetProfileInput = (petName, petBreed, petAge) => {

    const errors = {};

    // Validate pet name
    if (!petName || !validator.isLength(petName, { min: 1 })) {
        errors.petName = "Pet's name is required.";
    } else if (!validator.isAlpha(petName.replace(/\s+/g, ''))) {
        errors.petName = "Pet's name can only contain letters and spaces.";
    }

    // Validate pet breed
    if (!petBreed || !validator.isLength(petBreed, { min: 1 })) {
        errors.petBreed = "Pet's breed is required.";
    } else if (!validator.isAlpha(petBreed.replace(/\s+/g, ''))) {
        errors.petBreed = "Pet's breed can only contain letters and spaces.";
    }

    // Validate pet age
    if (!petAge || !validator.isInt(petAge, { min: 0 })) {
        errors.petAge = "Pet's age is required and should be more than 0.";
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
    validateAccountUpdateInput,
    validateResetPasswordInput,
    validatePetProfileInput,
};
