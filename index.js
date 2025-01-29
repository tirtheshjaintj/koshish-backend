require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./helpers/db.helper.js');
const user = require("./routes/user.route.js");
const groq = require("./routes/groq.route.js");
const classRoutes = require("./routes/class.route.js")
const registrations = require("./routes/registrations.route.js");
const cookieParser = require("cookie-parser");
const errorHandler = require('./helpers/error.helper.js');
const allowedOrigins = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: (origin, callback) => {
        const isAllowed = !origin || allowedOrigins.includes(origin);
        callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
connectDB();
app.get("/", (req, res) => {
    return res.send("<h1>Working Fine</h1>");
});
app.use(errorHandler);
app.use("/api/user", user);
app.use("/api/groq", groq);
app.use("/api/class", classRoutes);
app.use("/api/registrations", registrations);


app.listen(process.env.PORT, () => console.log("Server  Started"));