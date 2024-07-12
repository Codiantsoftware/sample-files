// Importing necessary modules and components
import { UserAuth } from "apiEndPoints";
import { logger } from "utils";
import APIrequest from "../../axios"; 

// Defining a module containing functions related to user authentication services
export const UserAuthServices = {
  /**
   * Function to handle user sign-in action
   * @param {Object} bodyData - Data for user login
   * @returns {Promise} - Resolves with the API response if successful, otherwise throws an error
   */
  userLogin: async (bodyData) => {
    try {
      const payload = {
        ...UserAuth.accountLogin,
        bodyData,
      };
      
      return await APIrequest(payload);
    } catch (error) {
      // Logging and rethrowing the error if an exception occurs during the process
      logger(error);
      throw error;
    }
  },

  /**
   * Function to handle user verification action
   * @param {Object} bodyData - Data for user verify
   * @returns {Promise} - Resolves with the API response if successful, otherwise throws an error
   */
  userVerify: async (bodyData) => {
    try {
      const payload = {
        ...UserAuth.accountVerify,
        bodyData,
      };      
      
      return await APIrequest(payload);
    } catch (error) {     
      // Logging and rethrowing the error if an exception occurs during the process 
      logger(error);
      throw error;
    }
  },

  /**
   * Function to handle user signup action
   * @param {Object} bodyData - Data for user signup
   * @returns {Promise} - Resolves with the API response if successful, otherwise throws an error
   */
  userSignUp: async (bodyData) => {
    try {
      const payload = {
        ...UserAuth.accountSignUp, 
        bodyData,
      };

      return await APIrequest(payload);;
    } catch (error) {
      // Logging and rethrowing the error if an exception occurs during the process
      logger(error);
      throw error;
    }
  },

  /**
   * Function to handle updating user profile
   * @param {Object} bodyData - Data for update user profile
   * @returns {Promise} - Resolves with the API response if successful, otherwise throws an error
   */
  updateUserProfile: async (bodyData, id) => {
    try {
      const payload = {
        ...UserAuth.updateProfile(id),
        bodyData,
      };

      return await APIrequest(payload);
    } catch (error) {
      // Logging and rethrowing the error if an exception occurs during the process
      logger(error);
      throw error;
    }
  },

  /**
   * Function to handle user logout action
   * @returns {Promise} - Resolves with the API response if successful, otherwise throws an error
   */
  userLogout: async () => {
    try {
      const payload = {
        ...UserAuth.accountLogout,
      };

      return await APIrequest(payload);
    } catch (error) {
      // Logging and rethrowing the error if an exception occurs during the process
      logger(error);
      throw error;
    }
  },

  /**
   * Function to handle updating user phone number
   * @param {Object} bodyData - Data for update phone number
   * @returns {Promise} - Resolves with the API response if successful, otherwise throws an error
   */
  updateUserPhoneNumber: async (bodyData) => {
    try {
      const payload = {
        ...UserAuth.updatePhoneNumber,
        bodyData,
      };

      return await APIrequest(payload);
    } catch (error) {
      // Logging and rethrowing the error if an exception occurs during the process
      logger(error);
      throw error;
    }
  },

  /**
   * Function to handle OTP verification action
   * @param {Object} bodyData - Data for OTP details
   * @returns {Promise} - Resolves with the API response if successful, otherwise throws an error
   */
  otpVerify: async (bodyData) => {
    try {
      const payload = {
        ...UserAuth.verifyOtp,
        bodyData,
      };

      return await APIrequest(payload);
    } catch (error) {
      // Logging and rethrowing the error if an exception occurs during the process
      logger(error);
      throw error;
    }
  },
};
