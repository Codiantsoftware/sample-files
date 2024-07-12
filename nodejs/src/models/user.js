import { Op } from 'sequelize';
import config from '../config';
import utility from '../services/utility';

const defaultUserImage = `${config.app.baseUrl}public/default-images/user.png`;

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'user',
    {
      firstName: {
        type: DataTypes.STRING(256),
      },
      lastName: {
        type: DataTypes.STRING(256),
      },
      username: {
        type: DataTypes.STRING(256),
        unique: {
          args: 'username',
          msg: 'The username is already taken!',
        },
      },
      email: {
        type: DataTypes.STRING(256),
      },
      password: {
        type: DataTypes.STRING,
      },
      countryCode: {
        type: DataTypes.STRING(256),
      },
      phoneNumber: {
        type: DataTypes.STRING(256),
        unique: {
          args: 'phoneNumber',
          msg: 'The phoneNumber is already taken!',
        },
      },
      passwordResetToken: {
        type: DataTypes.STRING(191),
      },
      profileImage: {
        type: DataTypes.STRING,
        set(val) {
          let tmpStr = val;
          tmpStr = tmpStr.replace(/\\/g, '/');
          this.setDataValue('profileImage', tmpStr);
        },
      },
      gender: {
        type: DataTypes.STRING(256),
      },
      dateOfBirth: {
        type: DataTypes.STRING(256),
      },
      socialId: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      type: {
        type: DataTypes.ENUM('facebook', 'google', 'email'),
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        defaultValue: 'active',
      },
      language: {
        type: DataTypes.STRING(256),
      },
      currency: {
        type: DataTypes.STRING(256),
      },
      stripeCustomerId: {
        type: DataTypes.STRING(256),
      },
      otp: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      whereYouLive: {
        type: DataTypes.TEXT,
      },
      describeYourself: {
        type: DataTypes.TEXT,
      },
      isEmailVerified: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      isPhoneNumberVerified: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0,
      },
      companyName: {
        type: DataTypes.STRING(256),
      },
      lastLogin: {
        type: DataTypes.DATE,
      },
      profileImageUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          const str = this.get('profileImage');
          return utility.getImage(str, defaultUserImage);
        },
      },
    },
    {
      underscored: true,
    },
  );

  user.addScope('user', (data) => ({
    where: {
      [Op.and]: [{ status: { [Op.ne]: 'deleted' } }, data.where],
    },
    having: data.havingWhere,
    attributes: data.attributes,
  }));

  user.addScope('userRole', (data) => ({
    include: [
      {
        model: sequelize.models.userRole,
        required: true,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        include: [
          {
            model: sequelize.models.role,
            where: data.whereRole,
            required: true,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
        ],
      },
    ],
  }));

  user.addScope('userVerification', () => ({
    include: [
      {
        model: sequelize.models.userVerification,
        attributes: { exclude: ['createdAt', 'updatedAt', 'id', 'userId'] },
        required: false,
      },
    ],
  }));

  user.associate = (models) => {
    user.hasOne(models.userRole, { foreignKey: 'userId', onDelete: 'cascade' });
  };
  return user;
};
