'use strict'
const common = require("../common/common");
const lineSdk = require("@line/bot-sdk");

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
// create LINE SDK clientz
const client = new lineSdk.Client(config);

exports = module.exports = line;
exports.client = client;

const scene1DApp = require("../scene1D/scene1D");
const scene3App = require("../scene3/scene3");

function line(params) {
    
    var app = params["app"];
    
    app.post("/callback", lineSdk.middleware(config), (req, res) => {
        req.session.destroy();
        if (req.body.destination) {
            console.log("Destination User ID: " + req.body.destination);
        }
        // req.body.events should be an array of events
        if (!Array.isArray(req.body.events)) {
            return res.status(500).end();
        }
        // handle events separately
        Promise.all(req.body.events.map(handleEvent))
            .then(() => res.end())
            .catch((err) => {
            res.status(500).end();
        });
    });
}

// callback function to handle a single event
function handleEvent(event) {
    
    if (event.replyToken && event.replyToken.match(/^(.)\1*$/)) {
        return console.log("Test hook recieved: " + JSON.stringify(event.message));
    }
    
    // Hash -> Encrypt 必要
    var crypto = require('crypto');
    var hashHex = crypto.createHash('sha256').update(event.source.userId, 'utf8').digest('hex');
    var userId = hashHex;
    var dataObj = common.getLineData(userId);
    
    // シナリオ１｀ または シナリオ３
    if(false){
        scene1DApp.scene1DFunc1({"event":event, "client":client, "userId":userId, "dataObj":dataObj})    
        return;
    } else {
        scene3App.scene3Func({"event":event, "client":client, "userId":userId, "dataObj":dataObj})    
        return;
    }
}


