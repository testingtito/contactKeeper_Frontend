const mongoose = require('mongoose'); // bring in mongoose
const config = require('config') // bring in config
const db = config.get('mongoURI');

// mongoose returns promise
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log("MongoDB Connected.");
  } catch (err) {
    console.log(err.message);
    process.exit(1); // Exit with the failure    
  }
}

module.exports = connectDB;