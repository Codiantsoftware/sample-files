import HttpStatus from 'http-status';
import utility from '../services/utility';
import repositories from '../repositories';

const { RateLimiterMemory } = require('rate-limiter-flexible');

const {
  accountRepository,
  userRepository,
} = repositories;

/**
 * Set rate limiter object
 */
const rateLimiterForAttempts = new RateLimiterMemory({
  points: 5, // 5 points
  duration: 60, // per 60 seconds
  blockDuration: 5 * 60, // block for 5 minutes if more than points consumed
});

export default {
  /**
   * Admin login api
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async login(req, res, next) {
    try {
      const user = await accountRepository.checkLogin(req);
      if (user.token) {
        utility.handleResponse(req, res, true, user, 'LOGIN_SUCCESS', HttpStatus.OK);
      } else if (user.status === 'inactive') {
        utility.handleResponse(req, res, false, [], 'ACCOUNT_INACTIVE', HttpStatus.BAD_REQUEST);
      } else {
        rateLimiterForAttempts
          .consume(req.ip)
          .then(() => {
            utility.handleResponse(req, res, false, [], 'INVALID_CREDENTIAL', HttpStatus.BAD_REQUEST);
          })
          .catch(() => {
            utility.handleResponse(req, res, false, [], 'TO_MANY_ATTEMPTS', 429);
          });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * User logout api
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async logout(req, res, next) {
    try {
      const userData = req.user;
      const userDevice = await accountRepository.getUserDeviceToken(
        userData.id,
      );
      if (userDevice) {
        const data = { token: null };
        await accountRepository.updateUserDevice(userDevice, data);
        utility.handleResponse(req, res, true, null, 'LOGOUT_SUCCESS', HttpStatus.OK);
      } else {
        utility.handleResponse(req, res, false, null, 'USER_NOT_FOUND', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * User Signup api
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async userSignup(req, res, next) {
    try {
      const userSignup = await accountRepository.userSignup(req);
      if (userSignup) {
        utility.handleResponse(req, res, true, userSignup, 'SIGNUP_SUCCESS', HttpStatus.OK);
      } else {
        utility.handleResponse(req, res, false, null, 'TRY_AGAIN', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Admin change password api
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async changePassword(req, res, next) {
    try {
      const result = await userRepository.changePassword(req);
      if (result) {
        if (result.status === 'changed') {
          utility.handleResponse(req, res, true, null, 'PASSWORD_CHANGED', HttpStatus.OK);
        } else if (result.status === 'passwordNotDifferent') {
          utility.handleResponse(req, res, false, null, 'PASSWORD_NOT_DIFFERENT', HttpStatus.BAD_REQUEST);
        } else {
          utility.handleResponse(req, res, false, null, 'INVALID_PASSWORD', HttpStatus.BAD_REQUEST);
        }
      } else {
        utility.handleResponse(req, res, false, null, 'UNAUTHORIZED_ACCESS', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Admin forgot password
   * @param {oject} req
   * @param {object} res
   * @param {function} next
   */
  async adminForgotPassword(req, res, next) {
    try {
      const result = await accountRepository.adminForgotPassword(req);
      if (result) {
        if (result.status === 'inactive') {
          utility.handleResponse(req, res, false, [], 'ACCOUNT_INACTIVE', HttpStatus.BAD_REQUEST);
        }
        if (result.status === 'send_error') {
          utility.handleResponse(req, res, false, [], 'UNABLE_MAIL_SEND', HttpStatus.BAD_REQUEST);
        } else {
          utility.handleResponse(req, res, true, null, 'PASSWORD_LINK_SENT', HttpStatus.OK);
        }
      } else {
        utility.handleResponse(req, res, false, null, 'EMAIL_NOT_EXIST', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset admin password
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async resetAdminPassword(req, res, next) {
    try {
      const user = await accountRepository.resetAdminPassword(req);
      if (user && user.status === 'updated') {
        utility.handleResponse(req, res, true, null, 'PASSWORD_CHANGED', HttpStatus.OK);
      } else if (user && user.status === 'inactive') {
        utility.handleResponse(req, res, false, null, 'ACCOUNT_INACTIVE', HttpStatus.BAD_REQUEST);
      } else if (!user) {
        utility.handleResponse(req, res, false, null, 'PASSWORD_LINK_EXPIRED', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Find user by id
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getUserDetail(req, res, next) {
    try {
      const { params: { id } } = req;
      const userInfo = await userRepository.getUserProfile(req);
      req.query.id = id;
      utility.handleResponse(req, res, true, userInfo, 'USER_DETAIL', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Profile Image
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async updateProfileImage(req, res, next) {
    try {
      const result = await accountRepository.updateProfileImage(req);
      utility.handleResponse(req, res, true, result, 'PROFILE_IMAGE_UPLOADED', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Winston Logs Path
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getWinstonLogsPath(req, res, next) {
    try {
      const data = await accountRepository.getWinstonLogsPath(req);
      utility.handleResponse(req, res, true, data, '', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Winston Logs List
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getWinstonLogs(req, res, next) {
    try {
      const queryData = req.query;
      const data = await accountRepository.getWinstonLogs(queryData);
      utility.handleResponse(req, res, true, data, '', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  },

  /**
 * Get Winston Logs level count
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
  async getWinstonLogsLevelCount(req, res, next) {
    try {
      const queryData = req.query;
      const data = await accountRepository.getWinstonLevelCount(queryData);
      utility.handleResponse(req, res, true, data, '', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  },
};
