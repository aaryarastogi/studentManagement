const { body, validationResult } = require('express-validator');

const studentValidationRules = () => {
  return [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('course')
      .trim()
      .notEmpty().withMessage('Course is required'),
    
    body('year')
      .isInt({ min: 1, max: 8 }).withMessage('Year must be an integer between 1 and 8'),
    
    body('dob')
      .notEmpty().withMessage('Date of birth is required')
      .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        if (birthDate >= today) {
          throw new Error('Date of birth must be in the past');
        }
        return true;
      }),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid'),
    
    body('mobile_number')
      .trim()
      .notEmpty().withMessage('Mobile number is required')
      .matches(/^[+0-9\s-]{10,15}$/).withMessage('Mobile number must be a valid phone number (10 to 15 digits/characters)'),
    
    body('gender')
      .trim()
      .notEmpty().withMessage('Gender is required')
      .isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    
    body('address')
      .trim()
      .notEmpty().withMessage('Address is required')
      .isLength({ min: 5 }).withMessage('Address must be at least 5 characters long')
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  // Format error messages
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(420).json({
    success: false,
    message: 'Validation failed',
    errors: extractedErrors,
  });
};

module.exports = {
  studentValidationRules,
  validate,
};
