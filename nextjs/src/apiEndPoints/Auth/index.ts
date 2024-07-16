/**
 * Configuration object for user authentication.
 * @typedef {Object} UserAuthConfigs
 * @property {string} url - The URL for the authentication endpoint.
 * @property {"POST"} method - The HTTP method used for the authentication request (always "POST").
 */
const UserAuthConfigs = {
  /**
   * Configuration for user signup.
   * @type {UserAuthConfig}
   */
  userSignup: {
    url: "/user/signUp",
    method: "POST" as const,
  },
  
  /**
   * Configuration for user signin.
   * @type {UserAuthConfig}
   */
  userSignin: {
    url: "/user/login",
    method: "POST" as const,
  },
};
export default UserAuthConfigs;
