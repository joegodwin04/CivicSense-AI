require("dotenv").config();

const app = require("./app");
const connectDB = require("./database/db");
const logger = require("./utils/logger");

// Connect to MongoDB
connectDB();

console.log(process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});