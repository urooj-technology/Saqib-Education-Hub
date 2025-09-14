# Education Hub Backend API

A comprehensive, professional backend API for the Education Hub system built with Node.js, Express.js, MySQL, and Sequelize ORM.

## 🚀 Features

- **Complete CRUD Operations** for all modules (Users, Books, Articles, Videos, Jobs, Scholarships)
- **Advanced Pagination, Filtering, and Search** implemented in backend controllers
- **Professional Error Handling** with custom error classes and middleware
- **JWT Authentication & Authorization** with role-based access control
- **File Upload System** with image processing and validation
- **Comprehensive Validation** using express-validator
- **Security Features** including rate limiting, XSS protection, and CORS
- **Logging System** using Winston for comprehensive application logging
- **Database Management** with Sequelize ORM and MySQL
- **API Documentation** with detailed endpoint descriptions

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer + Sharp
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest + Supertest

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # Database configuration
│   └── logger.js            # Winston logger setup
├── controllers/
│   ├── userController.js    # User management logic
│   ├── bookController.js    # Book management logic
│   ├── articleController.js # Article management logic
│   ├── videoController.js   # Video management logic
│   ├── jobController.js     # Job management logic
│   ├── scholarshipController.js # Scholarship management logic
│   └── dashboardController.js   # Dashboard statistics
├── middleware/
│   ├── auth.js              # Authentication & authorization
│   ├── errorHandler.js      # Global error handling
│   ├── upload.js            # File upload configuration
│   └── validation.js        # Request validation rules
├── models/
│   ├── User.js              # User model
│   ├── Book.js              # Book model
│   ├── Article.js           # Article model
│   ├── Video.js             # Video model
│   ├── Job.js               # Job model
│   ├── Scholarship.js       # Scholarship model
│   └── index.js             # Model associations
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── books.js             # Book management routes
│   ├── articles.js          # Article management routes
│   ├── videos.js            # Video management routes
│   ├── jobs.js              # Job management routes
│   ├── scholarships.js      # Scholarship management routes
│   └── dashboard.js         # Dashboard routes
├── utils/
│   └── errorHandler.js      # Error utility functions
├── uploads/                 # File upload directory
├── logs/                    # Application logs
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── server.js                # Main application file
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   CREATE DATABASE saqib_education_hub;
   
   # Run migrations (if using Sequelize CLI)
   npm run migrate
   
   # Or sync models directly
   npm run dev
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### 🔐 Default Users

The system automatically creates default users when it starts for the first time:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | `admin@educationhub.com` | `Admin@123` | Full system access |
| **Teacher** | `teacher@educationhub.com` | `Teacher@123` | Content creation and management |
| **Student** | `student@educationhub.com` | `Student@123` | Basic access to public content |
| **Moderator** | `moderator@educationhub.com` | `Moderator@123` | Content moderation |
| **HR** | `hr@educationhub.com` | `HR@123` | Job and recruitment management |

**⚠️ Important Security Note:** These are default credentials for development/testing. **Change all passwords immediately** after first login in production environments.

#### Manual Seeding

To manually create default users:

```bash
# Run seeders manually
npm run seed

# Or use the direct script
node seed.js
```

## ⚙️ Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
DB_NAME=saqib_education_hub
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=./logs
```

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/forgot-password` | Forgot password | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/update-me` | Update current user | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/logout` | User logout | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users (with pagination) | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| POST | `/api/users` | Create new user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| GET | `/api/users/stats/overview` | Get user statistics | Admin |
| PUT | `/api/users/bulk-update` | Bulk update users | Admin |

### Books

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/books` | Get all books (with pagination) | Public |
| GET | `/api/books/:id` | Get book by ID | Public |
| GET | `/api/books/featured` | Get featured books | Public |
| GET | `/api/books/category/:category` | Get books by category | Public |
| GET | `/api/books/search` | Search books | Public |
| POST | `/api/books` | Create new book | Admin/Teacher |
| PUT | `/api/books/:id` | Update book | Admin/Teacher |
| DELETE | `/api/books/:id` | Delete book | Admin/Teacher |
| GET | `/api/books/stats/overview` | Get book statistics | Admin |

### Articles

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/articles` | Get all articles (with pagination) | Public |
| GET | `/api/articles/:id` | Get article by ID | Public |
| GET | `/api/articles/featured` | Get featured articles | Public |
| GET | `/api/articles/category/:category` | Get articles by category | Public |
| GET | `/api/articles/search` | Search articles | Public |
| POST | `/api/articles` | Create new article | Admin/Teacher |
| PUT | `/api/articles/:id` | Update article | Admin/Teacher |
| DELETE | `/api/articles/:id` | Delete article | Admin/Teacher |
| GET | `/api/articles/stats/overview` | Get article statistics | Admin |

### Videos

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/videos` | Get all videos (with pagination) | Public |
| GET | `/api/videos/:id` | Get video by ID | Public |
| GET | `/api/videos/featured` | Get featured videos | Public |
| GET | `/api/videos/category/:category` | Get videos by category | Public |
| GET | `/api/videos/search` | Search videos | Public |
| POST | `/api/videos` | Create new video | Admin/Teacher |
| PUT | `/api/videos/:id` | Update video | Admin/Teacher |
| DELETE | `/api/videos/:id` | Delete video | Admin/Teacher |
| GET | `/api/videos/stats/overview` | Get video statistics | Admin |

### Jobs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/jobs` | Get all jobs (with pagination) | Public |
| GET | `/api/jobs/:id` | Get job by ID | Public |
| GET | `/api/jobs/featured` | Get featured jobs | Public |
| GET | `/api/jobs/category/:category` | Get jobs by category | Public |
| GET | `/api/jobs/search` | Search jobs | Public |
| POST | `/api/jobs` | Create new job | Admin/HR |
| PUT | `/api/jobs/:id` | Update job | Admin/HR |
| DELETE | `/api/jobs/:id` | Delete job | Admin/HR |
| GET | `/api/jobs/stats/overview` | Get job statistics | Admin |

