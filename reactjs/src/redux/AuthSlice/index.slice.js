// Importing necessary modules and components
import { createSlice } from "@reduxjs/toolkit";

import moduleRoutesMap from "routeControl";
import { removeLocalStorageToken } from "utils";
import logger from "utils/logger";

// Creating a slice for managing authentication-related state in Redux
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    userData: {},         // User data stored in state
    adminAuth: {},        // Admin authentication data stored in state
    sideBarKey: "0",       // Current sidebar key stored in state
    forgetPassword: {},    // Data related to forget password functionality stored in state
    verifyData: {},        // Data related to verification stored in state
    signupData: {},        // Data related to user signup stored in state
  },
  reducers: {
    /**
     * Action to update user data in state on login
     * @param {*} state represents the current state of the application
     * @param {*} action represents the action that has been dispatched
     * @returns return an object literal
     */
    loginAction: (state, action) => ({
      ...state,
      userData: { ...action.payload },
      verifyData: {},
      signupData: {},
    }),

    /**
     * Action to update signup data in state
     * @param {*} state represents the current state of the application
     * @param {*} action represents the action that has been dispatched
     * @returns return an object literal
     */
    signupDataAction: (state, action) => ({
      ...state,
      signupData: { ...action.payload },
    }),

    /**
     * Action to clear user data and reset sidebar on logout
     * @param {*} state represents the current state of the application
     * @returns return an object literal
     */
    logoutAction: (state) => {
      return (state = {
        ...state,
        userData: {},
        sideBarKey: "0",
      });
    },

    /**
     * Action to update verification data in state
     * @param {*} state represents the current state of the application
     * @param {*} action represents the action that has been dispatched
     * @returns return an object literal
     */
    verifyLoginAction: (state, action) => {
      return (state = {
        ...state,
        verifyData: { ...action.payload },
      });
    },

    /**
     * Action to update forget password data in state
     * @param {*} state represents the current state of the application
     * @param {*} action represents the action that has been dispatched
     * @returns return an object literal
     */
    forgetpasswordAction: (state, action) => {
      return (state = {
        ...state,
        forgetPassword: { ...action.payload },
      });
    },

    /**
     * Action to update forget password data with OTP verification
     * @param {*} state represents the current state of the application
     * @param {*} action represents the action that has been dispatched
     * @returns return an object literal
     */
    otpVerificationAction: (state, action) => {
      return (state = {
        ...state,
        forgetPassword: {
          ...state.forgetPassword,
          ...action.payload,
        },
      });
    },

    /**
     * Action to reset forget password data in state
     * @param {*} state represents the current state of the application
     * @returns return an object literal
     */
    resetPasswordAction: (state) => {
      return (state = {
        ...state,
        forgetPassword: {},
      });
    },

    /**
     * Action to update user data in state
     * @param {*} state represents the current state of the application
     * @param {*} action represents the action that has been dispatched     
     * @returns return an object literal
     */
    updateUserDataAction: (state, action) => {
      return (state = {
        ...state,
        userData: {
          ...state.userData,
          ...action.payload,
        },
      });
    },

    /**
     * Action to update admin authentication data in state
     * @param {*} state represents the current state of the application
     * @param {*} action represents the action that has been dispatched     
     * @returns return an object literal
     */
    updateAdminAuthAction: (state, action) => {
      return (state = {
        ...state,
        adminAuth: action.payload,
      });
    },

    /**
     * Action to update sidebar key in state
     * @param {*} state represents the current state of the application
     * @param {*} action represents the action that has been dispatched     
     * @returns return an object literal
     */
    sideBarAction: (state, action) => {
      return (state = {
        ...state,
        sideBarKey: action.payload,
      });
    },
  },
});

// Exporting actions from the slice
export const {
  loginAction,
  updateUserDataAction,
  logoutAction,
  forgetpasswordAction,
  sideBarAction,
  otpVerificationAction,
  verifyLoginAction,
  signupDataAction,
  resetPasswordAction,
  updateAdminAuthAction,
  updateChatStatus,
  callDataAction,
  callingDataAction,
  localStreamDataAction,
  onCallChannelIdsAction,
  onRemoveCallChannelIdsAction,
} = authSlice.actions;

// Exporting thunks for performing asynchronous actions
export const login = (data) => async (dispatch) => {
  try {
    dispatch(loginAction(data));
  } catch (error) {
    logger(error);
  }
};

// Handle user signup data update
export const signupData = (data) => async (dispatch) => {
  try {
    dispatch(signupDataAction(data));
  } catch (error) {
    logger(error);
  }
};

// Handle user verification login data update
export const verifyLogin = (data) => async (dispatch) => {
  try {
    dispatch(verifyLoginAction(data));
  } catch (error) {
    logger(error);
  }
};

// Handle forget password data update
export const forgetPassword = (data) => async (dispatch) => {
  try {
    dispatch(forgetpasswordAction(data));
  } catch (error) {
    logger(error);
  }
};

// Handle OTP verification data update
export const otpVerification = (data) => async (dispatch) => {
  try {
    dispatch(otpVerificationAction(data));
  } catch (error) {
    logger(error);
  }
};

// Handle password reset action
export const resetPassword = () => async (dispatch) => {
  try {
    dispatch(resetPasswordAction());
  } catch (error) {
    logger(error);
  }
};

// Handle user logout action
export const logout = (navigate, userRole) => async (dispatch) => {
  try {
    removeLocalStorageToken();
    localStorage.clear();
    dispatch(logoutAction());
    navigate(moduleRoutesMap[userRole].LOGIN.path);
  } catch (error) {
    logger(error);
  }
};

// Handle user data update
export const updateUserData = (data) => async (dispatch) => {
  try {
    dispatch(updateUserDataAction(data));
  } catch (error) {
    logger(error);
  }
};

// Handle admin authentication data update
export const updateAdminAuthData = (data) => async (dispatch) => {
  try {
    dispatch(updateAdminAuthAction(data));
  } catch (error) {
    logger(error);
  }
};

// Handle sidebar key update
export const updateSidebarKey = (data) => async (dispatch) => {
  try {
    dispatch(sideBarAction(data));
  } catch (error) {
    logger(error);
  }
};

// Handle call data update
export const updateCallData = (data) => async (dispatch) => {
  try {
    dispatch(callDataAction(data));
  } catch (error) {
    logger(error);
  }
};


// Selectors for retrieving specific pieces of state
export const selectUserData = (state) => state.auth.userData;
export const selectUserVerify = (state) => state.auth.verifyData;
export const forgetPasswordData = (state) => state.auth.forgetPassword;
export const getSidebarKey = (state) => state.auth.sideBarKey;
export const selectSignupData = (state) => state.auth.signupData;
export const getAdminAuthData = (state) => state.auth.adminAuth;


// Exporting the reducer for the slice
export default authSlice.reducer;
