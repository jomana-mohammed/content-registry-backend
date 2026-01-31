const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['file', 'text'],
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: function() {
        return this.type === 'text';
        },
        maxlength: [10000, 'Content cannot exceed 10000 characters']
    },
    fileUrl: {
        type: String,
        required: function() {
        return this.type === 'file';
        }
    },
    fileSupabaseId: {
        type : String
    },
    fileName: {
        type: String
    },
    fileType: {
        type: String
    },
    fileSize: {
        type: Number
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
contentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Content', contentSchema);