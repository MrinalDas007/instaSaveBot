var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

app.use(bodyParser.json()); // for parsing application/json
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
); // for parsing application/x-www-form-urlencoded
app.use(cors());

// accepts the URL of an instagram page
const getVideo = async (url) => {
  var videoUrl = undefined;

  // API call to get the downloadable video url
  const options = {
    method: "GET",
    url: process.env.API_URL,
    params: {
      url: url,
    },
    headers: {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": process.env.API_HOST,
    },
  };

  try {
    const response = await axios.request(options);
    videoUrl = response.data["media"];
  } catch (error) {
    console.error(error);
  }
  // returns the videoString
  return videoUrl;
};

//This is the route the API will call
app.post("/new-message", async (req, res) => {
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
    message.text.toLowerCase().indexOf("hey") == 0 ||
    message.text.toLowerCase().indexOf("hi") == 0
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
    message.text.toLowerCase().indexOf("https://www.instagram.com/") >= 0 ||
    message.text.toLowerCase().indexOf("https://instagram.com/") >= 0
  ) {
    console.log("Link request received");
    videoLink = undefined;
    try {
      // call the getVideo function, wait for videoString and store it
      // in the videoLink variable
      videoLink = await getVideo(message.text);
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
    console.log("Bot not ready");
    axios
      .post(
        "https://api.telegram.org/bot" + process.env.API_TOKEN + "/sendMessage",
        {
          chat_id: message.chat.id,
          text: "Sorry!! Please provide correct input.",
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
  }
});

// the callback is an async function
// app.post("/api/download", async (request, response) => {
//   console.log("request coming in...");

//   try {
//     // call the getVideo function, wait for videoString and store it
//     // in the videoLink variable
//     const videoLink = await getVideo(request.body.url);
//     // if we get a videoLink, send the videoLink back to the user
//     if (videoLink !== undefined) {
//       response.json({ downloadLink: videoLink });
//     } else {
//       // if the videoLink is invalid, send a JSON response back to the user
//       response.json({ error: "The link you have entered is invalid. " });
//     }
//   } catch (err) {
//     // handle any issues with invalid links
//     response.json({
//       error: "There is a problem with the link you have provided.",
//     });
//   }
// });

// Finally, start our server
app.listen(3000, function () {
  console.log("Telegram app listening on port 3000!");
});
