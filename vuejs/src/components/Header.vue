<template>
  <!-- Layout header component -->
  <a-layout-header style="background: #e9e9f8; padding: 0">
    <!-- Header content container -->
    <div class="header-content">
      <!-- Logo and welcome message -->
      <div class="logo">
        <b>Welcome: {{ userName }}</b>
      </div>
      <!-- Navigation links -->
      <div class="nav-links">
        <!-- Button for logout action -->
        <Button @click="logout">Logout</Button>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup>
import router from '@/router'
import { Button } from 'ant-design-vue'
import store from '@/stores/store'
import { UserAuthServices } from '@/services/User/Auth/index.services'
import modalNotification from '@/utils/notification'
import logger from '@/utils/logger'
import { removeLocalStorageToken } from '@/utils/common.util'
import { onMounted } from 'vue'
import { ref } from 'vue'
import { watch } from 'vue'

// Reactive reference to name data
const userName = ref(store.state.auth?.userData?.data?.firstName)

// Watch for changes in  data
watch(
  () => store.state.auth?.userData?.data?.firstName,
  (newFirstName) => {
    // Update the name when the data changes
    userName.value = newFirstName
  }
)

// Logout method
const logout = async () => {
  try {
        // Make an asynchronous request to logout the user
    const response = await UserAuthServices.userLogout()
    const { success, message } = response
    if (success) {
      store.dispatch('auth/logoutUser')
      router.push({ name: 'auth.login' })
      modalNotification({
        type: 'success',
        message
      })
      removeLocalStorageToken()
    }
  } catch (error) {
    logger(error)
  }
}
const getData = () => {
  try {
    store.dispatch('auth/fetchUserData')
  } catch (error) {
    logger(error)
  }
}
onMounted(getData)
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links a {
  margin-left: 20px;
  color: #333;
  text-decoration: none;
}

.nav-links a:hover {
  text-decoration: underline;
}
</style>
