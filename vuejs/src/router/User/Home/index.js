import routesMap from '@/routeControl/userRouteMap'
import Updateprofile from '@/views/User/Updateprofile.vue'
import Dashboard from '@/views/User/Dashboard.vue'

/**
 * Generates an array of route objects for the user home page.
 * @returns {Array} An array containing a route object for the user home page.
 */
export default function route() {
  return [
    // User Home Route
    {
      path: routesMap.HOME.path,
      name: 'Home',
      key: routesMap.HOME.path,
      meta: {
        auth: true, // Requires authentication
        isFrontend: true, // Frontend route
        breadcrumb: 'Dashboard'
      },
      component: Dashboard // Component to be rendered for the user home page
    },

    // Update Profile Route
    {
      path: routesMap.UPDATE_PROFILE.path,
      name: 'Update Profile',
      key: routesMap.UPDATE_PROFILE.path,
      meta: {
        auth: true, // Requires authentication
        isFrontend: true, // Frontend route
        breadcrumb: 'Update-Profile'
      },
      component: Updateprofile // Component to be rendered for the update profile page
    }
  ]
}
