const express = require("express");
const connectDB = require("./utils/database");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const errorHandler = require("./middleware/error");

dotenv.config();
connectDB();

const app = express();

const ALLOWED_ORIGINS = [
  "https://mattrack.vercel.app",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:3001",
];

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// CORS configuration
const corsOptions = {
  origin:  ALLOWED_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

const PORT = process.env.PORT || 6000;

app.use("/api", require("./routes/tableRoutes"));
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
