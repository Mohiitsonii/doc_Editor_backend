import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbConnect = async () => {
  const dbURI = process.env.MONGODB_URI;

  if (!dbURI) {
    console.error('MongoDB URI is not defined in environment variables.');
    process.exit(1); 
  }

  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Successfully connected to MongoDB...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message || error);
    process.exit(1); 
  }
};

export default dbConnect;
