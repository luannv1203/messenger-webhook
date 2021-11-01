var request = require('request');
const HandbookModel = require('../models/Handbook')
var currentID

module.exports = {
  getWebHook: (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  },
  postWebHook: (req, res) => {
    // Parse the request body from the POST
    let body = req.body;
    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      console.log(body.entry)
      body.entry.forEach(function(entry) {

        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);
        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);
      
        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);        
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
        
      });

      // Return a '200 OK' response to all events
      res.status(200).send('EVENT_RECEIVED');

    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  }
}
// Handles messages events
async function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (received_message.text) {    
    // Create the payload for a basic text message
    // response = {
    //   "text": `You sent the message: "${received_message.text}". Now send me an image!`
    // }
    let keywordResult = await HandbookModel.findOne({ keywords: { $regex: ".*" + received_message.text + ".*" } })
    if (keywordResult) {
      callSendAPI(sender_psid, {"text": keywordResult.content})
    } else {
      let res = await HandbookModel.aggregate([
        { $match: {
          $and: [
            {'parentID': null}
          ]
        }}
      ])
      var elements = []
      await (() => {
        res.forEach(item => {
          elements.push(
            {
              "title": item.title,
              "buttons": [{
                "type": "postback",
                "title": item.title,
                "payload": item._id,
              }]
            }
          )
        })
      })()
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": elements
          }
        }
      }
      callSendAPI(sender_psid, {"text": `Xin chào bạn, để tìm hiểu thông tin cần thiết một cách nhanh nhất vui lòng lựa chọn theo các mục sau`})
      callSendAPI(sender_psid, response);
    }
  }
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;
  console.log(payload)
  console.log(typeof payload)
  if(payload !== '10') {
    currentID = payload
    console.log(11111111, currentID)
    let res = await HandbookModel.findById(payload)
    if(res.isParent) {
      let list = await HandbookModel.aggregate([
        {
          $match: {
            $and: [
              {'parentID': res.id}
            ]
          }
        },
      ]).limit(9)
      var elements = []
      await (() => {
        list.forEach(item => {
          elements.push(
            {
              "title": item.title,
              "buttons": [{
                "type": "postback",
                "title": item.title,
                "payload": item._id,
              }]
            }
          )
        })
        if(list.length === 9) {
          elements[9] = {
            "title": "Xem thêm",
            "buttons": [{
              "type": "postback",
              "title": "Xem thêm",
              "payload": 10,
            }]
          }
        }
      })()
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": elements
          }
        }
      }
      callSendAPI(sender_psid, {"text": "Mời bạn tiếp tục chọn danh mục quan tâm"});
      callSendAPI(sender_psid, response);
    } else {
      response = {"text": res.content}
      callSendAPI(sender_psid, response);
    }
  } else {
    console.log(2222222, currentID)
    let res = await HandbookModel.findById(currentID)
    let list = await HandbookModel.aggregate([
      {$match: {'parentID': res.id}},
    ]).skip(9).limit(9)
    var elements = []
    await (() => {
      list.forEach(item => {
        elements.push(
          {
            "title": item.title,
            "buttons": [{
              "type": "postback",
              "title": item.title,
              "payload": item._id,
            }]
          }
        )
      })
    })()
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": elements
        }
      }
    }
    callSendAPI(sender_psid, {"text": "Mời bạn tiếp tục chọn danh mục quan tâm"});
    callSendAPI(sender_psid, response);
  }
  
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v12.0/me/messages",
    "qs": { "access_token": process.env.TOKEN_PAGE_VERIFY },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
      console.log('My message: ' + JSON.stringify(response));
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

async function buildResponse(res) {
  var elements = []
  await (() => {
    res.forEach(item => {
      elements.push(
        {
          "title": item.title,
          "buttons": [{
            "type": "postback",
            "title": item.title,
            "payload": item._id,
          }]
        }
      )
    })
  })()

  return 
}