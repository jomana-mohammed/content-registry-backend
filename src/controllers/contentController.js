const Content = require('../models/Content');
const fs = require('fs').promises
const path = require('path');


// Create new content (file or text)
// POST /api/content
exports.createContent = async (req, res, next) =>{
    try{
        const {title , content, type} = req.body

        let contentData = {
            userId : req.user.id,
            title,
            type : type || 'text'
        }

        if (type === 'file' && req.file) {
            contentData.fileUrl = `/uploads/${req.file.filename}`;
            contentData.fileName = req.file.originalname;
            contentData.fileType = req.file.mimetype;
            contentData.fileSize = req.file.size;
        } 
        else if (type === 'text') {
            if (!content) {
                return res.status(400).json({
                success: false,
                message: 'Content is required for text posts'
                });
            }
        
            contentData.content = content;
        } 
        else {
            return res.status(400).json({
                success: false,
                message: 'Invalid content type or missing file'
            });
        }

        const newContent = await Content.create(contentData);

        res.status(201).json({
            success: true,
            data : newContent,
        })

    }
    catch(error){
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => 
                console.error('File cleanup error:', err)
            );
        }
        next(error);
    }
}


// Get specific content by Id
// GET /api/content/:id
exports.getContentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const content = await Content.findById(id)
        .populate('userId', 'username email');

        if (!content) {
        return res.status(404).json({
            success: false,
            message: 'Content not found'
        });
        }

        res.status(200).json({
        success: true,
        data: content
        });
    } catch (error) {
        next(error);
    }
}  

// Get all contents of specific content
// GET /api/content/user/:userId
exports.getUserContent = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const contents = await Content.find({ userId })
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });

        res.status(200).json({
        success: true,
        count: contents.length,
        data: contents
        });
    } catch (error) {
        next(error);
    }
};

// Get current user's content
// GET /api/content/my-content
exports.getMyContent = async (req, res, next) => {
    try {
        const contents = await Content.find({ userId: req.user.id })
        .sort({ createdAt: -1 });

        res.status(200).json({
        success: true,
        count: contents.length,
        data: contents
        });
    } catch (error) {
        next(error);
    }
};


// Update content (title, content text, or replace file)
// PATCH /api/content/:id
exports.updateContent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // Find the content
        const existingContent = await Content.findById(id);

        if (!existingContent) {
        // Clean up uploaded file if any
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => 
            console.error('File cleanup error:', err)
            );
        }
        return res.status(404).json({
            success: false,
            message: 'Content not found'
        });
        }

        // Check ownership
        if (existingContent.userId.toString() !== req.user.id) {
        // Clean up uploaded file if any
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => 
            console.error('File cleanup error:', err)
            );
        }
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this content'
        });
        }

        // Prepare update data
        const updateData = {};

        // Update title if provided
        if (title) {
        updateData.title = title;
        }

        // Handle text content update
        if (existingContent.type === 'text') {
        if (content !== undefined) {
            if (!content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Content cannot be empty for text posts'
            });
            }
            updateData.content = content;
        }

        // If a file is uploaded for a text post, reject it
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => 
            console.error('File cleanup error:', err)
            );
            return res.status(400).json({
            success: false,
            message: 'Cannot upload file to a text post. Create a new file post instead.'
            });
        }
        }

        // Handle file content update
        if (existingContent.type === 'file') {
        // If user is trying to update text content on a file post
        if (content !== undefined) {
            return res.status(400).json({
            success: false,
            message: 'Cannot update text content on a file post. Create a new text post instead.'
            });
        }

        // If a new file is uploaded, replace the old one
        if (req.file) {
            // Delete old file
            if (existingContent.fileUrl) {
            const oldFilePath = path.join(__dirname, '../../', existingContent.fileUrl);
            await fs.unlink(oldFilePath).catch(err => 
                console.error('Old file deletion error:', err)
            );
            }

            // Update with new file
            updateData.fileUrl = `/uploads/${req.file.filename}`;
            updateData.fileName = req.file.originalname;
            updateData.fileType = req.file.mimetype;
            updateData.fileSize = req.file.size;
        }
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No valid fields to update'
        });
        }

        // Update the content
        const updatedContent = await Content.findByIdAndUpdate(
        id,
        updateData,
        { 
            new: true, // Return updated document
            runValidators: true // Run model validators
        }
        ).populate('userId', 'username email');

        res.status(200).json({
        success: true,
        data: updatedContent,
        message: 'Content updated successfully'
        });

    } catch (error) {
        // Clean up uploaded file if error occurs
        if (req.file) {
        await fs.unlink(req.file.path).catch(err => 
            console.error('File cleanup error:', err)
        );
        }
        next(error);
    }
}  


// Delete specific content by it's Id
// DELETE /api/content/:id
exports.deleteContent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const content = await Content.findById(id);

        if (!content) {
        return res.status(404).json({
            success: false,
            message: 'Content not found'
        });
        }

        // Check ownership
        if (content.userId.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this content'
        });
        }

        // Delete file if it exists
        if (content.type === 'file' && content.fileUrl) {
        const filePath = path.join(__dirname, '../../', content.fileUrl);
        await fs.unlink(filePath).catch(err => 
            console.error('File deletion error:', err)
        );
        }

        await Content.findByIdAndDelete(id);

        res.status(200).json({
        success: true,
        message: 'Content deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
