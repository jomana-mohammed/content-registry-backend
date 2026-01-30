// const errorHandler = (err, req, res, next) => {
//     let error = { ...err };
//     error.message = err.message;

//     // Log error for debugging (in development)
//     if (process.env.NODE_ENV === 'development') {
//         console.error('Error Stack:', err.stack);
//         console.error('Error Details:', err);
//     }

//     // Mongoose bad ObjectId
//     if (err.name === 'CastError') {
//         const message = 'Resource not found';
//         error = { message, statusCode: 404 };
//     }

//     // Mongoose duplicate key error
//     if (err.code === 11000) {
//         const field = Object.keys(err.keyValue)[0];
//         const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
//         error = { message, statusCode: 400 };
//     }

//     // Mongoose validation error
//     if (err.name === 'ValidationError') {
//         const message = Object.values(err.errors).map(val => val.message);
//         error = { message: message.join(', '), statusCode: 400 };
//     }

//     // JWT errors
//     if (err.name === 'JsonWebTokenError') {
//         const message = 'Invalid token';
//         error = { message, statusCode: 401 };
//     }

//     if (err.name === 'TokenExpiredError') {
//         const message = 'Token expired';
//         error = { message, statusCode: 401 };
//     }

//     // Multer errors
//     if (err.name === 'MulterError') {
//         if (err.code === 'LIMIT_FILE_SIZE') {
//         error = { 
//             message: 'File size too large. Maximum allowed size is 5MB', 
//             statusCode: 400 
//         };
//         } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//         error = { 
//             message: 'Unexpected field in file upload', 
//             statusCode: 400 
//         };
//         } else {
//         error = { message: err.message, statusCode: 400 };
//         }
//     }

//     // File type error
//     if (err.message && err.message.includes('Invalid file type')) {
//         error = { message: err.message, statusCode: 400 };
//     }

//     res.status(error.statusCode || 500).json({
//         success: false,
//         message: error.message || 'Server Error',
//         ...(process.env.NODE_ENV === 'development' && { 
//         stack: err.stack,
//         error: err 
//         })
//     });
// };

// module.exports = errorHandler;

// backend/src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error Stack:', err.stack);
    console.error('❌ Error Details:', err);
  } else {
    // Production: log minimal info
    console.error('❌ Error:', {
      message: err.message,
      statusCode: err.statusCode || 500,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message = field 
      ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      : 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = { message: messages.join(', '), statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    error = { message: 'Token expired', statusCode: 401 };
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = { 
        message: 'File size too large. Maximum allowed size is 5MB', 
        statusCode: 400 
      };
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error = { 
        message: 'Unexpected field in file upload', 
        statusCode: 400 
      };
    } else {
      error = { message: err.message, statusCode: 400 };
    }
  }

  // File type error
  if (err.message && err.message.includes('Invalid file type')) {
    error = { message: err.message, statusCode: 400 };
  }

  // Build response
  const response = {
    success: false,
    message: error.message || 'Server Error',
  };

  // Add debug info only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;