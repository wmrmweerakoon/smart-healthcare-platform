const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            required: [true, 'Patient user ID is required'],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Report title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        fileUrl: {
            type: String,
            required: [true, 'File URL is required'],
        },
        fileName: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
            enum: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        },
        fileSize: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

// Index for efficient patient-based queries with sorting
ReportSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);
