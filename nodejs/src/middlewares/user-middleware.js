import HttpStatus from 'http-status';
import repositories from '../repositories';
import utility from '../services/utility';

const { userRepository } = repositories;

export default {
  /**
   * Check user exist
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUserExists(req, res, next) {
    try {
      const { params: { id } } = req;
      if (id) {
        const result = await userRepository.findOne({ id });
        if (result) {
          req.userInfo = result;
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'USER_NOT_FOUND'),
          });
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check user exist
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUserIdExists(req, res, next) {
    try {
      if (req.body.userId) {
        const { userId } = req.body;
        const result = await userRepository.findOne({ id: userId });
        if (result) {
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'USER_NOT_FOUND'),
          });
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check email exists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkEmailExists(req, res, next) {
    try {
      const { body: { email } } = req;
      const findUserData = await userRepository.findOne({ email });
      if (findUserData) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'EMAIL_EXIST'),
        });
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check email exists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkPhoneNumberExists(req, res, next) {
    try {
      const userData = req.user;
      const { body: { phoneNumber } } = req;
      const findUserData = await userRepository.findOne({ phoneNumber });
      if (userData) {
        if (findUserData && findUserData.id !== userData.id) {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: [],
            message: utility.getMessage(req, false, 'PHONE_EXIST'),
          });
        } else {
          next();
        }
      } else if (findUserData) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'PHONE_EXIST'),
        });
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify user
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async VerifyUserExists(req, res, next) {
    try {
      const { params: { id } } = req;
      const userData = req?.user;
      const result = await userRepository.findOne({ id });
      if (result) {
        if (userData?.id === Number(id)) {
          next();
        } else {
          throw utility.customError(req, 'USER_PROFILE_NOT_MATCH', 1);
        }
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          data: [],
          message: utility.getMessage(req, false, 'USER_NOT_FOUND'),
        });
      }
    } catch (error) {
      next(error);
    }
  },

};
