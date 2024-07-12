import { Router } from 'express';
import controllers from '../controllers';
import middlewares from '../middlewares';
import validations from '../validations';
import constant from '../constant';

const router = Router();
const { userController } = controllers;
const { userValidator } = validations;
const {
  authMiddleware,
  resourceAccessMiddleware,
  validateMiddleware,
  userMiddleware,
} = middlewares;

/** 
 * Route to get users
 * Middleware: Ensure user is authenticated
 * Middleware: Check resource access level for admin or user
 * Controller function to get users
 */
router.get(
  '/user',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'user']),
  userController.getUsers,
);

/** 
 * Route to get user details by ID
 * Middleware: Ensure user is authenticated
 * Middleware: Check resource access level for admin
 * Middleware: Check if user exists
 * Controller function to get user detail
 */
router.get(
  '/user/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  userMiddleware.checkUserExists,
  userController.getUserDetail,
);

/** 
 * Route to update user profile by ID
 * Middleware: Ensure user is authenticated
 * Middleware: Check resource access level for user
 * Middleware: Validate user profile update schema
 * Middleware: Check if user exists
 * Middleware: Verify user existence
 * Controller function to update user profile
 */
router.put(
  '/user/:id',
  authMiddleware,
  resourceAccessMiddleware(['user']),
  validateMiddleware({ schema: userValidator.userProfileUpdateSchema }),
  userMiddleware.checkUserExists,
  userMiddleware.VerifyUserExists,
  userController.updateProfile,
);

/** 
 * Route to change user status by ID
 * Middleware: Ensure user is authenticated
 * Middleware: Check resource access level for admin
 * Middleware: Validate change status schema
 * Middleware: Check if user exists
 * Controller function to change user status
 */
router.patch(
  '/user/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware({
    schema: userValidator.changeStatusSchema,
  }),
  userMiddleware.checkUserExists,
  userController.changeStatus,
);

/** 
 * Route to send OTP
 * Middleware: Apply rate limiting for sending OTP
 * Middleware: Validate send OTP schema
 * Controller function to send OTP
 */
router.post(
  '/send-otp',
  constant.limiterConstant.ACCOUNT_LIMITER,
  validateMiddleware({ schema: userValidator.sendOtpSchema }),
  userController.sendOtp,
);

/** 
 * Route to verify OTP
 * Middleware: Validate verify OTP schema
 * Controller function to verify OTP
 */
router.post(
  '/verify-otp',
  validateMiddleware({ schema: userValidator.verifyOtpSchema }),
  userController.verifyOtp,
);

/** 
 * Route to change user phone number
 * Middleware: Ensure user is authenticated
 * Middleware: Check resource access level for user
 * Middleware: Validate phone number OTP schema
 * Middleware: Check if phone number already exists
 * Controller function to change user phone number
 */
router.post(
  '/user/change-phone-number',
  authMiddleware,
  resourceAccessMiddleware(['user']),
  validateMiddleware({ schema: userValidator.phoneNumberOtpSchema }),
  userMiddleware.checkPhoneNumberExists,
  userController.changePhoneNumber,
);

/** 
 * Route to verify user phone number
 * Middleware: Ensure user is authenticated
 * Middleware: Check resource access level for user
 * Middleware: Validate verify phone number schema
 * Controller function to verify user phone number
 */
router.post(
  '/user/verify-phone-number',
  authMiddleware,
  resourceAccessMiddleware(['user']),
  validateMiddleware({ schema: userValidator.verifyPhoneNumberSchema }),
  userController.verifyPhoneOtp,
);

export default router;
