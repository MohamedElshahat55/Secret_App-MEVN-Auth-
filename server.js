const express = require("express");
const cors = require("cors");
// const credentials = require("./middlewares/credentials");
const corsOptions = require("./config/cors");
const authenticationMiddleware = require("./middlewares/authentication");
const dbConnection = require("./config/database");
const cookieParser = require("cookie-parser");
const path = require("path");
const errorHandler = require("./middlewares/error_handler");
const mongoose = require("mongoose");
const app = express();

// application Config
require("dotenv").config();
// Connection database
dbConnection();

// allow credentials
// app.use(credentials());

// cors
app.use(cors(corsOptions));

// b. express.urlencoded() is a method inbuilt in express to recognize the incoming Request Object as strings or arrays. This method is called as a middleware in your application using the code: app.use(express.urlencoded());
app.use(express.urlencoded({ extended: false }));

// application/json/response => parse request object to json object
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

app.use(authenticationMiddleware);

// static files
app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Sever
const PORT = 3500;

// default error handler
app.use(errorHandler);

// routes
app.use("/api/auth", require("./routes/api/auth"));

// page not found
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("json")) {
    res.json("error:404 not found");
  } else {
    res.type("text").send("404 not found");
  }
});

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING 🤞 ON PORT ${PORT}`);
});