### Scholarships

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/scholarships` | Get all scholarships (with pagination) | Public |
| GET | `/api/scholarships/:id` | Get scholarship by ID | Public |
| GET | `/api/scholarships/featured` | Get featured scholarships | Public |
| GET | `/api/scholarships/category/:category` | Get scholarships by category | Public |
| GET | `/api/scholarships/search` | Search scholarships | Public |
| POST | `/api/scholarships` | Create new scholarship | Admin/Moderator |
| PUT | `/api/scholarships/:id` | Update scholarship | Admin/Moderator |
| DELETE | `/api/scholarships/:id` | Delete scholarship | Admin/Moderator |
| GET | `/api/scholarships/stats/overview` | Get scholarship statistics | Admin |

### Dashboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/dashboard/stats` | Get dashboard statistics | Admin |
| GET | `/api/dashboard/health` | Get system health | Admin |
| GET | `/api/dashboard/activity-logs` | Get activity logs | Admin |

## 🔧 Advanced Features

### Pagination

All list endpoints support pagination with the following query parameters:

```bash
GET /api/books?page=1&limit=12&sortBy=title&sortOrder=ASC
```

**Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 100)
- `sortBy`: Field to sort by
- `sortOrder`: ASC or DESC

**Response Format:**
```json
{
  "status": "success",
  "data": {
    "books": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Filtering

Most endpoints support filtering by various fields:

```bash
GET /api/books?category=technology&status=published&minPrice=10&maxPrice=100
```

### Search

Search functionality across multiple fields:

```bash
GET /api/books/search?q=javascript&page=1&limit=10
```

### File Upload

File uploads are handled with Multer and Sharp:

- **Image Processing**: Automatic resizing and optimization
- **File Validation**: Type, size, and dimension validation
- **Storage**: Organized directory structure
- **Security**: File type restrictions and virus scanning

## 🔐 Authentication & Authorization

### JWT Tokens

- **Access Token**: Short-lived (7 days)
- **Refresh Token**: Long-lived (30 days)
- **Automatic Renewal**: Built-in token refresh mechanism

### Role-Based Access Control

- **Student**: Read-only access to public content
- **Teacher**: Create/edit own content
- **Moderator**: Moderate content, manage scholarships
- **HR**: Manage job postings
- **Admin**: Full system access

### Protected Routes

```javascript
// Example of protected route
router.get('/protected', protect, authorize('admin'), controllerFunction);
```

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **XSS Protection**: Sanitizes user input
- **CORS Configuration**: Controlled cross-origin access
- **Helmet**: Security headers
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Sequelize ORM protection
- **File Upload Security**: Type and size validation

## 📊 Logging

### Winston Logger Configuration

- **File Logs**: Separate files for errors, combined logs, and exceptions
- **Console Logs**: Development environment logging
- **Log Rotation**: Automatic log file management
- **Structured Logging**: JSON format for easy parsing

### Log Levels

- **Error**: Application errors and exceptions
- **Warn**: Warning messages
- **Info**: General information
- **Debug**: Detailed debugging information

## 🧪 Testing

### Test Scripts

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Configure CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Environment Variables

```bash
# Production environment
NODE_ENV=production
PORT=5000
DB_HOST=production-db-host
JWT_SECRET=very-secure-production-secret
CORS_ORIGIN=https://yourdomain.com
```

## 📈 Performance

### Optimization Features

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Compression**: Response compression with gzip
- **Caching**: Redis integration for caching (optional)
- **Lazy Loading**: Efficient data loading strategies

### Monitoring

- **Health Checks**: System health monitoring
- **Performance Metrics**: Response time tracking
- **Error Tracking**: Comprehensive error logging
- **Resource Usage**: Memory and CPU monitoring

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm start           # Start production server
npm test            # Run tests
npm run migrate     # Run database migrations
npm run seed        # Seed database with sample data
npm run reset       # Reset database
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

### Code Quality

- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Commitlint**: Conventional commit message validation

## 📚 API Documentation

### Request/Response Examples

#### Create Book

**Request:**
```bash
POST /api/books
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "JavaScript: The Good Parts",
  "author": "Douglas Crockford",
  "description": "A comprehensive guide to JavaScript",
  "category": "programming",
  "language": "English",
  "price": 29.99,
  "currency": "USD"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Book created successfully",
  "data": {
    "book": {
      "id": "uuid-here",
      "title": "JavaScript: The Good Parts",
      "author": "Douglas Crockford",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Handling

**Error Response Format:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow ESLint configuration
- Use conventional commit messages
- Write comprehensive tests
- Document new endpoints
- Follow existing code patterns

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README first
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: Contact the development team

### Common Issues

- **Database Connection**: Check MySQL service and credentials
- **File Uploads**: Verify upload directory permissions
- **Authentication**: Ensure JWT secrets are properly set
- **CORS**: Verify frontend origin configuration

---

**Built with ❤️ for the Education Hub project**
