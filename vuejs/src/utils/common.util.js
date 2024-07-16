import config from '@/config'
import CryptoJS from 'crypto-js'

/**
 * Sets the token in the session storage after encrypting it.
 * @param {string} token - The token to be stored in session storage.
 */
export const setSessionStorageToken = (token) => {
  sessionStorage.setItem(
    `${config.NAME_KEY}:token`,
    CryptoJS.AES.encrypt(token, `${config.NAME_KEY}-token`).toString()
  )
}

/**
 * Removes the token from the local storage and navigates to a specific path if provided.
 * @param {Function} navigate - The navigate function from React Router.
 */
export const removeLocalStorageToken = (navigate) => {
  if (localStorage.getItem(`${config.NAME_KEY}:token`)) {
    localStorage.setItem(`${config.NAME_KEY}:token`, null)
  }
  if (navigate) {
    navigate('/')
  }
}

/**
 * Retrieves the token from the session storage and decrypts it.
 * @returns {string|boolean} - The decrypted token or false if not found.
 */
export const getSessionStorageToken = () => {
  const ciphertext = sessionStorage.getItem(`${config.NAME_KEY}:token`)
  if (ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, `${config.NAME_KEY}-token`)
    return bytes.toString(CryptoJS.enc.Utf8)
  }
  return false
}

/**
 * Sets the token in the local storage after encrypting it.
 * @param {string} token - Token to be stored in local storage.
 */
export const setLocalStorageToken = (token) => {
  localStorage.setItem(
    `${config.NAME_KEY}:token`,
    CryptoJS.AES.encrypt(token, `${config.NAME_KEY}-token`).toString()
  );
};

/**
 * Retrieves and decrypts the token from local storage.
 * @returns {string|boolean} - Decrypted token or false if not found.
 */
export const getLocalStorageToken = () => {
  // localStorage.setItem(config.NAME_KEY)
  const token = localStorage.getItem(`${config.NAME_KEY}:token`)
  if (token) {
    const bytes = CryptoJS.AES.decrypt(token, `${config.NAME_KEY}-token`)
    return bytes.toString(CryptoJS.enc.Utf8) || true
  }
  return false
}

/**
 * Removes the token from the session storage.
 */
export const removeSessionStorageToken = () => {
  if (sessionStorage.getItem(`${config.NAME_KEY}:token`)) {
    sessionStorage.setItem(`${config.NAME_KEY}:token`, null)
  }
}
