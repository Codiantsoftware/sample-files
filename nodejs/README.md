# Node.js Project Overview

Information about Node.js code structure and the different modules and files.

## Table of Contents

- [Introduction](#introduction)
- [Project Structure](#project-structure)
- [Modules](#modules)
  - [User Module](#user-module)
  - [Auth Module](#auth-module)
- [How to Run the Project](#how-to-run-the-project)

## Introduction

This project is built using Node.js and follows a modular architecture to ensure scalability and maintainability. The main modules in this project are `user` and `auth`. Each module has its own set of routes, controllers, middleware, validation, repository, service, and model files.

## Project Structure

src/
├── controllers/
│ ├── account-controller.js
│ └── user-controller.js
├── middlewares/
│ ├── account-middleware.js
│ └── user-middleware.js
├── models/
│ ├── userModel.js
├── repositories/
│ ├── user-repository.js
│ └── account-repository.js
├── routes/
│ ├── account.js
│ └── user.js
├── services/
│ ├── jwt.js
│ └── logger.js
│ └── stripe-service.js
├── validations/
│ ├── account-validation.js
│ └── user-validation.js

## Modules

### User Module

The user module handles all user-related functionalities such as creating, updating, fetching, and deleting users.

- **Route:** `routes/user.js`

  - Defines the endpoints for user-related operations.
  - Example endpoints: `/users`, `/users/:id`

- **Controller:** `controllers/user-controller.js`

  - Contains the logic to handle requests and responses for user routes.
  - Example methods: `createUser`, `getUser`, `updateUser`, `deleteUser`

- **Middleware:** `middlewares/account-middleware.js`

  - Contains authentication middleware to protect user routes.
  - Example methods: `checkEmailExists`

- **Validation:** `validations/user-validator.js`

  - Contains validation logic for user-related data.
  - Example methods: `verifyOtpSchema`

- **Repository:** `repositories/user-repository.js`

  - Contains database access logic for user-related operations.
  - Example methods: `findUserById`, `createUser`, `updateUser`, `deleteUser`

- **Service:** `services/jwt.js`

  - Contains business logic for auth token related operations.
  - Example methods: `createToken`

- **Model:** `models/user.js`
  - Defines the user schema and model.
  - Example fields: `name`, `email`, `password`

### Auth Module

The auth module handles authentication-related functionalities such as user login and registration.

- **Route:** `routes/account.js`

  - Defines the endpoints for authentication-related operations.
  - Example endpoints: `/login`, `/signup`

- **Controller:** `controllers/account-controller.js`

  - Contains the logic to handle requests and responses for auth routes.
  - Example methods: `login`, `signup`

- **Middleware:** `middlewares/account-middleware.js`

  - Contains authentication middleware to protect auth routes.
  - Example methods: `authenticateToken`

- **Validation:** `validations/account-validation.js`

  - Contains validation logic for authentication-related data.
  - Example methods: `validateLogin`

- **Repository:** `repositories/account-repository.js`

  - Contains database access logic for authentication-related operations.
  - Example methods: `findUserByEmail`, `createUser`
