import profileRoute from "./Home/index";

/**
 * Generates an array of routes for the user profile section.
 * @returns {Array} An array containing route objects for the user profile.
 */
export default function route() {
  // Combine and return the routes for the user profile section
  return [...profileRoute()];
}
