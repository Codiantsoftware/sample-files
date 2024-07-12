import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { User } from "./user.model";
import { UserDevice } from "./user.device.model";
import config from "src/config";
import { UtilityService } from "src/services/utility";
import { EmailService } from "src/services/email.service";
import { LoggerService } from "src/services/logger.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly utilityService: UtilityService,
    private readonly emailService: EmailService,
    private readonly LoggerService: LoggerService
  ) {}

  /**
   *
   * @param {*}
   * @returns
   */
  async createUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    contact: string,
    status: "active" | "deactive" | "deleted",
    role: "user" | "admin"
  ) {
    try {
      // Check if the user with the provided email already exists
      const existingUser = await this.userModel.findOne({ where: { email } });

      if (existingUser) {
        throw new BadRequestException("Email already in use");
      }

      // Hash the user's password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create and return the new user
      return this.userModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        contact,
        status,
        role,
      });
    } catch (error) {
      this.LoggerService.error("Account signup error", error);
      throw Error(error);
    }
  }

  /**
   * Authenticates a user based on email and password.
   * @param {*} params - The parameters for authentication.
   * @returns {Object} User data along with a JWT token.
   * @throws {UnauthorizedException} Throws an UnauthorizedException if the credentials are invalid or the user account is deactivated.
   */

  async signIn(
    email: string,
    password: string,
    deviceType: "Android" | "Ios" | "Web",
    firebaseToken: string
  ) {
    try {
      const user = await this.userModel.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (user?.status === "active") {
        // Check if the provided password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
          // Generate a JWT token for the user
          const payload = {
            email: user.dataValues?.email,
            id: user.dataValues?.id,
          };
          const token = jwt.sign(payload, config.jwtSecret, {
            expiresIn: config.jwtExpireIn,
          });

          // Store user device information
          const deviceData = {
            userId: user.dataValues.id,
            token,
            deviceType,
            firebaseToken,
          };
          await this.addUpdateUserDevice(deviceData);
          // Return user data with the generated token
          const data = user.get();
          return {
            ...data,
            token,
          };
        } else {
          throw new UnauthorizedException("Invalid credentials");
        }
      } else {
        throw new UnauthorizedException("User Account is Deactivated");
      }
    } catch (error) {
      throw Error(error);
    }
  }

  /**
   * Adds or updates user device information based on the provided data.
   * @param {Object} data - Object containing user device information including userId, token, deviceType, and firebaseToken.
   */
  async addUpdateUserDevice(data: any) {
    try {
      const userDeviceToken = await this.getUserDeviceToken(data.userId);
      const { userId, token, deviceType, firebaseToken } = data;
      if (userDeviceToken) {
        // If user device information already exists, update it
        const newData = {
          token,
          firebaseToken,
          deviceType,
        };
        await this.updateUserDevice(userDeviceToken, newData);
      } else {
        // If user device information doesn't exist, add it
        const updateData = {
          userId,
          token,
          firebaseToken,
          deviceType,
        };
        await this.addUserDevice(updateData);
      }
    } catch (error) {
      this.LoggerService.error("Account add update user device error", error);
      throw Error(error);
    }
  }

  /**
   * @param {number} userId - The ID of the user.
   * @returns {Promise<any>} A Promise resolving to the user device token if found; otherwise, null.
   */
  async getUserDeviceToken(userId: number) {
    try {
      return await UserDevice.findOne({
        where: { userId },
      });
    } catch (error) {
      this.LoggerService.error("Account get user device token error", error);
      throw Error(error);
    }
  }
  async deleteUserDevice(userDeviceObject: any) {
    try {
      return await UserDevice.destroy({
        where: { id: userDeviceObject?.id },
      });
    } catch (error) {
      this.LoggerService.error("Account update user device error", error);
      throw Error(error);
    }
  }

  /**
   * Adds user device information to the database.
   * @param {Object} data - The data containing user device information.
   * @returns {Promise<any>} A Promise resolving to the newly created user device entry.
   */
  async addUserDevice(data: object) {
    try {
      return await UserDevice.create(data);
    } catch (error) {
      this.LoggerService.error("Account add user device error", error);
      throw Error(error);
    }
  }

  /**
   * Updates user device information with the provided data.
   * @param {any} userDeviceObject - The user device object to update.
   * @param {any} data - The data containing updated user device information.
   */
  async updateUserDevice(userDeviceObject: any, data: any) {
    try {
      return await userDeviceObject.update(data);
    } catch (error) {
      this.LoggerService.error("Account update user device error", error);
      throw Error(error);
    }
  }

  /**
   * Find a user based on the provided criteria.
   * @param where The criteria to search for the user.
   * @returns The found user object.
   */
  async findOne(where: any) {
    return await this.userModel.findOne({ where });
  }

  /**
   * Update the profile information of the current user.
   * @param req The request object containing the user and profile data.
   * @returns The updated user profile.
   */
  async updateProfile(req: any) {
    try {
      const { body, user } = req;
      const userId = user.id;
      return await this.userModel.update(
        {
          firstName: body.firstName,
          lastName: body.lastName,
          contact: body.contact,
        },
        {
          where: { id: userId },
        }
      );
    } catch (error) {
      this.LoggerService.error("update profile error", error);
      throw Error(error);
    }
  }

  /**
   * Logout the current user by deleting their device token.
   * @param req The request object containing the user.
   * @returns A promise that resolves when the user is logged out.
   */
  async logoutUser(req: any) {
    try {
      const { user } = req;
      const userDevice = await this.getUserDeviceToken(user.id);

      if (userDevice) {
        return await this.deleteUserDevice(userDevice);
      }
    } catch (error) {
      this.LoggerService.error("user logout error", error);
      throw Error(error);
    }
  }

  /**
   * Generate a password reset token for the user with the provided email.
   * @param req The request object containing the user's email.
   * @returns The generated password reset token.
   */
  async generateForgetPasswordToken(req: any) {
    try {
      const token = this.utilityService.generateString();
      await this.userModel.update(
        { password_reset_token: token },
        { where: { email: req } }
      );
      return token;
    } catch (error) {
      this.LoggerService.error("generateForgetPasswordToken error", error);
      throw Error(error);
    }
  }

  /**
   * Create a new password for the user.
   * @param req The request object containing the user.
   */

  async forgetPassword(req: any) {
    try {
      const { user } = req;
      let email = user.email;
      const userResult = await this.userModel.findOne({
        where: { email: email },
      });
      if (userResult) {
        let token = await this.generateForgetPasswordToken(email);
        const data = {
          to: email,
          token: token,
        };
        return await this.emailService.sendForgetPasswordEmail(data);
      }
    } catch (error) {
      this.LoggerService.error("forget password error", error);
      console.log("it is error in createNewPassword method : ", error);
      throw Error(error);
    }
  }

  /**
   * Reset the user's password using the provided token and new password.
   * @param req The request object containing the token and new password.
   * @returns A promise that resolves when the password is reset.
   */
  async resetNewPassword(req: any) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      const user = await this.userModel.findOne({
        where: { password_reset_token: token },
      });

      if (user && newPassword === confirmPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return await this.userModel.update(
          {
            password: hashedPassword,
            password_reset_token: null,
          },
          { where: { email: user.dataValues.email } }
        );
      } else {
        return false;
      }
    } catch (error) {
      console.log("error ", error);
      this.LoggerService.error("reset password error ", error);
      throw Error(error);
    }
  }
}
