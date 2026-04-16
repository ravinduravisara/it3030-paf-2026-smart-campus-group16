# Smart Campus Application

A full-stack web application for smart campus management with authentication, resource booking, and ticket management.

## Features

- **Authentication**: OAuth2 Google login, student registration, admin login
- **User Roles**: Students and administrators
- **Resource Management**: Book campus resources
- **Ticket System**: Submit and manage support tickets
- **Responsive UI**: Built with React and Tailwind CSS

## Tech Stack

- **Backend**: Spring Boot 3.3.6, Java 17, MongoDB
- **Frontend**: React 18, Vite, Tailwind CSS
- **Database**: MongoDB Atlas
- **Authentication**: Spring Security OAuth2, JWT

## Setup Instructions

### Prerequisites

- Java 17
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Configure environment variables:

   Create a `.env` file or set environment variables:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. For Google OAuth2 setup:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth2 credentials
   - Add authorized redirect URIs:
     - `http://localhost:8080/login/oauth2/code/google`
   - Set the client ID and secret in `application.yml` or environment variables
   - If you see `invalid_client` or `invalid_token_response`, your Google client secret is incorrect or does not match the authorized redirect URI

5. Build and run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

### Running the Application

1. Start the backend server (runs on http://localhost:8080)
2. Start the frontend server (runs on http://localhost:5173)
3. Open http://localhost:5173 in your browser

## Authentication

### Google OAuth2 Login

- Click "Login with Google" on the login page
- Authenticate with your Google account
- You'll be redirected back and automatically logged in

### Student Login

- Use Student ID or Email + Password
- Students are registered via the signup form

### Admin Login

- Username: `admin`, Password: `admin123`
- Username: `user`, Password: `user123`

## API Endpoints

- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/signup` - Register new student
- `GET /oauth2/authorization/google` - Initiate Google OAuth2 flow

## Development

- Backend uses JWT for session management
- Frontend uses localStorage for token persistence
- CORS is configured for localhost development