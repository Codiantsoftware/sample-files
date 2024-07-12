import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility';
import constant from '../constant';

const { commonConstant } = constant;

const { RateLimiterMemory } = require('rate-limiter-flexible');

const { userRepository } = repositories;
/**
 * Set rate limiter object
 */
const rateLimiterForAttempts = new RateLimiterMemory({
  points: 3, // 3 points
  duration: 60, // per 60 seconds
  blockDuration: 5 * 60, // block for 5 minutes if more than points consumed
});

export default {
  /**
   * Get Users
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getUsers(req, res, next) {
    try {
      const result = await userRepository.getUserList(req);
      utility.handleResponse(req, res, true, result, '', HttpStatus.OK);
      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        message: utility.getMessage(req, false, 'USER_LIST'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * get User Detail
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getUserDetail(req, res, next) {
    try {
      const result = req?.userInfo ?? {};
      utility.handleResponse(req, res, true, result, 'USER_DETAIL', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all user list
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getUserListForAdmin(req, res, next) {
    try {
      const result = await userRepository.getUserList(req);
      utility.handleResponse(req, res, true, result, '', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  },

  /**
   * update Profile
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async updateProfile(req, res, next) {
    try {
      const result = await userRepository.updateProfile(req);
      if (result) {
        utility.handleResponse(req, res, true, result, 'PROFILE_UPDATED', HttpStatus.OK);
      } else {
        utility.handleResponse(req, res, false, null, 'TRY_AGAIN', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change user status
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async changeStatus(req, res, next) {
    try {
      const { body: { status }, params: { id } } = req;
      const bodyData = { id, status };
      await userRepository.updateUserStatus(bodyData);
      utility.handleResponse(req, res, true, [], 'USER_STATUS_UPDATED', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send Otp to email for verification
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async sendOtp(req, res, next) {
    try {
      const result = await userRepository.sendOtp(req);
      if (result) {
        if (result.status === 'send_error') {
          utility.handleResponse(req, res, false, [], 'UNABLE_MAIL_SEND', HttpStatus.BAD_REQUEST);
        }
        if (result.status === 'invalid_email') {
          utility.handleResponse(req, res, false, [], 'VALID_EMAIL_ALLOWED', HttpStatus.OK);
        } else {
          utility.handleResponse(req, res, true, null, 'OTP_SENT_EMAIL', HttpStatus.OK);
        }
      } else {
        utility.handleResponse(req, res, false, null, 'EMAIL_NOT_EXIST', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify Otp for email verification
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async verifyOtp(req, res, next) {
    try {
      const data = await userRepository.verifyOtp(req);
      if (data?.isEmailVerified === 0) {
        utility.handleResponse(req, res, true, data ?? {}, 'USER_EMAIL_NOT_VERIFIED', HttpStatus.OK);
      } else if (data?.status === commonConstant.STATUS.INVALID) {
        rateLimiterForAttempts.consume(req.ip).then(() => {
          utility.handleResponse(req, res, false, [], 'INVALID_OTP', HttpStatus.BAD_REQUEST);
        }).catch(() => {
          utility.handleResponse(req, res, false, [], 'TO_MANY_ATTEMPTS', 429);
        });
      } else {
        utility.handleResponse(req, res, true, data ?? {}, 'USER_VERIFICATION_OTP', HttpStatus.OK);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change user phone number
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async changePhoneNumber(req, res, next) {
    try {
      const data = await userRepository.changePhoneNumber(req);
      utility.handleResponse(req, res, true, data ?? {}, 'PHONE_OTP_SENT', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  },

  /**
   * User phone otp verify
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async verifyPhoneOtp(req, res, next) {
    try {
      const data = await userRepository.verifyPhoneOtp(req);
      utility.handleResponse(req, res, true, data ?? {}, 'VERIFY_OTP', HttpStatus.OK);
    } catch (error) {
      next(error);
    }
  },

};
