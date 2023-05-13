const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3300;
//
app.get("/", (req, res) => {
  res.send("welcome");
});

//
const postRoute = require("./routes/post.route");
const userRoute = require("./routes/user.route");
app.use("/", userRoute);
app.use("/", postRoute);

//
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}.`);
});
