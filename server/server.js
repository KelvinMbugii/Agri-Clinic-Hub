// Load environment variables BEFORE importing app/db
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const { loadPlantDiseaseModel } = require("./services/aiService");

(async () => {
  await loadPlantDiseaseModel();
})();



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});
