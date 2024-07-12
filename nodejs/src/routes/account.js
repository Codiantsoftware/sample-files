import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { accountValidator } = validations;
const { accountController } = controllers;
const {
  authMiddleware,
  validateMiddleware,
  userMiddleware,
  resourceAccessMiddleware,
  accountMiddleware,
} = middlewares;

/** 
 * Route for user signup
 * Middleware: Validate user signup data
 * Middleware: Check if email already exists
 * Middleware: Check if phone number already exists
 * Controller function for user signup
*/
router.post(
  '/signup',
  validateMiddleware({ schema: accountValidator.userCreateSchema }),
  accountMiddleware.checkEmailExists,
  userMiddleware.checkPhoneNumberExists,
  accountController.userSignup,
);

/**
 * Route for user logout
 * Middleware: Ensure user is authenticated
 * Middleware: Check resource access level for admin or user
 * Controller function for user logout
 */
router.post(
  '/logout',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'user']),
  accountController.logout,
);

/**
 * Route to get user details
 * Middleware: Ensure user is authenticated
 * Middleware: Modify request parameters to include user id and type
 * Middleware: Check if user exists
 * Controller function to get user details
 */
router.get(
  '/me',
  authMiddleware,
  (req, res, next) => {
    Object.assign(req.params, {
      id: req.user.id,
      type: 'self',
    });
    next();
  },
  userMiddleware.checkUserExists,
  accountController.getUserDetail,
);

// Route to get Winston log files path
router.get(
  '/winston-files',
  accountController.getWinstonLogsPath,
);

// Route to get Winston log files
router.get(
  '/winston-logs',
  accountController.getWinstonLogs,
);

// Route to get count of Winston log levels
router.get(
  '/winston-logs/level-count',
  accountController.getWinstonLogsLevelCount,
);

export default router;
