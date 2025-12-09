require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const port = process.env.PORT || 5000;

//API security
app.use(helmet());

//handle CORS error
app.use(cors());

//MongoDB Connection Setup
const mongoose = require("mongoose");

if (!process.env.MONGO_URL) {
  console.error("ERROR: MONGO_URL is not defined in .env file");
  process.exit(1);
}

const mongoUrl = process.env.MONGO_URL ? process.env.MONGO_URL.replace("localhost", "127.0.0.1") : "";

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

if (process.env.NODE_ENV !== "production") {
  const mDb = mongoose.connection;
  mDb.on("open", () => {
    console.log("MongoDB is conneted");
  });

  mDb.on("error", (error) => {
    console.log(error);
  });

  //Logger
  app.use(morgan("tiny"));
}

// Set body bodyParser

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Load routers
const userRouter = require("./src/routers/user.router");
const ticketRouter = require("./src/routers/ticket.router");
const tokensRouter = require("./src/routers/tokens.router");

//Use Routers
app.use("/v1/user", userRouter);
app.use("/v1/ticket", ticketRouter);
app.use("/v1/tokens", tokensRouter);

app.get("/", (req, res) => {
  res.send("API is ready");
});

//Error handler
const handleError = require("./src/utils/errorHandler");

app.use((req, res, next) => {
  const error = new Error("Resources not found!");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  handleError(error, res);
});

app.listen(port, () => {
  console.log(`API is ready on http://localhost:${port}`);
});
