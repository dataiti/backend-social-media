require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./src/configs/configDB");
const handleError = require("./src/middlewares/errorHandler");
const appRoutes = require("./src/routes");

const app = express();

// database
connectDB();

// middleware
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "./src/publics")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: `http://localhost:${process.env.PORT_CLIENT}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// router
appRoutes(app);

// handle error
handleError(app);

const port = 5000 || process.env.PORT;
app.listen(port, () => {
  console.log("✅ Server running on port " + port);
});
