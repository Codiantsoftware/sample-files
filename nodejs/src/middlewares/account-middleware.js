import HttpStatus from 'http-status';
import mediaMiddleware from './media-middleware';
import utility from '../services/utility';
import repository from '../repositories';

const { userRepository } = repository;
export default {
  /**
   * Check email exist
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkEmailExists(req, res, next) {
    try {
      const { body: { userId, email } } = req;
      if (email) {
        const userObject = await userRepository.findOne({ email });
        if (userObject && userObject.id === userId) {
          if (userObject.isEmailVerified === 1) {
            throw utility.customError(req, 'EMAIL_EXIST', 1);
          }
          req.userInfo = userObject;
          next();
        } else {
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            data: null,
            message: utility.getMessage(req, false, 'EMAIL_NOT_EXIST'),
          });
        }
      } else {
        throw utility.customError(req, 'EMAIL_REQUIRED', 1);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check user media for
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUserMediaFor(req, res, next) {
    const { params } = req;
    const basePathStr = params.basePath;
    const newImages = [];
    if (basePathStr && basePathStr !== req.user.profileImage) {
      newImages.push(basePathStr);
    }
    params.basePath = '';
    params.basePathArray = newImages;
    return (
      (params.basePathArray.length > 0
        && mediaMiddleware.checkMediaFor(req, res, next))
      || next()
    );
  },

  /**
   * Check user media exist
   * Note:- this middleware after checkUserMediaExists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUserMediaExists(req, res, next) {
    const { params } = req;
    return (
      (params.basePathArray.length > 0
        && mediaMiddleware.checkMediaExists(req, res, next))
      || next()
    );
  },

};
