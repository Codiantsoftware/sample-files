<template>
<!-- Login Form Section -->
<div class="grid grid-cols-1 md:grid-cols-none md:flex md:flex-row md:items-center md:justify-center h-screen">
    <!-- Image Column -->
    <div class="image-col md:w-1/2 h-screen overflow-hidden">
        <!-- Back Button -->
        <button @click="navigateToHome" class="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg">
            Back
        </button>
        <!-- Image Container -->
        <div class="image-container h-full flex items-center">
            <img src="https://www.officialgates.com/assets/images/banner-images/og_vue.png" alt="Side_Image" class="side-image object-cover h-full w-auto" />
        </div>
    </div>

    <!-- Form Column -->
    <div class="form-col md:w-1/2 overflow-auto">
        <!-- Login Form Content -->
        <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <!-- Company Logo -->
            <div class="sm:mx-auto sm:w-full sm:max-w-sm">
                <img class="mx-auto h-10 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
                <!-- Title -->
                <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    {{ t('loginTitle') }}
                </h2>
            </div>

            <!-- Login Form -->
            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <v-form :validation-schema="validationSchema" @submit="onSubmit" class="space-y-4">
                    <!-- Username Input -->
                    <div>
                        <TextInput :label="t('emailLabel')" type="email" name="emailOrMobile" required />
                    </div>

                    <!-- Password Input -->
                    <div>
                        <PasswordInput :label="t('passwordLabel')" type="password" name="password" autocomplete="current-password" required />
                    </div>

                    <!-- Forgot Password Link -->
                    <div class="text-sm">
                        <router-link to="/forgot-password" class="font float-end my-2 text-indigo-600 hover:text-indigo-500">{{ t('forgotPassword') }}</router-link>
                    </div>

                    <!-- Login Button -->
                    <div>
                        <CommonButton type="submit" class="my-custom-class" :buttonText="t('loginButton')" />
                    </div>
                </v-form>

                <!-- Signup Link -->
                <p class="mt-10 text-center text-sm text-gray-500">
                    {{ t('DontHaveAnAccount') }}
                    <router-link to="/signup" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                        {{ t('register') }}
                    </router-link>
                </p>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import PasswordInput from '@/components/Antd/PasswordInput.vue'
import TextInput from '@/components/Antd/TextInput.vue'
import CommonButton from '@/components/Antd/Button/CommonButton.vue'
import * as yup from 'yup'
import router from '@/router'
import { useI18n } from 'vue-i18n'
import { UserAuthServices } from '@/services/User/Auth/index.services'
import { setLocalStorageToken } from '@/utils/common.util'
import modalNotification from '@/utils/notification'
import moduleRoutesMap from '@/routeControl'
import store from '@/stores/store'
import { Form as VForm } from 'vee-validate'
import logger from '@/utils/logger'

const { t } = useI18n()

// Define validation schema for the login form
const validationSchema = yup.object({
    emailOrMobile: yup.string().required('Email is required!'),
    password: yup.string().required('Password is required!')
})

// Function to handle form submission
const onSubmit = async (values) => {
    try {
        // Prepare payload for login request
        const payLoad = {
            ...values,
            deviceType: 'web'
        }

        // Make an asynchronous request to login the user with the provided payload
        const response = await UserAuthServices.userLogin(payLoad)
        const { success, message } = response
        if (success) {
            // Show success notification
            modalNotification({
                type: 'success',
                message
            })

            // Dispatch user login action
            store.dispatch('auth/loginUser', { data: response.data, token: response.data.token })

            // Save the authentication token in local storage
            setLocalStorageToken(response?.data ?.token)

            // Navigate to the dashboard
            router.push(moduleRoutesMap.user.HOME)
        }
    } catch (error) {
        logger(error)
    }
}

// Navigation handler to go back to the home page
const navigateToHome = () => {
    router.push('/')
}
</script>
