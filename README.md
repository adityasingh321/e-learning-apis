# E-Learning Platform API

A comprehensive RESTful API for an E-Learning platform built with Node.js, TypeScript, and SQL Server. This platform enables students to enroll in courses, track their progress, and allows instructors to manage their content effectively.

## Features

### 🔐 Authentication & User Management
- JWT-based authentication with role-based access control
- User registration and login with password hashing
- Password reset functionality via email
- Profile management for users

**Note on Password Reset:**
For simplicity and testing purposes, the password reset functionality currently returns the reset token directly in the API response instead of sending it via email. In a production environment, this token would be sent to the user's email address. The email functionality could be implemented using services like Nodemailer with SMTP configuration.

### 📚 Course Management
- Complete CRUD operations for courses
- Lesson management within courses
- Course categorization and filtering
- Course status management (draft, published, archived)

### 🎓 Enrollment & Progress Tracking
- Student enrollment/unenrollment system
- Progress tracking for individual lessons
- Course completion percentage calculation
- Instructor analytics for student progress

### ⭐ Review System
- Course ratings and reviews
- Review management (create, update, delete)
- Average rating calculations

### 👨‍💼 Admin Dashboard
- Platform statistics and analytics
- User management and status updates
- System-wide overview

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQL Server with Sequelize ORM
- **Authentication**: JWT
- **Validation**: Express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate limiting

## Prerequisites

Before running this application, make sure you have:

- Node.js v18 or higher
- SQL Server instance running
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-learning-platform-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=1433
   DB_NAME=e_learning_db
   DB_USER=sa
   DB_PASSWORD=your_password
   DB_DIALECT=mssql

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h

4. **Database Setup**
   - Create a SQL Server database named `e_learning_db`
   - The application will automatically create tables on first run

5. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Courses
- `GET /api/v1/courses` - Get all courses (with pagination, filtering, search)
- `GET /api/v1/courses/:id` - Get course by ID
- `POST /api/v1/courses` - Create new course (instructor/admin only)
- `PUT /api/v1/courses/:id` - Update course (instructor/admin only)
- `DELETE /api/v1/courses/:id` - Delete course (admin only)
- `GET /api/v1/courses/:id/lessons` - Get course lessons
- `POST /api/v1/courses/:id/lessons` - Add lesson to course (instructor only)
- `PUT /api/v1/courses/:courseId/lessons/:lessonId` - Update lesson (instructor only)
- `DELETE /api/v1/courses/:courseId/lessons/:lessonId` - Delete lesson (instructor only)

### Categories
- `GET /api/v1/categories` - Get all categories

### Enrollments
- `POST /api/v1/enrollments` - Enroll in a course
- `GET /api/v1/enrollments/my-courses` - Get user's enrolled courses
- `DELETE /api/v1/enrollments/:courseId` - Unenroll from course
- `GET /api/v1/enrollments/courses/:courseId/students` - Get course students (instructor only)
- `GET /api/v1/enrollments/analytics/my-courses` - Get enrollment analytics (instructor only)

### Progress
- `POST /api/v1/progress/:courseId/lessons/:lessonId` - Update lesson progress
- `GET /api/v1/progress/:courseId` - Get course progress
- `GET /api/v1/progress/courses/:courseId/students` - Get student progress (instructor only)

### Reviews
- `POST /api/v1/reviews/courses/:courseId/reviews` - Create course review
- `GET /api/v1/reviews/courses/:courseId/reviews` - Get course reviews
- `PUT /api/v1/reviews/:id` - Update review (author only)
- `DELETE /api/v1/reviews/:id` - Delete review (author/admin only)

### Admin
- `GET /api/v1/admin/stats` - Get platform statistics (admin only)
- `GET /api/v1/admin/users` - Get all users (admin only)
- `PUT /api/v1/admin/users/:id/status` - Update user status (admin only)

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access

- **Student**: Can enroll in courses, track progress, write reviews
- **Instructor**: Can create/manage their own courses, view student analytics
- **Admin**: Full access to all features and user management

## Database Schema

The application uses the following main entities:
- **Users**: Students, instructors, and admins
- **Courses**: Course information and metadata
- **Lessons**: Individual course content
- **Categories**: Course categorization
- **Enrollments**: Student-course relationships
- **Progress**: Lesson completion tracking
- **Reviews**: Course ratings and feedback

## Development

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Development mode with auto-reload
npm run dev
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS protection
- Security headers with Helmet
- SQL injection prevention

## Logging

The application uses Winston for structured logging:
- Request/response logging
- Error logging with stack traces
- Different log levels (info, warn, error)
- Log files stored in `./logs/`

## Environment Variables

Key environment variables:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development)
- `DB_*`: Database connection settings
- `JWT_SECRET`: JWT signing secret

## Challenges Faced

During the development of this e-learning platform, i encountered several interesting challenges that shaped approach:

### SQL Server Integration
Working with SQL Server and Sequelize ORM required some specific configuration and troubleshooting, especially around connection pooling, transaction management, and handling SQL Server-specific data types and constraints.

### Progress Tracking Logic
Building an accurate progress tracking system that calculates completion percentages across multiple lessons and courses was more complex than initially anticipated. I had to handle edge cases like partial completions, course updates affecting existing enrollments, and ensuring data consistency.

## Assumptions

I made several assumptions during the development process that influenced my design decisions:

### User Behavior Assumptions
- Students typically enroll in multiple courses and progress through them sequentially
- Instructors create courses with multiple lessons and want to track student engagement
- Admins need comprehensive oversight and management capabilities

### Technical Assumptions
- JWT tokens with 24-hour expiration provide adequate security without frequent re-authentication
- Winston logging with file rotation will handle application monitoring and debugging
- Express.js middleware stack (Helmet, CORS, rate limiting) provides sufficient security measures
- Connection pooling with max 5 connections will handle moderate concurrent database operations
- Environment-based configuration (development/production) will manage different deployment scenarios

### Business Logic Assumptions
- Course completion is determined by completing all lessons within a course
- Progress is tracked at the lesson level, with course progress calculated as an aggregate
- Reviews can only be submitted by enrolled students who have made some progress
- Password reset tokens are time-limited and single-use

### Security Assumptions
- JWT tokens provide sufficient security for API authentication
- Rate limiting and input validation are adequate for preventing abuse
- Database connections are secure and properly configured
- Environment variables are properly managed in production deployments

### Scalability Assumptions
- The current database schema can handle moderate user loads
- Connection pooling and query optimization will handle increased traffic
- The modular architecture allows for easy feature additions and modifications