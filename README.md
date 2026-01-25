# Content Registry Backend API

Backend API for the Content Registry platform - A full-stack application for uploading and managing files and text posts.

## 🚀 Features

- JWT-based authentication
- File upload (images, PDFs, documents)
- Text post creation
- User profile management
- Secure file storage
- Input validation and sanitization
- Comprehensive error handling

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- Multer for file uploads
- Bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Setup

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

4. Update .env with your values
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/content-registry
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

5. Start MongoDB (if running locally)
```bash
mongod
```

6. Run the server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📋 API Endpoints

### Authentication

**Register User**
```
POST /api/auth/register
Body: { email, password, username }
Response: { success, token, user }
```

**Login User**
```
POST /api/auth/login
Body: { email, password }
Response: { success, token, user }
```

**Get Current User**
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { success, user }
```

### Content

**Create Content**
```
POST /api/content
Headers: Authorization: Bearer <token>
Body (FormData): { title, type, file OR content }
Response: { success, data }
```

**Get User Content**
```
GET /api/content/user/:userId
Response: { success, count, data }
```

**Get My Content**
```
GET /api/content/my-content
Headers: Authorization: Bearer <token>
Response: { success, count, data }
```

**Delete Content**
```
DELETE /api/content/:id
Headers: Authorization: Bearer <token>
Response: { success, message }
```

### User

**Get User Profile**