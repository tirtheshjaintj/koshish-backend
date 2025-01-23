require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./helpers/db.helper');
const user = require("./routes/user.route");
const question = require("./routes/question.route");
const groq = require("./routes/groq.route");
const cookieParser = require("cookie-parser");
const category = require('./routes/category.route');
const errorHandler = require('./helpers/error.helper');
const result = require('./routes/result.route');
//MiddleWaress
const allowedOrigins = [
    process.env.FRONTEND_URL
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
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
app.use("/api/question", question);
app.use("/api/category", category);
app.use('/api/quiz', result);



app.listen(process.env.PORT, () => console.log("Server  Started"));