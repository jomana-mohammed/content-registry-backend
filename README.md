# Content Registry

Backend API for the Content Registry platform - A full-stack application for uploading and managing files and text posts.

**Live Demo:** https://content-registry-eight.vercel.app/

## 🚀 Features

- **JWT-based authentication** with secure token management
- **File upload support** (images, PDFs, documents) with cloud storage
- **Text post creation** with full markdown support
- **User profile management** and account customization
- **Secure cloud file storage** with Supabase
- **Input validation and sanitization** for data integrity
- **Comprehensive error handling** with detailed error responses
- **RESTful API design** with clean endpoint structure
- **Role-based access control** for content ownership
- **Real-time file deletion** from cloud storage

## 🛠️ Tech Stack

### Backend Framework
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework

### Database
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - ODM (Object Document Mapper) for MongoDB schema validation

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication
- **Bcrypt** - Password hashing and encryption

### File Handling & Cloud Storage
- **Multer** - Middleware for file upload handling
- **Supabase Storage** - Cloud-based file storage solution
- **Supabase SDK** - Official JavaScript client for Supabase services

### Development & Deployment
- **Vercel** - Hosting and deployment platform (Live)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- MongoDB (local or MongoDB Atlas account)
- Supabase account (for cloud storage)

### Environment Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd content-registry-backend
```

2. Install dependencies
```bash
npm install
```

3. Create .env file
```bash
cp .env.example .env
```

4. Update .env with your configuration values
```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/content-registry
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/content-registry

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Frontend
FRONTEND_URL=http://localhost:3000

# Supabase (Cloud Storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### Running the Server

5. Start MongoDB (if running locally)
```bash
mongod
```

6. Run the development server
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📋 API Endpoints

### Authentication Endpoints

**Register User**
```
POST /api/auth/register
Content-Type: application/json

Body: 
{
  "username": "jomana_m",
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "jomana_m",
    "email": "user@example.com"
  }
}
```

**Login User**
```
POST /api/auth/login
Content-Type: application/json

Body: 
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

**Get Current User**
```
GET /api/auth/me
Headers: Authorization: Bearer <jwt_token>

Response: 
{
  "success": true,
  "user": { ... }
}
```

### Content Endpoints

**Create Content (Text Post)**
```
POST /api/content
Headers: 
  Authorization: Bearer <jwt_token>
  Content-Type: application/json

Body: 
{
  "title": "My Post Title",
  "type": "text",
  "content": "The content of my text post..."
}

Response: 
{
  "success": true,
  "data": {
    "id": "content_id",
    "title": "My Post Title",
    "type": "text",
    "content": "The content...",
    "userId": "user_id",
    "createdAt": "2026-01-31T..."
  }
}
```

**Create Content (File Upload)**
```
POST /api/content
Headers: 
  Authorization: Bearer <jwt_token>
  Content-Type: multipart/form-data

Body (FormData):
  - title: "Document Title"
  - type: "file"
  - file: <binary_file_data>

Response: 
{
  "success": true,
  "data": {
    "id": "content_id",
    "title": "Document Title",
    "type": "file",
    "fileUrl": "https://supabase-storage-url/...",
    "fileName": "document.pdf",
    "fileType": "application/pdf",
    "fileSize": 524288,
    "userId": "user_id",
    "createdAt": "2026-01-31T..."
  }
}
```

**Get Specific Content by ID**
```
GET /api/content/:id

Response: 
{
  "success": true,
  "data": { ... }
}
```

**Get All Content by User ID**
```
GET /api/content/user/:userId

Response: 
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

**Get Current User's Content**
```
GET /api/content/my-content
Headers: Authorization: Bearer <jwt_token>

Response: 
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

**Update Content**
```
PATCH /api/content/:id
Headers: 
  Authorization: Bearer <jwt_token>
  Content-Type: application/json or multipart/form-data

Body: 
{
  "title": "Updated Title",
  "content": "Updated content (for text posts)"
}

Response: 
{
  "success": true,
  "data": { ... },
  "message": "Content updated successfully"
}
```

**Delete Content**
```
DELETE /api/content/:id
Headers: Authorization: Bearer <jwt_token>

Response: 
{
  "success": true,
  "message": "Content deleted successfully"
}
```

Note: When deleting file content, the file is automatically removed from Supabase cloud storage.

### User Endpoints

**Get User Profile**
```
GET /api/user/:userId

Response: 
{
  "success": true,
  "user": { ... }
}
```

## 📁 Project Structure

```
content-registry-backend/
├── src/
│   ├── config/                 # Configuration files
│   ├── controllers/            # Request handlers
│   │   ├── authController.js
│   │   ├── contentController.js
│   │   └── userController.js
│   ├── middleware/             # Express middleware
│   │   ├── auth.js            # JWT authentication
│   │   ├── errorHandler.js    # Global error handling
│   │   ├── supabaseUpload.js  # Supabase file upload
│   │   ├── upload.js          # Multer configuration
│   │   └── validation.js      # Input validation
│   ├── models/                # Database schemas
│   │   ├── Content.js
│   │   └── User.js
│   ├── routes/                # API routes
│   │   ├── authRoutes.js
│   │   ├── contentRoutes.js
│   │   └── userRoutes.js
│   ├── utils/                 # Utility functions
│   │   └── db.js
│   └── server.js              # Main server entry point
├── tests/                      # Test files
│   └── auth.test.js
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **File Validation**: Strict file type and size validation
- **Input Sanitization**: Protection against injection attacks
- **CORS Support**: Configured for frontend communication
- **Error Handling**: Detailed yet secure error responses
- **Access Control**: User ownership verification for content operations

## 📤 File Upload

Supported file types for upload:
- Images: JPEG, JPG, PNG, GIF
- Documents: PDF, DOC, DOCX, PPTX, TXT

Maximum file size: **5MB**

Files are stored securely in Supabase cloud storage with automatic cleanup on deletion.

## 🌐 Deployment

**Live Application:** https://content-registry-eight.vercel.app/

The application is deployed on **Vercel** with:
- Automatic deployments from main branch
- Production environment configuration
- Global CDN for fast content delivery
- Serverless function execution

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- Authentication flows
- Content creation and management
- User operations
- Error handling

## 📝 API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": { ... }
}
```

## 🐛 Troubleshooting

### File Upload Issues
- Verify Supabase credentials in `.env`
- Check file size (max 5MB)
- Ensure file type is supported
- Check Supabase bucket permissions

### Authentication Issues
- Verify JWT_SECRET is set
- Ensure token is included in Authorization header
- Check token expiration

### Database Connection
- Verify MongoDB URI in `.env`
- Check MongoDB service is running
- Ensure database user has proper permissions

## 📧 Support & Contact

For issues, questions, or contributions, please:
1. Check existing issues on GitHub
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce


---

**Project Status:** ✅ Complete and Live

Last Updated: January 2026
