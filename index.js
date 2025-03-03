require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./helpers/db.helper");
const user = require("./routes/user.route");
const groq = require("./routes/groq.route");
const classRoutes = require("./routes/class.route");
const registrations = require("./routes/registrations.route");
const cookieParser = require("cookie-parser");
const events = require("./routes/event.route.js");
const errorHandler = require("./helpers/error.helper.js");
const resultRouter = require("./routes/result.route.js");
// const Class = require("./models/class.model.js");
const allowedOrigins = [process.env.FRONTEND_URL];
 
 connectDB();
const corsOptions = {
  origin: (origin, callback) => {
    const isAllowed = !origin || allowedOrigins.includes(origin);
    callback(isAllowed ? null : new Error("Not allowed by CORS"), isAllowed);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.send("<h1>Working Fine</h1>");
});
app.use(errorHandler);
app.use("/api/user", user);
app.use("/api/groq", groq);
app.use("/api/class", classRoutes);
app.use("/api/registrations", registrations);
app.use("/api/result", resultRouter);
app.use("/api/event", events);

app.listen(process.env.PORT, () => console.log("Server  Started"));
