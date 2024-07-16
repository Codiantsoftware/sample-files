import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";

/**
 * Defines the shape of the authentication state within the Redux store.
 * @typedef {Object} AuthState
 * @property {boolean} isLoggedIn - Indicates if the user is logged in.
 * @property {{ name: string; email: string; token: string; userName: string;phoneNumber: string;} | null} user - Stores the current user's information.
 */
interface AuthState {
  isLoggedIn: boolean;
  auth: {
    userId: number;
    name: string;
    email: string;
    token: string;
    userName: string;
    phoneNumber: string;
  } | null;
}

/** The initial state for the authentication slice of the Redux store. */
const initialState: AuthState = {
  isLoggedIn: false,
  auth: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Action to handle user login.
     * @param {AuthState} state - The current state of the auth slice.
     * @param {PayloadAction<{ name: string;  email: string, token:string }>} action - The action object containing the user's data.
     */
    auth: (
      state,
      action: PayloadAction<{
        userId: number;
        name: string;
        email: string;
        token: string;
        userName: string;
        phoneNumber: string;
      }>,
    ) => {
      state.isLoggedIn = true;
      state.auth = action.payload;
    },

    /**
     * Action to handle user logout.
     * @param {AuthState} state - The current state of the auth slice.
     */
    logout: (state) => {
      state.isLoggedIn = false;
      state.auth = null;
    },

  },
});

export const { auth, logout } = authSlice.actions;

export const selectAuth = (state:any) => state.auth;

export const authReducer = authSlice.reducer;
