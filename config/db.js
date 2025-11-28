import mongoose from "mongoose";

// Cache the connection promise to prevent multiple connections in serverless
let cachedConnection = null;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error("MONGO_URI environment variable is not set");
    }

    // Return cached connection if already connected
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Return cached promise if connection is in progress
    if (cachedConnection) {
      return cachedConnection;
    }

    // Connection options optimized for serverless
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering (important for serverless)
      bufferMaxEntries: 0, // Disable mongoose buffering
      // Serverless-specific optimizations
      connectTimeoutMS: 10000, // Connection timeout
    };

    // Create connection promise and cache it
    cachedConnection = mongoose.connect(mongoURI, options)
      .then((conn) => {
        console.log("✅ MongoDB Connected");
        return conn;
      })
      .catch((error) => {
        // Clear cache on error so we can retry
        cachedConnection = null;
        throw error;
      });

    return cachedConnection;
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    cachedConnection = null; // Clear cache on error
    
    // Don't exit process in serverless environment
    if (process.env.VERCEL) {
      // In serverless, we want to throw but not crash the function
      // Individual routes can handle the error
      throw error;
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
