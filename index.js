const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
require("dotenv").config();
const seats = require("./Controllers/data.js")

const PORT = process.env.PORT || 8000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


const connection = mongoose.connect(
    process.env.MONGO_DB_ADD,
    {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

connection
  .then((response) => {
    console.log("Database has been connected!");
    app.listen(PORT, () => {
      console.log(`Server is running on Port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  }
);


app.use("/seats", seats)