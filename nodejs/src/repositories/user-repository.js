/* eslint-disable import/no-cycle */
/* eslint-disable radix */
import { Op, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import models from '../models';
import mediaRepository from './media-repository';
import accountRepository from './account-repository';
import utility from '../services/utility';
import logMessage from '../logMessages/index';
import jwt from '../services/jwt';
import Email from '../services/email';
import constant from '../constant';

const { commonConstant } = constant;
const {
  user, userOtp, role, userRole,
} = models;

export default {
  /**
   * Find a user by specified conditions.
   * @param {Object} where - Conditions to find a user
   * @returns {Object} - The found user
   */
  async findOne(where) {
    try {
      const havingWhere = where.email ? { email: where.email } : {};
      const attributes = { exclude: ['password', 'verifyToken'] };
      const userScope = [
        { method: ['user', { where, havingWhere, attributes }] },
        { method: ['userRole', { whereRole: {} }] },
      ];
      return await user.scope(userScope).findOne();
    } catch (error) {
      logMessage.userErrorMessage('userDetails', { error });
      throw Error(error);
    }
  },

  /**
    * Create a password hash using bcrypt.
    * @param {string} password - The password to hash
    * @returns {Promise<string>} - The hashed password
    * @throws {Error} - Throws an error if there is an issue creating the hash
  */
  async createHashPassword(password) {
    try {
      const salt = await bcrypt.genSalt();
      return await bcrypt.hash(password, salt);
    } catch (error) {
      logMessage.userErrorMessage('createPassword', { error });
      throw Error(error);
    }
  },

  /**
   * Update a user's password.
   * @param {Object} userObject - The user to update
   * @param {String} newPassword - The new password
   * @returns {Object} - The updated user
   */
  async updatePassword(userObject, newPassword) {
    try {
      const hashPassword = this.createHashPassword(newPassword);
      return await userObject.update({
        password: hashPassword,
        passwordResetToken: null,
      });
    } catch (error) {
      logMessage.userErrorMessage('updatePassword', { error });
      throw Error(error);
    }
  },

  /**
   * Change a user's password.
   * @param {Object} req - Request object with user and new password
   * @returns {Object} - A status message
   */
  async changePassword(req) {
    try {
      const { user: { id }, body: { currentPassword, newPassword } } = req;
      const userObject = await user.findOne({
        where: { id },
      });
      if (userObject) {
        const isPasswordMatch = await accountRepository.compareUserPassword(
          currentPassword,
          userObject.password,
        );
        const isPasswordDifferent = await accountRepository.compareUserPassword(
          newPassword,
          userObject.password,
        );
        if (isPasswordDifferent) {
          return { status: 'passwordNotDifferent' };
        }
        if (!isPasswordMatch) {
          return { status: 'notMatched' };
        }
        await this.updatePassword(userObject, newPassword);
        return { status: 'changed' };
      }
      return false;
    } catch (error) {
      logMessage.userErrorMessage('changePassword', { error, data: req?.body });
      throw Error(error);
    }
  },

  /**
   * Add a new password for a user.
   * @param {Object} req - Request object with user ID and new password
   * @returns {Object} - A status message
   */
  async addPassword(req) {
    try {
      const userObject = await user.findOne({
        where: { id: req.body.id },
      });
      if (userObject) {
        await this.updatePassword(userObject, req.body.newPassword);
        return { status: 'changed' };
      }
      return false;
    } catch (error) {
      logMessage.userErrorMessage('createPassword', { error, data: req?.body });
      throw Error(error);
    }
  },

  /**
   * Get user profile details by ID.
   * @param {Object} req - Request object with user ID
   * @returns {Object} - The user's profile details
   */
  async getUserProfile(req) {
    try {
      const { params: { id } } = req;
      const where = { id };
      const attributes = {
        exclude: ['password', 'verificationOtp', 'passwordResetToken'],
      };
      const userScope = [
        { method: ['user', { where, havingWhere: {}, attributes }] },
        { method: ['userRole', { whereRole: {} }] },
      ];
      return await user.scope(userScope).findOne();
    } catch (error) {
      logMessage.userErrorMessage('userDetails', { error, data: req?.body });
      throw Error(error);
    }
  },

  /**
   * Update a user's profile details.
   * @param {Object} req - Request object with updated profile data and user info
   * @returns {Object} - The updated user profile
   */
  async updateProfile(req) {
    const transaction = await models.sequelize.transaction();

    try {
      const {
        body: {
          firstName, lastName, profileImage, companyName,
        },
        userInfo,
      } = req;
      const data = {
        firstName,
        lastName,
        companyName,
        profileImage,
      };
      await userInfo.update(
        data,
        { transaction },
      );
      // Update media details
      await mediaRepository.makeUsedMedias([data.profileImage]);
      await transaction.commit();
      return await this.findOne({ id: userInfo.id });
    } catch (error) {
      await transaction.rollback();
      logMessage.userErrorMessage('userUpdate', { error, data: req?.body });
      throw Error(error);
    }
  },

  /**
   * Update an admin's profile details.
   * @param {Object} req - Request object with updated admin profile data
   * @returns {Object} - The updated admin profile
   */
  async AdminUpdateProfile(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const userData = req?.user;
      const {
        body: { firstName, username },
      } = req;
      const data = { firstName, username };
      await user.update(
        data,
        { where: { id: userData.id } },
        { transaction },
      );
      await transaction.commit();
      return await this.findOne({ id: userData.id });
    } catch (error) {
      await transaction.rollback();
      logMessage.userErrorMessage('userUpdate', { error, data: req?.body });
      throw Error(error);
    }
  },

  /**
   * Get the total count of users.
   * @returns {Number} - The total count of users
   */
  async getUserCount() {
    try {
      const where = {
        status: { [Op.in]: [commonConstant.STATUS.ACTIVE, commonConstant.STATUS.INACTIVE] },
      };
      return await user.count({ where });
    } catch (error) {
      logMessage.userErrorMessage('count', { error });
      throw Error(error);
    }
  },

  /**
   * Get a list of users with optional filtering and sorting.
   * @param {Object} req - Request object with query parameters
   * @returns {Object} - An object containing the list of users and the total count
   */
  async getUserList(req) {
    try {
      const {
        query: {
          search, status, sortBy, sortType, limit, offset, fromDate, toDate,
        },
      } = req;
      const sortFields = [
        'firstName',
        'lastName',
        'email',
        'createdAt',
        'status',
      ];
      let orderBy = [['createdAt', 'DESC']];
      let fullNameWhere = {};
      let where = { isEmailVerified: 1 };

      if (search) {
        fullNameWhere = Sequelize.where(
          Sequelize.fn(
            'CONCAT_WS',
            ' ',
            Sequelize.col('first_name'),
            Sequelize.fn('coalesce', Sequelize.col('last_name'), ''),
          ),
          {
            [Op.like]: `%${search}%`,
          },
        );
        fullNameWhere = { [Op.or]: [{ fullNameWhere }, { email: { [Op.like]: `%${search}%` } }, { phoneNumber: { [Op.like]: `%${search}%` } }] };
      }
      const startDate = new Date(fromDate).setUTCHours(0, 0, 0, 0);
      const endDate = new Date(toDate).setUTCHours(29, 59, 59, 999);
      if (fromDate && toDate) {
        where.createdAt = { [Op.and]: [{ [Op.gte]: startDate }, { [Op.lte]: endDate }] };
      }
      if (status) {
        where.status = status;
      }
      if (
        sortBy && sortType && sortFields.includes(sortBy)
      ) {
        orderBy = [[sortBy, sortType]];
      }
      where = { [Op.and]: [fullNameWhere, where] };
      const attributes = { exclude: ['password'] };
      const userScope = [
        { method: ['user', { where, havingWhere: {}, attributes }] },
        { method: ['userRole', { whereRole: { role: { [Op.ne]: commonConstant.ROLE.ADMIN } } }] },
      ];
      return await user.scope(userScope).findAndCountAll({
        order: orderBy,
        limit: parseInt(limit || 10),
        offset: parseInt(offset || 0),
      });
    } catch (error) {
      logMessage.userErrorMessage('userList', { error, data: req?.body });
      throw Error(error);
    }
  },

  /**
   * Check if an email, mobile number, or username already exists.
   * @param {Object} where - Conditions to check for existing user data
   * @returns {Object} - The found user data if exists
   */
  async checkUserEmailExists(where) {
    try {
      const havingWhere = {
        [Op.or]: [
          { email: { [Op.eq]: where.email } },
          {
            username: {
              [Op.eq]: where.username,
            },
          },
          {
            phoneNumber: { [Op.eq]: where.phoneNumber },
          },
        ],
      };
      const whereRole = {};
      const whereUser = {};
      if (where.userId) {
        whereUser.id = { [Op.ne]: where.userId };
      }
      if (!where.role) {
        whereRole.role = { [Op.in]: [commonConstant.ROLE.ADMIN] };
      }
      const userScope = [
        { method: ['user', { where: whereUser, havingWhere }] },
        { method: ['userRole', { whereRole }] },
      ];
      return await user.scope(userScope).findOne();
    } catch (error) {
      logMessage.userErrorMessage('emailExist', { error });
      throw Error(error);
    }
  },

  /**
   * Update the status of a user.
   * @param {Object} data - Data containing the user ID and new status
   * @returns {Object} - The updated user data
   */
  async updateUserStatus(data) {
    try {
      const where = { id: data.id };
      const userData = await user.findOne({ where });
      const userStatus = data.status;
      return await userData.update({ status: userStatus });
    } catch (error) {
      logMessage.userErrorMessage('userUpdateStatus', {
        error,
        data,
      });
      throw Error(error);
    }
  },

  /**
   * Get user details for a specific user by specified conditions.
   * @param {Object} where - Conditions to find a user
   * @returns {Object} - The found user
   */
  async getUserDetail(where) {
    try {
      const havingWhere = where.email ? { email: where.email } : {};
      const attributes = { exclude: ['password', 'verifyToken'] };
      const userScope = [
        { method: ['user', { where, havingWhere, attributes }] },
        { method: ['userRole', { whereRole: {} }] },
      ];
      const userData = await user.scope(userScope).findOne({ where });
      return userData;
    } catch (error) {
      logMessage.userErrorMessage('userDetails', { error });
      throw Error(error);
    }
  },

  /**
   * Send an OTP to the user's email for verification.
   * @param {Object} req - Request object with the user's email
   * @returns {Object} - A status message or true if successful
   */
  async sendOtp(req) {
    try {
      const { body: { email } } = req;
      const userData = await this.findOne({ email });
      if (userData?.userRole?.role?.role === commonConstant.ROLE.ADMIN) {
        return { status: 'invalid_email' };
      }
      const data = {
        to: email,
      };
      const otp = utility.generateOtp();
      data.otp = otp;
      await userOtp.create({ email, otp });
      await Email.otpSend(data);
      return true;
    } catch (error) {
      logMessage.accountErrorMessage('otpSend', { error, data: req?.body });
      throw Error(error);
    }
  },

  /**
   * Verify an OTP sent to the user's email.
   * @param {Object} req - Request object with the OTP, email, and user details
   * @returns {Object} - The user's data with a token if verification is successful
   */
  async verifyOtp(req) {
    try {
      const {
        body: {
          otp, email, deviceId, deviceType, firebaseToken,
        },
      } = req;
      const otpResult = await userOtp.findOne({ where: { email } });
      if (otpResult) {
        if (otpResult.otp === otp) {
          const havingWhere = { email };
          const attributes = { exclude: ['updatedAt', 'password'] };
          const userScope = [
            { method: ['user', { where: {}, havingWhere, attributes }] },
            { method: ['userRole', { whereRole: {} }] },
          ];
          const foundUserData = await user.scope(userScope).findOne();
          if (!foundUserData) {
            const userCreateData = {
              email,
              isEmailVerified: 0,
            };
            const userData = await user.create(userCreateData);
            const roleData = await role.findOne({ where: { role: commonConstant.ROLE.USER } });
            if (userData) {
              const roleCreateData = {
                userId: userData.id,
                roleId: roleData.id,
              };
              await userRole.create(roleCreateData);
            }
            await userOtp.destroy({ where: { email } });
            return { userId: userData.id, email: userData.email };
          }
          if (foundUserData && foundUserData?.isEmailVerified === 1) {
            const { ...userData } = foundUserData.get();
            const token = jwt.createToken(userData);
            const deviceData = {
              userId: foundUserData.id,
              token,
              deviceId,
              deviceType,
              firebaseToken,
              userResult: foundUserData,
            };
            await userOtp.destroy({ where: { email } });
            if (foundUserData && foundUserData.status !== commonConstant.STATUS.ACTIVE) {
              throw utility.customError(req, 'ACCOUNT_INACTIVE', 1);
            }
            await accountRepository.addUpdateUserDevice(deviceData);
            const finalData = await user.scope(userScope).findOne();
            const { ...finalUserData } = finalData.get();
            return { token, ...finalUserData };
          }
          await userOtp.destroy({ where: { email } });
          if (foundUserData && foundUserData.status !== commonConstant.STATUS.ACTIVE) {
            throw utility.customError(req, 'ACCOUNT_INACTIVE', 1);
          }
          return {
            isEmailVerified: foundUserData?.isEmailVerified,
            userId: foundUserData?.id,
            email: foundUserData?.email,
          };
        }
        return { status: commonConstant.STATUS.INVALID };
      }
      throw utility.customError(req, 'OTP_EXPIRED', 1);
    } catch (error) {
      logMessage.accountErrorMessage('otpVerify', { error });
      throw (error.errorCode) ? error : Error(error);
    }
  },

  /**
   * Verify a user's phone OTP.
   * @param {Object} req - Request object with the OTP and user data
   * @returns {Object} - The updated user data
   */
  async verifyPhoneOtp(req) {
    try {
      const {
        body: { otp },
      } = req;
      const userData = req?.user;
      if (userData?.otp === otp) {
        const data = {
          isPhoneNumberVerified: 1,
        };
        await user.update(data, { where: { id: userData.id } });
        return await this.findOne({ id: userData.id });
      }
      throw utility.customError(req, 'INVALID_OTP', 1);
    } catch (error) {
      logMessage.accountErrorMessage('otpVerify', { error });
      throw (error.errorCode) ? error : Error(error);
    }
  },
};
