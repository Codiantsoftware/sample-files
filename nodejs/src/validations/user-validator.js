import Joi from 'joi';

const changeStatusSchema = Joi.object({
  id: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive', 'deleted').required(),
});

const userProfileUpdateSchema = Joi.object({
  id: Joi.number().integer().greater(0).optional(),
  firstName: Joi.string().trim().min(3).max(50)
    .messages({
      'any.required': 'FIRST_NAME_REQUIRED',
      'string.empty': 'FIRST_NAME_REQUIRED',
      'string.min': 'FIRST_NAME_MIN_VALIDATION',
      'string.max': 'FIRST_NAME_MAX_VALIDATION',
    })
    .required(),
  lastName: Joi.string().trim().min(3).max(50)
    .messages({
      'any.required': 'LAST_NAME_REQUIRED',
      'string.empty': 'LAST_NAME_REQUIRED',
      'string.min': 'LAST_NAME_MIN_VALIDATION',
      'string.max': 'LAST_NAME_MAX_VALIDATION',
    })
    .required(),
  companyName: Joi.string().trim().min(3).max(50)
    .required(),
  profileImage: Joi.string().optional().empty().allow(''),
});

const sendOtpSchema = Joi.object().keys({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: false } })
    .min(6)
    .max(50)
    .messages({
      'any.required': 'EMAIL_REQUIRED',
      'string.empty': 'EMAIL_REQUIRED',
      'string.email': 'VALID_EMAIL_ALLOWED',
      'string.min': 'EMAIL_MIN_VALIDATION',
      'string.max': 'EMAIL_MAX_VALIDATION',
    })
    .required(),
});

const verifyOtpSchema = Joi.object().keys({
  otp: Joi.number().integer().max(999999).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: false } })
    .min(6)
    .max(50)
    .messages({
      'any.required': 'EMAIL_REQUIRED',
      'string.empty': 'EMAIL_REQUIRED',
      'string.email': 'VALID_EMAIL_ALLOWED',
      'string.min': 'EMAIL_MIN_VALIDATION',
      'string.max': 'EMAIL_MAX_VALIDATION',
    })
    .required(),
  deviceId: Joi.string()
    .messages({
      'string.empty': 'DEVICE_ID_REQUIRED',
      'any.required': 'DEVICE_ID_REQUIRED',
    })
    .required(),
  firebaseToken: Joi.string().optional().empty().allow(''),
  deviceType: Joi.string()
    .valid('android', 'ios', 'web')
    .messages({
      'any.only': 'DEVICE_TYPE_REQUIRED',
    })
    .required(),
});

const phoneNumberOtpSchema = Joi.object().keys({
  countryCode: Joi.string()
    .min(1)
    .max(6)
    .messages({
      'string.empty': 'COUNTRY_CODE_REQUIRED',
      'any.required': 'COUNTRY_CODE_REQUIRED',
    })
    .required(),
  phoneNumber: Joi.string()
    .min(6)
    .max(15)
    .regex(/^\d+$/)
    .messages({
      'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
      'string.min': 'PHONE_MAX_VALIDATION',
      'string.max': 'PHONE_MAX_VALIDATION',
    })
    .required(),
});

const verifyPhoneNumberSchema = Joi.object().keys({
  otp: Joi.number().integer().max(999999).required(),
});

export default {
  changeStatusSchema,
  userProfileUpdateSchema,
  sendOtpSchema,
  verifyOtpSchema,
  phoneNumberOtpSchema,
  verifyPhoneNumberSchema,
};
