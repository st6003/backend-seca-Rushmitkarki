# Backend API Documentation

## Overview
This backend API is built using Node.js and Express for a memory_guardian platform that includes user management, doctor management, appointment booking, chat features, insurance services, and integration with the Khalti payment gateway.

## Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **Axios**

## Prerequisites
Before running the project, make sure you have the following installed:
- Node.js
- MongoDB

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/rushmitkarki
    ```

2. Navigate to the project directory:

    ```bash
    cd memory_guardian
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```

4. Create a `.env` file in the root directory and add your environment variables:

    ```env
    PORT=5000
    MONGO_URI="mongodb+srv://test:test@cluster0.kzu0eau.mongodb.net/project"
    JWT_SECRET=SECRET_KEY
    KHALTI_PUBLIC_KEY="5826720c2d604a8eae0be763afaabb41"
    ```

5. Start the server:

    ```bash
    npm start
    ```

## API Endpoints

### Authentication and User Management

| Method | Endpoint                        | Description                              |
|--------|---------------------------------|------------------------------------------|
| POST   | `/api/user/create`              | Register a new user                      |
| POST   | `/api/user/google`              | Login with Google                        |
| POST   | `/api/user/getGoogleUser`       | Get user by Google email                 |
| POST   | `/api/user/login`               | Login a user                             |
| POST   | `/api/user/forget_password`     | Send a password reset link               |
| POST   | `/api/user/reset_password`      | Reset the user password                  |
| GET    | `/api/user/get_single_user`     | Get details of the logged-in user        |
| GET    | `/api/user/get_all_users`       | Get a list of all users                  |
| DELETE | `/api/user/delete_user/:userId` | Delete a user                            |
| PUT    | `/api/user/update_profile`      | Update user profile                      |

### Doctor Management

| Method | Endpoint                             | Description                                   |
|--------|--------------------------------------|-----------------------------------------------|
| POST   | `/api/doctor/create`                 | Create a new doctor                           |
| GET    | `/api/doctor/get_all_doctors`        | Get a list of all doctors                     |
| GET    | `/api/doctor/get_single_doctor/:id`  | Get details of a single doctor                |
| PUT    | `/api/doctor/update_doctor/:id`      | Update doctor information                     |
| DELETE | `/api/doctor/delete_doctor/:id`      | Delete a doctor                               |
| GET    | `/api/doctor/pagination`             | Get doctors with pagination and search        |
| GET    | `/api/doctor/get_doctor_count`       | Get the total count of doctors                |
| GET    | `/api/doctor/search`                 | Search doctors by query                       |

### Appointment Management

| Method | Endpoint                                  | Description                                      |
|--------|-------------------------------------------|--------------------------------------------------|
| POST   | `/api/booking/create_appointments`        | Book an appointment with a doctor                |
| GET    | `/api/booking/users_with_appointments`    | Get a list of users with appointments            |
| DELETE | `/api/booking/delete_appointments/:id`    | Delete an appointment                            |
| PUT    | `/api/booking/approve_appointment/:id`    | Approve an appointment                           |
| GET    | `/api/booking/user_appointments`          | Get all appointments for the logged-in user      |
| PUT    | `/api/booking/cancel_appointment/:id`     | Cancel an appointment                            |

### Chat Management

| Method | Endpoint                               | Description                                         |
|--------|----------------------------------------|-----------------------------------------------------|
| POST   | `/api/chat/create`                     | Create a new chat                                   |
| GET    | `/api/chat/fetch`                      | Fetch all chats                                     |
| POST   | `/api/chat/group`                      | Create a group chat                                 |
| PUT    | `/api/chat/rename`                     | Rename a group                                      |
| PUT    | `/api/chat/groupadd`                   | Add a user to a group                               |
| PUT    | `/api/chat/groupremove`                | Remove a user from a group                          |
| PUT    | `/api/chat/groupleave`                 | Leave a group chat                                  |
| PUT    | `/api/chat/updategroup`                | Update group chat details                           |
| POST   | `/api/message/send`                    | Send a message in a chat                            |
| GET    | `/api/message/:id`                     | Fetch all messages for a specific chat              |

### Insurance Management

| Method | Endpoint                                    | Description                               |
|--------|---------------------------------------------|-------------------------------------------|
| POST   | `/api/insurance/create`                     | Create a new insurance policy             |
| GET    | `/api/insurance/get_all_insurances`         | Get a list of all insurance policies      |
| DELETE | `/api/insurance/delete_insurance/:id`       | Delete an insurance policy                |
| PUT    | `/api/insurance/update_insurance/:id`       | Update insurance policy details           |
| GET    | `/api/insurance/get_single_insurance/:id`   | Get details of a single insurance policy  |

### Khalti Payment Integration

| Method | Endpoint                                  | Description                           |
|--------|-------------------------------------------|---------------------------------------|
| POST   | `/api/payment/initialize_khalti`          | Initialize a payment with Khalti      |

### Favorites Management

| Method | Endpoint                                | Description                           |
|--------|-----------------------------------------|---------------------------------------|
| POST   | `/api/favourite/add`                    | Add a doctor to favorites             |
| GET    | `/api/favourite/all`                    | Get all favorites for the logged-in user |
| DELETE | `/api/favourite/delete/:id`             | Remove a doctor from favorites        |

### Review and Rating Management

| Method | Endpoint                                  | Description                           |
|--------|-------------------------------------------|---------------------------------------|
| POST   | `/api/rating/add`                         | Add a review for a doctor             |
| GET    | `/api/rating/doctor/:doctorId`            | Get reviews and ratings for a doctor  |

### Admin Dashboard

| Method | Endpoint                               | Description                               |
|--------|----------------------------------------|-------------------------------------------|
| GET    | `/api/admin/dashboard_stats`           | Get statistics for the admin dashboard    |

## How to Use

1. Use a REST client like Postman or cURL to test the API endpoints.
2. Ensure the required headers (e.g., `Authorization` with the JWT token) are included in the requests.
3. Use the provided routes for managing users, doctors, appointments, chats, insurance, payments, and more.

## Error Handling

All API responses include status codes:
- `200` for success
- `400` for bad requests
- `401` for unauthorized access
- `404` for not found
- `500` for server errors

Error messages are returned in a standardized format:
```json
{
  "error": "Error message here"
}
