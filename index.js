var express = require("express")
var bodyPaser = require("body-parser")

const mongoose = require("mongoose")
const HandbookModel = require('./models/Handbook')

const { postWebHook, getWebHook } = require("./controllers/ChatBotController")

require('dotenv').config()

if (process.env.NODE_ENV && process.env.NODE_ENV === "production") {
  require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })
} else {
  require("dotenv").config()
}
var app = express()

app.use(bodyPaser.json())
app.use(bodyPaser.urlencoded({ extended: true }))
var port = process.env.PORT || 8080
const uri = process.env.DB_URL
app.listen(port, function () {
  const connection = mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log("Connected Database!")
    })
    .catch((err) => {
      console.log(err)
    })
  console.log("Example app listening on port 8080!")
})

app.get("/", async function(request, response)  {
  // let list = await HandbookModel.aggregate([
  //   {
  //     $match: {
  //       $and: [
  //         {'parentID': 15}
  //       ]
  //     }
  //   },
  // ]).skip(9).limit(9)
  // var elements = []
  // await (() => {
  //   list.forEach(item => {
  //     elements.push(
  //       {
  //         "title": item.title,
  //         "buttons": [{
  //           "type": "postback",
  //           "title": item.title,
  //           "payload": item._id,
  //         }]
  //       }
  //     )
  //   })
  // })()
  // console.log(list);
  response.render("index")
})

app.set("view engine", "ejs")
app.set("views", "./views")

app.post('/webhook', postWebHook)

// Adds support for GET requests to our webhook
app.get('/webhook', getWebHook)