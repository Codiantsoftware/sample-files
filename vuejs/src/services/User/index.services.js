import APIrequest from '@/services/axios'
import Home from '@/apiEndPoints/User/Home/Home'
import logger from '@/utils/logger'

// Service functions related to user home and profile management.
export const UserHomeServices = {
  /**
   * Updates the user profile.
   * @param {Object} bodyData - Request payload for updating user profile.
   * @returns {Promise} A promise that resolves to the response data.
   */
  updateUserProfile: async (bodyData) => {
    try {
      const payload = {
        ...Home.updateProfile,
        bodyData
      }
      const res = await APIrequest(payload)
      return res
    } catch (error) {
      logger(error)
      throw error
    }
  },
  /**
   * Updates the user profile.
   * @param {Object} bodyData - Request payload for upload profile.
   * @returns {Promise} A promise that resolves to the response data.
   */
  uploadUserProfile: async (bodyData) => {
    try {
      const payload = {
        ...Home.imageUpload,
        bodyData,
        formHeaders: { 'content-type': 'multipart/form-data' }
      }
      const res = await APIrequest(payload)
      return res
    } catch (error) {
      logger(error)
      throw error
    }
  }
}
