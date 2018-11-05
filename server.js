"use strict";

const config = require("./config.js");
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require('fs');
const text2png = require('text2png');


/*
  We use two different Express servers for security reasons: our webhooks
  endpoint needs to be publicly accessible, but we don't want our monitoring
  dashboard to be publicly accessible since it may contain sensitive data.
*/

// The first Express server will serve Fluxcloud Monitor (on a different port).
const monitor = express();
const monitorServer = http.Server(monitor);
// We'll set up Socket.io to notify us of new events
const io = socketio(monitorServer);
let recentEvents = [];

// Serve static files and start the server
monitor.use(express.static(path.join(__dirname, "public")));
monitorServer.listen(config.port, () => {
  console.log(`Fluxcloud Monitor is up: http://localhost:${config.port}`);
});

// Provides the 20 most recent events (useful when the app first loads)
monitor.get("/recent-events", async (req, res) => {
  // let response = await stripe.events.list({ limit: 20 });
  // recentEvents = response.data;
  res.send(recentEvents);
});

// The second Express server will receive webhooks
const webhooks = express();
const webhooksPort = config.port + 1;
const resultStorage = path.join(__dirname, "public/resultimages/");

webhooks.use(bodyParser.json());
webhooks.listen(webhooksPort, () => {
  console.log(`Listening for webhooks: http://localhost:${webhooksPort}`);
});

// Provides an endpoint to receive webhooks
webhooks.post("/", async (req, res) => {
  let event = req.body;
  // Send a notification that we have a new event
  // Here we're using Socket.io, but server-sent events or another mechanism can be used.
  recentEvents.push(event);
  io.emit("event", event);

  // Stripe needs to receive a 200 status from any webhooks endpoint
  res.sendStatus(200);

  // If enabled, for each successful Deployment, generate a status image that can be referenced
  // from somewhere else (like a GitHub repo)
  if (config.generateResultImage) {
    //console.log(event.Event.metadata.result);
    for (const key in event.Event.metadata.result) {
      if (event.Event.metadata.result.hasOwnProperty(key)) {
        const element = event.Event.metadata.result[key];
        if (element.Status != "ignored") {
          console.log('Key: ' + key);

          var perContainer = "";
          element.PerContainer.forEach(element => {
            perContainer = perContainer + element.Target + '\n';
          });

          var resultFileName = resultStorage + key.replace(':', '_').replace('/', '_') + '.png';
          fs.writeFileSync(resultFileName, text2png(key + '\n' + 'Last deployment:' + '\n' + perContainer + '\n' + Date(), { color: 'blue' }));
          
          console.log('Result image written to ' + resultFileName);
        }
      }
    };
  }


});

