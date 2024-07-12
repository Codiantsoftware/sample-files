import jwt from 'jsonwebtoken';
import config from '../config';

export default {
  /**
   * Create a JSON Web Token (JWT) from the provided payload.
   * @param {object} payload - The data to be included in the JWT.
   * @returns {string} The JWT token.
   */
  createToken(payload) {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpireIn,
    });
  },

  /**
   * Verify and decode a JSON Web Token (JWT).
   * @param {string} token - The JWT token to be verified.
   * @returns {object} The decoded payload from the JWT.
   */
  verifyToken(token) {
    return jwt.verify(token, config.jwtSecret, {
      expiresIn: config.jwtExpireIn,
    });
  },

  /**
   * Decode a JSON Web Token (JWT) without verification.
   * @param {string} token - The JWT token to be decoded.
   * @returns {object} The decoded payload from the JWT.
   */
  decodeToken(token) {
    return jwt.decode(token, {
      complete: true,
    });
  },
};
