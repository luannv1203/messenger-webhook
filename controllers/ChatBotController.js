var request = require('request');

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
function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (received_message.text) {    
    // Create the payload for a basic text message
    // response = {
    //   "text": `You sent the message: "${received_message.text}". Now send me an image!`
    // }
    // const arrButton = [
    //   {
    //     "type": "postback",
    //     "title": "Thông tin về TimeBird và sơ đồ tổ chức",
    //     "payload": "Thông tin về TimeBird và sơ đồ tổ chức",
    //   },
    //   {
    //     "type": "postback",
    //     "title": "Nội quy, quy định",
    //     "payload": "Nội quy, quy định",
    //   },
    //   {
    //     "type": "postback",
    //     "title": "Chế độ đãi ngộ",
    //     "payload": "Chế độ đãi ngộ",
    //   },
    //   {
    //     "type": "postback",
    //     "title": "Chương trình đào tạo",
    //     "payload": "Chương trình đào tạo",
    //   },
    //   {
    //     "type": "postback",
    //     "title": "Tài nguyên CNTT: tài khoản công ty và lưu trữ online",
    //     "payload": "Tài nguyên CNTT: tài khoản công ty và lưu trữ online",
    //   },
    //   {
    //     "type": "postback",
    //     "title": "Quy trình dự án và và quản lý tasks công việc",
    //     "payload": "Quy trình dự án và và quản lý tasks công việc",
    //   },
    // ]
    // response = returnResponse("Xin chào bạn, để tìm hiểu thông tin cần thiết một cách nhanh nhất vui lòng lựa chọn theo các mục sau: ", arrButton)
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Xin chào bạn, để tìm hiểu thông tin cần thiết một cách nhanh nhất vui lòng lựa chọn theo các mục sau: ",
            "buttons": [
              {
                "type": "postback",
                "title": "Thông tin về TimeBird và sơ đồ tổ chức",
                "payload": "Thông tin về TimeBird và sơ đồ tổ chức",
              },
              {
                "type": "postback",
                "title": "Nội quy, quy định",
                "payload": "Nội quy, quy định",
              },
              {
                "type": "postback",
                "title": "Chế độ đãi ngộ",
                "payload": "Chế độ đãi ngộ",
              },
              {
                "type": "postback",
                "title": "Chương trình đào tạo",
                "payload": "Chương trình đào tạo",
              },
              {
                "type": "postback",
                "title": "Tài nguyên CNTT: tài khoản công ty và lưu trữ online",
                "payload": "Tài nguyên CNTT: tài khoản công ty và lưu trữ online",
              },
              {
                "type": "postback",
                "title": "Quy trình dự án và và quản lý tasks công việc",
                "payload": "Quy trình dự án và và quản lý tasks công việc",
              },
            ]
          }]
        }
      }
    }
  }
  
  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'Thông tin về TimeBird và sơ đồ tổ chức') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
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

function returnResponse(title, arrButton) {
  return {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": title,
          "buttons": arrButton,
        }]
      }
    }
  }
}