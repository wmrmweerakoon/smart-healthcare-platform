const mongoose = require('mongoose');

// This matches the schema in auth-service
const UserSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        role: String,
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true, collection: 'users' } // Force collection name to 'users'
);

module.exports = mongoose.model('User', UserSchema);
