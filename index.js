var express = require("express");
var bodyPaser = require("body-parser")

const { postWebHook, getWebHook } = require("./controllers/ChatBotController");

require('dotenv').config()

if (process.env.NODE_ENV && process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
} else {
  require("dotenv").config();
}
var app = express();

app.use(bodyPaser.json());
app.use(bodyPaser.urlencoded({ extended: true }))
// app.get("/", function (req, res) {
//   res.send("Hello World!");
// });

var port = process.env.PORT || 8080;
app.listen(port, function () {
})

app.get("/", function(request, response)  {
  response.render("index");
});

app.set("view engine", "ejs");
app.set("views", "./views");

app.post('/webhook', postWebHook);

// Adds support for GET requests to our webhook
app.get('/webhook', getWebHook);
