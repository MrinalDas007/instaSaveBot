var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const cheerio = require("cheerio");

app.use(bodyParser.json()); // for parsing application/json
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
); // for parsing application/x-www-form-urlencoded
app.use(cors());

// accepts the URL of an instagram page
const getVideo = (url) => {
  // calls axios to go to the page and stores the result in the html variable
  console.log("Getting html...");
  const html = axios.get(url);
  // calls cheerio to process the html received
  console.log("Processing html...");
  const $ = cheerio.load(html.data);
  // searches the html for the videoString
  console.log("Processing Video Link...");
  const videoString = $("meta[property=og:description]").next().text();
  const videoDict = JSON.parse(videoString);
  const videoUrl = videoDict["video"][0]["contentUrl"];
  // returns the videoString
  return videoUrl;
};

//This is the route the API will call
app.post("/new-message", function (req, res) {
  const { message } = req.body;
  console.log("Message received: " + message.text);

  //Each message contains "text" and a "chat" object, which has an "id" which is the chat id
  if (!message) {
    // In case a message is not present, or if our message does not have the word marco in it, do nothing and return an empty response
    console.log("Desired message not found: " + message.text);
    return res.end();
  }

  // If we've gotten this far, it means that we have received a message containing the word "marco".
  // Respond by hitting the telegram bot API and responding to the appropriate chat_id with the word "Polo!!"
  // Remember to use your own API toked instead of the one below  "https://api.telegram.org/bot<your_api_token>/sendMessage"
  else if (
    message.text.toLowerCase().indexOf("hey") >= 0 ||
    message.text.toLowerCase().indexOf("hi") >= 0
  ) {
    console.log("Bot ready");
    axios
      .post(
        "https://api.telegram.org/bot" + process.env.API_TOKEN + "/sendMessage",
        {
          chat_id: message.chat.id,
          text: "Ready!!",
        }
      )
      .then((response) => {
        // We get here if the message was successfully posted
        console.log("Message posted");
        res.end("ok");
      })
      .catch((err) => {
        // ...and here if it was not
        console.log("Error :", err);
        res.end("Error :" + err);
      });
  } else if (
    message.text.toLowerCase().indexOf("https://www.instagram.com/") >= 0
  ) {
    console.log("Link request received");
    const videoLink = undefined;
    try {
      // call the getVideo function, wait for videoString and store it
      // in the videoLink variable
      videoLink = getVideo(message.text);
      // if we get a videoLink, send the videoLink back to the user
      if (videoLink !== undefined) {
        videoLink = videoLink;
      } else {
        // if the videoLink is invalid, send a JSON response back to the user
        videoLink = "The link you have entered is invalid.";
      }
    } catch (err) {
      // handle any issues with invalid links
      videoLink = "There is a problem with the link you have provided.";
    }

    console.log("Video link found: " + videoLink);

    axios
      .post(
        "https://api.telegram.org/bot" + process.env.API_TOKEN + "/sendMessage",
        {
          chat_id: message.chat.id,
          text: videoLink,
        }
      )
      .then((response) => {
        // We get here if the message was successfully posted
        console.log("Message posted");
        res.end("ok");
      })
      .catch((err) => {
        // ...and here if it was not
        console.log("Error :", err);
        res.end("Error :" + err);
      });
  } else {
    console.log("Desired message not found: " + message.text);
    return res.end();
  }
});

// Finally, start our server
app.listen(3000, function () {
  console.log("Telegram app listening on port 3000!");
});
