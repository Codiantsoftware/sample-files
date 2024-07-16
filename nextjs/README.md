# NextJS Sample Project

This project is built with Next.js and TypeScript, featuring basic user management, authentication, and signup functionalities. Below is an overview of the project's folder structure and their purposes.

## Files Overview

### NextJS Sample Code Files

### Src/

### Api End Points

Contains the definitions for backend API endpoints related to user management and authentication, including configurations for sign-up (/user/signUp, POST) and sign-in.

### App

Defines the routing and layout of the application.
Implements the SignUp component for user registration, provides the root layout with a Redux provider and loading indicator, and serves as the main entry point rendering the ECommerce dashboard with notifications.

### Component

Holds reusable React components used throughout the application. The Loader component (component/common/loader.tsx) displays a spinning loader for both light and dark themes, while the common component directory contains general components applicable across different parts of the app.

### Redux

Manages the global state of the application using Redux. This folder defines the authentication state within the Redux store, handling user login status and user information such as name, email, and token. It includes actions for logging in (auth) and logging out (logout), along with the initial state and a selector for accessing authentication data.

### Services

Contains functions that interact with the backend API for user authentication. This includes userSignup for registering a new user with their name, email, and password, and userSignIn for logging in with email and password. Each function constructs an API request using predefined endpoints and manages potential errors during the requests.
