const express = require("express");
const app = express();
const cors = require("cors");

const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");
const taskRoute = require('./routes/taskRoutes');

const setupSwagger = require("./config/swagger");

// Middleware
app.use(express.json());
app.use(cors());

const allowedOrigin = process.env.NODEJS_BACKEND_URL;

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Routes
app.use("/psiborg/auth", authRoute);
app.use("/psiborg/user", userRoute);
app.use("/psiborg/task", taskRoute);

setupSwagger(app);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

module.exports = app;
