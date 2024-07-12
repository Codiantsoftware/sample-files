import * as Joi from 'joi';

// User signup validations
export const userSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z ,.'-]+$/i)
    .messages({
      'any.required': 'FIRSTNAME_REQUIRED',
      'string.empty': 'FIRSTNAME_REQUIRED',
      'string.min': 'FIRSTNAME_MIN_VALIDATION',
      'string.max': 'FIRSTNAME_MAX_VALIDATION',
      'string.pattern': 'SPACES_NOT_ALLOWED_IN_FIRSTNAME',
    })
    .required(),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z ,.'-]+$/i)
    .messages({
      'any.required': 'LASTNAME_REQUIRED',
      'string.empty': 'LASTNAME_REQUIRED',
      'string.min': 'LASTNAME_MIN_VALIDATION',
      'string.max': 'LASTNAME_MAX_VALIDATION',
      'string.pattern': 'SPACES_NOT_ALLOWED_IN_LASTNAME',
    })
    .required(),

  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: false } })
    .min(6)
    .max(50)
    .pattern(/^[^\s]+$/)
    .messages({
      'any.required': 'EMAIL_REQUIRED',
      'string.empty': 'EMAIL_REQUIRED',
      'string.email': 'VALID_EMAIL_ALLOWED',
      'string.min': 'EMAIL_MIN_VALIDATION',
      'string.max': 'EMAIL_MAX_VALIDATION',
      'string.pattern.base': 'EMAIL_FORMAT_INVALID',
      'string.pattern': 'SPACES_NOT_ALLOWED_IN_EMAIL',
    })
    .required(),

  password: Joi.string()
    .min(6)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    )
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.regex.base':
        'Password must include at least one lowercase letter, one digit, and one special character (@$!%*?&)',
      'string.regex.(?=.*[A-Z])':
        'Password must include at least one uppercase letter',
      'string.regex.(?=.*[@$!%*?&])':
        'Password must include at least one special character (@$!%*?&)',
    })
    .required(),
  contact: Joi.string()
    .min(10)
    .max(10)
    .messages({
      'string.min': 'Contact number must be 10 digits long',
      'string.max': 'Contact number must be 10 digits long',
    })
    .required(),
  status: Joi.string().required(),
  role: Joi.string().required(),
});

// User login validations
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: false } })
    .min(6)
    .max(50)
    .pattern(/^[^\s]+$/)
    .messages({
      'any.required': 'EMAIL_REQUIRED',
      'string.empty': 'EMAIL_REQUIRED',
      'string.email': 'VALID_EMAIL_ALLOWED',
      'string.min': 'EMAIL_MIN_VALIDATION',
      'string.max': 'EMAIL_MAX_VALIDATION',
      'string.pattern.base': 'EMAIL_FORMAT_INVALID',
      'string.pattern': 'SPACES_NOT_ALLOWED_IN_EMAIL',
    })
    .required(),

  password: Joi.string().min(6).label('Password').required(),
  deviceType: Joi.string().min(1).label('deviceType').required(),
  firebaseToken: Joi.string().min(5).label('firebaseToken').required(),
});
