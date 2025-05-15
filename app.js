const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./index");
require("dotenv").config();
const URL = process.env.connectionString;

mongoose
  .connect(URL)
  .then((res) => console.log("Connected to db successfully"))
  .catch((ex) => console.log(ex));

const userRoute = require("./Routes/userRoutes");
const app = express();
const corsOptions = {
  exposedHeaders: ["x-auth-token", "Authorization"],
};

app.use(cors(corsOptions));

app.use(cors());
app.use(express.json());
app.use("/users", userRoute);
app.use("/", routes);

app.listen(5000, () => console.log("Listening on port 5000....."));
