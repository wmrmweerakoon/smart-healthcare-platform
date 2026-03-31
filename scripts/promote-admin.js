const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from auth-service
dotenv.config({ path: path.join(__dirname, '../services/auth-service/.env') });

const promote = async () => {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: node scripts/promote-admin.js <user-email>');
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare-auth';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    // Access the 'users' collection directly using a generic schema
    const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { collection: 'users' }));
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`SUCCESS: User ${email} is now an ADMIN.`);
    process.exit(0);
  } catch (err) {
    console.error('Error promoting user:', err.message);
    process.exit(1);
  }
};

promote();
