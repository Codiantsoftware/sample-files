import { UserAuthServices } from '@/services/User/Auth/index.services'
import logger from '@/utils/logger'

export const authModule = {
  namespaced: true,

  // Initial state of the authentication module
  state: () => ({
    user: {},
    userData: {},
    authStatus: false,
    authToken: null,
    isAdmin: false
  }),

  mutations: {
    // Mutation to set the user object in the state
    setUser(state, user) {
      state.user = user
    },

    // Mutation to set the authentication token in the state
    setAuthToken(state, token) {
      state.authToken = token
    },

    // Mutation to set the authentication status in the state
    setAuthStatus(state) {
      state.authStatus = true
    },

    // Mutation to clear authentication data from the state
    clearAuthData(state) {
      state.user = {}
      state.authToken = null
      state.authStatus = false
    },

    // Mutation to set the user data in the state
    setUserData(state, userData) {
      state.userData = userData
    }
  },

  actions: {
    // Action to handle login of the user
    loginUser({ commit }, { data, token }) {
      commit('setUser', data)
      commit('setAuthToken', token)
      commit('setAuthStatus')
    },
    // Action to handle logout of the user
    logoutUser({ commit }) {
      commit('clearAuthData')
    },
    async fetchUserData({ commit }) {
      try {
        // Call your API service function to fetch user data
        const userData = await UserAuthServices.accountInfo()
        // Commit a mutation to update the userData state
        commit('setUserData', userData)
      } catch (error) {
        // Handle error if needed
        logger(error)
      }
    }
  },
  
  getters: {
    // Getter to check if the user is logged in
    isLoggedIn: (state) => !!state.authToken,
    // Getter to get the user info
    getUserInfo: (state) => state.user,
    // Getter to get the user details
    getUserDetails: (state) => state.userData,
    // Getter to get the authentication status
    authStatus: (state) => {
      return state.authStatus
    }
  }
}
