var request = require('request');
const axios = require('axios')

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
      body.entry.forEach(function(entry) {
        console.log(entry)
        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        console.log('webhook_event', webhook_event);


        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message)
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
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an image!`
    }
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

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

  console.log(request_body)

  // Send the HTTP request to the Messenger Platform

  axios({
    url: 'https://graph.facebook.com/v12.0/me/messages',
    method: 'POST',
    headers: {
      'Authorization': `Bearer EAADLlZAKTT9EBAJ3Xx0StWGAZA7CarcsfsLUpXZCxIeoP8wPZBbs7YLIEpSSGMPT2RuLgu9smT9S6rq45SW2sdmyoALFWL7BQ5Ywo0IxeHaZAkCp37pdfM7qj1PTjQ4MwdAG9nwM1asZCJ8viz2exZCDG4bQxzzznmyry3elQS1XusQSig93VO7`
    },
    data: request_body
  }).then(rs => {
    console.log(rs)
  })
  // request({
  //   "uri": "https://graph.facebook.com/v12.0/me/messages",
  //   "qs": { "access_token": 'EAAO09KjCsvABAHXysdbNxrCpKK6WABwXvV3FYF90s3ic4pwDfYVlmvvfx0ZC5QturwWPqiN39dMjAOVbeRjrkEQZAyLUBlJWxKck3AH4OAQ6G3sUDbNT2LalkTgjEvXwJ6i1W60ArUBJZB9ro493yIuQ8ScDN5X18iRZC593cs24ZCHs8dolb' },
  //   "method": "POST",
  //   "json": request_body
  // }, (err, res, body) => {
  //   console.log(process.env.TOKEN_PAGE_VERIFY);
  //   console.log(body)
  //   if (!err) {
  //     console.log('message sent!')
  //     console.log('My message: ' + JSON.stringify(response));
  //   } else {
  //     console.error("Unable to send message:" + err);
  //   }
  // });
}