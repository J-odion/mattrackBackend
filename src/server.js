const express = require("express");
const connectDB = require("./utils/database");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const auth = require("./middleware/auth");
const cors = require("cors");
const errorHandler = require("./middleware/error");


dotenv.config();
connectDB();

const app = express();

const ALLOWED_ORIGINS = [
  "https://mattrack.vercel.app",
  "https://mattrack-app.vercel.app",
  "https://mattrack.kairoshof.com",
  "http://localhost:3000",
  "http://localhost:6000",
  "http://localhost:5000",
  "http://localhost:3001",
];

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ALLOWED_ORIGINS;
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const PORT = process.env.PORT;

app.use("/api", require("./routes/user"));
app.use("/api", require("./routes/tableRoutes"));
app.use("/api", require("./routes/standardAllocation"));
app.use("/api", require("./routes/transfer"));
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));