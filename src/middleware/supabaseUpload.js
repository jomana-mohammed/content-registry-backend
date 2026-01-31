const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Use memory storage for multer (we'll upload to Supabase manually)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|pptx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, DOCX, PPTX and TXT files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Middleware to upload to Supabase after multer processes the file
const uploadToSupabase = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
    const filePath = `content-registry/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('content-registry') // bucket name
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'File upload failed'
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('content-registry')
      .getPublicUrl(filePath);

    // Attach file info to request
    req.file.supabasePath = filePath;
    req.file.url = urlData.publicUrl;
    req.file.location = urlData.publicUrl;

    next();
  } catch (error) {
    console.error('Supabase upload error:', error);
    next(error);
  }
};

//  Delete file from Supabase
const deleteFromSupabase = async (filePath) => {
  console.log("entered delete supabase fn")
  try {
    const { error } = await supabase.storage
      .from('content-registry')
      .remove([filePath]);

    if (error) throw error;
    console.log('File deleted from Supabase:', filePath);
  } catch (error) {
    console.error('Supabase deletion error:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToSupabase,
  deleteFromSupabase
};