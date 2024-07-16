import APIrequest from "../../axios";
import { UserAuth } from "../../../apiEndPoints/User/index";

/**
 * Represents the body data required for authentication.
 *  @typedef {Object} AuthBodyData
 *  @property {string} email - The user's email.
 *  @property {string} password - The user's password.
 */
interface AuthBodyData {
  email: string;
  password: string;
}

/**
 * Object containing functions related to user authentication.
 * @namespace
 */
export const userAuth = {
  /**
   * Function to sign up a user.
   * @async
   * @function
   * @memberof userAuth
   * @param {AuthBodyData & { name: string }} bodyData - The body data for signing up, including the user's name.
   * @returns {Promise<any>} - A Promise that resolves with the API response.
   * @throws {Error} - Throws an error if the request fails.
   */
  userSignup: async (bodyData: AuthBodyData & { name: string } ) => {
    try {
      const payload = {
        ...UserAuth.userSignup,
        bodyData,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Function to sign in a user.
   * @async
   * @function
   * @memberof userAuth
   * @param {AuthBodyData} bodyData - The body data for signing in.
   * @returns {Promise<any>} - A Promise that resolves with the API response.
   * @throws {Error} - Throws an error if the request fails.
   */
  userSignIn: async (bodyData: AuthBodyData) => {
    try {
      const payload = {
        ...UserAuth.userSignin,
        bodyData,
      };
      const res = await APIrequest(payload);
      return res;
    } catch (error) {
      throw error;
    }
  },
};
