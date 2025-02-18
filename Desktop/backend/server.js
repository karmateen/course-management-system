const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/connectDB");
const { errorHandler } = require("./middlewares/errorMiddleware");
const usersRouter = require("./routes/usersRouter");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const coursesRouter = require("./routes/coursesRouter");
const courseSectionsRouter = require("./routes/courseSectionsRouter");
const progressRouter = require("./routes/progressRouter");
connectDB();
const app = express();
// Middleware

const corsOptions = {
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true, // This is important for cookies
};

app.use(cors(corsOptions));
app.use(express.json()); // Parses incoming JSON requests
// Use cookie-parser
app.use(cookieParser());
// Routes
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/course-sections", courseSectionsRouter);
app.use("/api/v1/progress", progressRouter);

//--Error handling middleware---
app.use(errorHandler);
// Starting the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port.. ${PORT}`);
});

// Handle undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});
