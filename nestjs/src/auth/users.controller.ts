// user authentication controller
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UsePipes,
  Req,
  Res,
  UseGuards,
  Get,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JoiValidationPipe } from "./validation/joi-validation.pipe";
import { loginSchema, userSchema } from "./validation/user-validation.schema";
import { AuthGaurd } from "src/middleware/auth.middleware ";
import { Request, Response } from "express";
import { LoggerService } from "src/services/logger.service";

@Controller("auth")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly loggerService: LoggerService
  ) {}

  /**
   * Registers a new user.
   * @param {Object} body The request body containing user information.
   * @returns {Object} A message indicating successful registration along with the newly created user.
   * @throws {HttpException} Throws a BadRequest exception if registration fails.
   */

  @Post("signup")
  @UsePipes(new JoiValidationPipe(userSchema))
  async signUp(
    @Body() { firstName, lastName, email, password, contact, status, role }
  ) {
    try {
      // Call the UsersService to create a new user
      const newUser = await this.usersService.createUser(
        firstName,
        lastName,
        email,
        password,
        contact,
        status,
        role
      );
      return { message: "User registered successfully", user: newUser };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Login user.
   * @param {Object} body The request body containing user information.
   * @returns {Object} A message indicating successful login.
   * @throws {HttpException} Throws a BadRequest exception if login failed.
   */

  @Post("signin")
  @UsePipes(new JoiValidationPipe(loginSchema))
  async signIn(@Body() { email, password, deviceType, firebaseToken }) {
    try {
      // Call the UsersService to sign in the user
      const user = await this.usersService.signIn(
        email,
        password,
        deviceType,
        firebaseToken
      );
      if (user?.token) {
        this.loggerService.log("User signed in successfully");
        return { message: "User signed in successfully", data: user };
      } else if (user.status === "deactive") {
        // this.loggerService.error('Account is Deactivated', user.status)
        return { message: "Account is Deactivated", data: [] };
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Update user profile.
   * @param body - Request body containing user profile data.
   * @returns Object containing success message or failure message.
   */
  @Post("update-profile")
  @UseGuards(AuthGaurd)
  async updateProfile(@Req() req: Request, @Res() res: Response) {
    try {
      let result = await this.usersService.updateProfile(req);
      if (result) {
        res
          .status(HttpStatus.OK)
          .json({ success: true, message: "updated successfully" });
      } else {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ success: false, message: "update failed" });
      }
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ data: null, success: false, error: error });
    }
  }

  /**
   * Logout user.
   * @param req - Request object.
   * @returns Object containing success message or failure message.
   */
  @Get("logout")
  @UseGuards(AuthGaurd)
  async logoutUser(@Req() req: Request, @Res() res: Response) {
    try {
      const userDevice = await this.usersService.logoutUser(req);
      if (userDevice) {
        res
          .status(HttpStatus.OK)
          .json({ success: true, message: "LOGOUT_SUCCESS" });
      } else {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ success: false, message: "USER_NOT_FOUND" });
      }
    } catch (error) {
      console.log("error : ", error);
    }
  }

  /**
   * Forget password.
   * @param req - Request object.
   */
  @Post("forget-password")
  @UseGuards(AuthGaurd)
  async createNewPassword(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.usersService.forgetPassword(req);
      if (result) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: "MAIL_SENT_SUCCESSFULLY" });
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "UNABLE_TO_SEND_MAIL" });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Reset user password.
   * @param body - Request body containing token, new password, and confirm password.
   */
  @Post("reset-password")
  @UseGuards(AuthGaurd)
  async resetNewPassword(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.usersService.resetNewPassword(req);
      if (result) {
        return res
          .status(HttpStatus.OK)
          .json({ success: true, message: "PASSWORD_RESET_SUCCESSFULLY" });
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "USER_NOT_FOUND" });
      }
    } catch (error) {
      console.log("it is error in reset password controller :", error);
    }
  }
}
