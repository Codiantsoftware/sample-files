/* eslint-disable import/no-cycle */
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import winston from 'winston';
import Email from '../services/email';
import utility from '../services/utility';
import logMessage from '../logMessages/index';
import jwt from '../services/jwt';
import models from '../models';
import userRepository from './user-repository';
import constant from '../constant';

const { commonConstant } = constant;
const {
  user, userDevice,
} = models;

export default {
  /**
   * Check admin email and password for login
   * @param {Object} req
   * @returns {Object} - User data or login status
   */
  async checkLogin(req) {
    try {
      const {
        email, password, deviceType, deviceId, firebaseToken,
      } = req.body;
      const havingWhere = { email };
      const attributes = {
        exclude: ['passwordResetToken', 'createdAt', 'updatedAt'],
      };
      const userScope = [
        { method: ['user', { where: {}, havingWhere, attributes }] },
        { method: ['userRole', { whereRole: {} }] },
      ];
      const userResult = await user.scope(userScope).findOne();
      if (userResult && userResult.userRole.role.role === commonConstant.ROLE.ADMIN) {
        if (userResult.status === commonConstant.STATUS.ACTIVE) {
          const isPasswordMatch = await this.compareUserPassword(
            password,
            userResult.password,
          );
          if (isPasswordMatch) {
            const { ...userData } = userResult.get();
            const token = jwt.createToken(userData);
            const deviceData = {
              userId: userData.id,
              token,
              deviceId,
              deviceType,
              userResult,
              firebaseToken,
            };
            await this.addUpdateUserDevice(deviceData);
            return { token, ...userData };
          }
        } else {
          return { status: commonConstant.STATUS.INACTIVE };
        }
      }
      return { status: commonConstant.STATUS.INVALID };
    } catch (error) {
      logMessage.accountErrorMessage('accountLogin', {
        error,
        data: req?.body,
      });
      throw Error(error);
    }
  },

  /**
   * User signup
   * @param {Object} req
   * @returns {Object} - User data or signup status
   */
  async userSignup(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const {
        body: {
          userId, firstName, lastName, countryCode, phoneNumber,
          companyName, deviceId, deviceType, firebaseToken,
        },
        userInfo,
      } = req;
      const userUpdateData = {
        firstName,
        lastName,
        email: userInfo?.email,
        countryCode,
        phoneNumber,
        companyName,
        isEmailVerified: 1,
      };
      await user.update(
        userUpdateData,
        { where: { id: userId, email: userUpdateData.email } },
        { transaction },
      );
      await transaction.commit();
      const havingWhere = { email: userInfo?.email };
      const attributes = {
        exclude: ['passwordResetToken', 'createdAt', 'updatedAt'],
      };
      const userScope = [
        { method: ['user', { where: {}, havingWhere, attributes }] },
        { method: ['userRole', { whereRole: {} }] },
      ];
      const userResult = await user.scope(userScope).findOne();
      const { ...userData } = userResult.get();
      const token = jwt.createToken(userData);
      const deviceData = {
        userId: userData.id,
        token,
        deviceId,
        deviceType,
        firebaseToken,
        userInfo,
      };
      await this.addUpdateUserDevice(deviceData);
      const finalResult = await user.scope(userScope).findOne();
      const { ...finalUserData } = finalResult.get();
      return { token, ...finalUserData };
    } catch (error) {
      await transaction.rollback();
      logMessage.accountErrorMessage('accountSignup', {
        error,
        data: req?.body,
      });
      throw Error(error);
    }
  },

  /**
   * Add or update user device
   * @param {Object} data - Object containing user device data
   * @returns {Promise<void>} - Promise that resolves when user device is added or updated
   * @throws {Error} - Throws an error if there is an issue adding or updating user device
  */
  async addUpdateUserDevice(data) {
    try {
      const userDeviceToken = await this.getUserDeviceToken(data.userId);
      const {
        userId, token, deviceId, deviceType, firebaseToken,
      } = data;
      await user.update(
        { lastLogin: utility.getCurrentDateFormat(commonConstant.DATE_TIME_FORMATE.DATE_AND_TIME) },
        { where: { id: userId } },
      );
      if (userDeviceToken && data.userResult.userRole.role.role !== commonConstant.ROLE.ADMIN) {
        const newData = {
          token,
          deviceId,
          firebaseToken,
          deviceType,
        };
        await this.updateUserDevice(userDeviceToken, newData);
      } else {
        const updateData = {
          userId,
          token,
          deviceId,
          firebaseToken,
          deviceType,
        };
        await this.addUserDevice(updateData);
      }
    } catch (error) {
      logMessage.accountErrorMessage('addUpdateUserDevice', {
        error,
        data,
      });
      throw Error(error);
    }
  },

  /**
   * Compare user password with hash password
   * @param {String} password - User's password
   * @param {String} hashPassword - Hash of the user's password
   * @returns {Promise<boolean>} - Promise that resolves to true if passwords match, false otherwise
   * @throws {Error} - Throws an error if there is an issue comparing passwords
  **/
  async compareUserPassword(password, hashPassword) {
    try {
      let isPasswordMatch = '';
      if (password && hashPassword) {
        isPasswordMatch = await bcrypt.compare(password, hashPassword);
      }
      return !!isPasswordMatch;
    } catch (error) {
      logMessage.accountErrorMessage('comparePassword', { error });
      throw Error(error);
    }
  },

  /**
   * Get user device token from user id
   * @param {Number} userId
   * @returns {Object|null} - User device data or null if not found
   */
  async getUserDeviceToken(userId) {
    try {
      return await userDevice.findOne({
        where: { userId },
      });
    } catch (error) {
      logMessage.accountErrorMessage('userDeviceToken', { error });
      throw Error(error);
    }
  },

  /**
   * Update user device
   * @param {Object} userDeviceObject
   * @param {Object} data
  */
  async updateUserDevice(userDeviceObject, data) {
    try {
      return await userDeviceObject.update(data);
    } catch (error) {
      logMessage.accountErrorMessage('userDevice', { error, data });
      throw Error(error);
    }
  },

  /**
   * Add user device
   * @param {Object} data
  */
  async addUserDevice(data) {
    try {
      return await userDevice.create(data);
    } catch (error) {
      logMessage.accountErrorMessage('userDevice', { error, data });
      throw Error(error);
    }
  },

  /**
   * Get device detail by token
   * @param {String} token
   * @returns {Object|null} - Device data or null if not found
   */
  async getDeviceDetailByToken(token) {
    try {
      const where = { token };
      return await userDevice.findOne({ where });
    } catch (error) {
      logMessage.accountErrorMessage('userDeviceToken', { error });
      throw Error(error);
    }
  },

  /**
   * Admin forgot password API
   * @param {Object} req
   * @returns {Object|boolean} - Success status or false
   */
  async adminForgotPassword(req) {
    try {
      const { body: { email } } = req;
      const havingWhere = { email };
      const attributes = {};
      const userScope = [
        { method: ['user', { where: {}, havingWhere, attributes }] },
        { method: ['userRole', { whereRole: {} }] },
      ];
      const userResult = await user.scope(userScope).findOne();

      if (userResult && userResult.userRole.role.role === commonConstant.ROLE.ADMIN) {
        if (userResult.status === commonConstant.STATUS.ACTIVE) {
          req.forgotUser = userResult;
          const data = {
            to: userResult.email,
            name: `${userResult.firstName} ${userResult.lastName}`,
          };
          const result = await this.generatePasswordResetToken(req);
          data.token = result.passwordResetToken;
          return await Email.forgotPassword(data)
            .then(() => ({ status: 'sent' }))
            .catch((error) => ({ status: 'send_error', error }));
        }
        return { status: commonConstant.STATUS.INACTIVE };
      }
      return false;
    } catch (error) {
      logMessage.accountErrorMessage('forgotPassword', {
        error,
        data: req?.body,
      });
      throw Error(error);
    }
  },

  /**
   * Reset admin password API
   * @param {Object} req
   * @returns {Object|boolean} - Success status or false
   */
  async resetAdminPassword(req) {
    try {
      const { token, newPassword } = req.body;
      const userResult = await userRepository.findOne({
        passwordResetToken: token,
      });
      if (userResult) {
        if (userResult) {
          await userRepository.updatePassword(userResult, newPassword);
          return { status: commonConstant.STATUS.UPDATED };
        }
        return { status: commonConstant.STATUS.INACTIVE };
      }
      return false;
    } catch (error) {
      logMessage.accountErrorMessage('resetPassword', {
        error,
        data: req?.body,
      });
      throw Error(error);
    }
  },

  /**
   * Reset password API
   * @param {Object} req
   * @returns {Object|boolean} - Success status or false
   */
  async resetPassword(req) {
    try {
      const {
        phoneNumberCountryCode, phoneNumber, otp, newPassword,
      } = req.body;
      const verificationOtp = otp;
      const userResult = await userRepository.findOne({
        phoneNumberCountryCode,
        phoneNumber,
        verificationOtp,
      });
      if (userResult) {
        if (userResult.status === commonConstant.STATUS.ACTIVE) {
          await userRepository.updatePassword(userResult, newPassword);
          return { status: commonConstant.STATUS.UPDATED };
        }
        return { status: commonConstant.STATUS.INACTIVE };
      }
      return false;
    } catch (error) {
      logMessage.accountErrorMessage('resetPassword', {
        error,
        data: req?.body,
      });
      throw Error(error);
    }
  },

  /**
   * Generate password reset token
   * @param {Object} req
   * @returns {Object} - Token data
   */
  async generatePasswordResetToken(req) {
    const { forgotUser } = req;
    try {
      const token = utility.generateRandomString(32);
      const userData = { passwordResetToken: token };
      await forgotUser.update(userData);
      return userData;
    } catch (error) {
      logMessage.accountErrorMessage('resetPasswordToken', { error });
      throw Error(error);
    }
  },

  /**
   * Update Profile Image
   * @param {Object} req
   * @returns {Object} - Updated user data
  */
  async updateProfileImage(req) {
    try {
      const bodyData = req.body;
      const where = { id: req.user.id };
      const userData = await user.findOne({ where });
      return await userData.update({ profileImage: bodyData.profileImage });
    } catch (error) {
      logMessage.accountErrorMessage('updateProfileImage', {
        error,
        data: req?.body,
      });
      throw Error(error);
    }
  },

  /**
   * Get winston file list
   * @param {String} dirName
   * @returns {Array} - List of file paths
   */
  async getFileList(dirName) {
    const files = [];
    const items = fs.readdirSync(dirName, { withFileTypes: true });
    items.forEach(async (item) => {
      if (item.isDirectory()) {
        files.push(...(await this.getFileList(`${dirName}/${item.name}`)));
      } else {
        files.push(`${dirName}/${item.name}`);
      }
    });
    return files;
  },

  /**
   * Get log and count winston
   * @param {object} req
   * @returns {Object} - Log data and count
   */
  async getWinstonQuery(fileName, options) {
    try {
      winston.configure({
        transports: [new winston.transports.File({ filename: fileName })],
      });
      return new Promise((resolve, reject) => {
        winston.query(options, (error, results) => {
          if (error) {
            logMessage.accountErrorMessage('winstonQuery', { error, data: fileName });
            reject(error);
          }
          resolve(results);
        });
      });
    } catch (error) {
      logMessage.accountErrorMessage('winstonQuery', { error, data: fileName });
      throw Error(error);
    }
  },

  /**
   * Winston logs path
   * @returns {Object} - Log file paths and count
   */
  async getWinstonLogsPath() {
    try {
      const data = [];
      const logsPath = path.join(__dirname, '../logs');
      const items = await this.getFileList(logsPath);
      items.forEach((item) => {
        if (path.extname(item) === '.log') {
          data.push({
            key: item.split('logs/')[1],
            value: item.split('logs')[1],
          });
        }
      });
      return { rows: data.length > 0 ? data.reverse() : [], count: data.length };
    } catch (error) {
      logMessage.accountErrorMessage('logsPath', { error });
      throw Error(error);
    }
  },

  /**
   * Get log winston
   * @param {object} queryData
   * @returns {Object} - Log data and count
   */
  async getWinstonLogs(queryData) {
    try {
      const {
        fileName, limit, offset, order, startDate, endDate, level,
      } = queryData;
      const options = {
        order: order || 'DESC',
      };
      const filePath = `${path.join(__dirname, '../logs')}${fileName}`;
      options.rows = 100000000;
      options.from = '2000-11-22';
      // Default log for yesterday and today show
      if (startDate) {
        options.from = startDate; // Date format 2013-08-11 00:00:00.000 accepted
      }
      if (endDate) {
        options.until = endDate; // Date format 2013-08-11 00:00:00.000 accepted
      }
      if (level) {
        options.level = level;
      }
      const count = await this.getWinstonQuery(filePath, options);
      options.limit = parseInt(limit, 10) || 10;
      options.start = parseInt(offset, 10) || 0;
      delete options.rows;
      const rows = await this.getWinstonQuery(filePath, options);
      return { rows: rows?.file, count: count?.file?.length ?? 0 };
    } catch (error) {
      logMessage.accountErrorMessage('logs', { error, data: queryData });
      throw Error(error);
    }
  },

  /**
   * Get level count
   * @param {object} queryData
   * @returns {Object} - Log level counts
   */
  async getWinstonLevelCount(queryData) {
    try {
      const { fileName } = queryData;
      const options = { rows: 100000000, from: '2000-11-22' };
      const filePath = `${path.join(__dirname, '../logs')}${fileName}`;
      const errorCount = await this.getWinstonQuery(filePath, {
        ...options,
        level: 'error',
      });
      const warnCount = await this.getWinstonQuery(filePath, {
        ...options,
        level: 'warn',
      });
      const infoCount = await this.getWinstonQuery(filePath, {
        ...options,
        level: 'info',
      });
      const httpCount = await this.getWinstonQuery(filePath, {
        ...options,
        level: 'http',
      });
      const verboseCount = await this.getWinstonQuery(filePath, {
        ...options,
        level: 'verbose',
      });
      const debugCount = await this.getWinstonQuery(filePath, {
        ...options,
        level: 'debug',
      });
      const sillyCount = await this.getWinstonQuery(filePath, {
        ...options,
        level: 'silly',
      });
      return {
        errorCount: errorCount?.file?.length ?? 0,
        warnCount: warnCount?.file?.length ?? 0,
        infoCount: infoCount?.file?.length ?? 0,
        httpCount: httpCount?.file?.length ?? 0,
        verboseCount: verboseCount?.file?.length ?? 0,
        debugCount: debugCount?.file?.length ?? 0,
        sillyCount: sillyCount?.file?.length ?? 0,
      };
    } catch (error) {
      logMessage.accountErrorMessage('logs', { error, data: queryData });
      throw Error(error);
    }
  },

};
