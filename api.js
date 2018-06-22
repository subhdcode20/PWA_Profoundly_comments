const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/json' }));
// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }));
// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));


app.post('/data/signin', (req, res) => {
    fs.readFile(path.join(__dirname, '../example/public/data/signin.json'), 'utf8', function(error, content) {
        var json = JSON.parse(content);
        res.end(JSON.stringify(json));
    });
});


app.get('/getComments', (req, res) => {
    let json;
      console.log('in api getComments id 1');
      json = {
    "currentUser": {
        "currentUserPic": "https://img.neargroup.in/forcesize/512x512/pixelate_30/profile_1234215356692906",
        "currentUserName": "Akshay",
        "currentUserChannelId": "1234215356692906"
    },
    "comments": [
        {
            "comment": "hahahahah",
            "from": {
                "commenterPic": "https://img.neargroup.in/forcesize/512x512/pixelate_30/profile_1799237930126421",
                "commenterUserName": "Subham Dey",
                "commentingChannelId": "1799237930126421"
            },
            "time": "2018-06-06 19:09:28.0"
        },
        {
            "comment": "another commenttt....another commenttt....another commenttt....another commenttt....another commenttt....another commenttt....another commenttt....another commenttt....",
            "from": {
                "commenterPic": "https://img.neargroup.in/forcesize/512x512/pixelate_30/profile_1799237930126421",
                "commenterUserName": "Subham Dey",
                "commentingChannelId": "1799237930126421"
            },
            "time": "2018-06-06 19:49:47.0"
        }
    ],
    "story": {
        "storyId": "598",
        "storyTime": "2018-05-28 14:48:57.0",
        "creator": {
            "creatorChannelId": "1234215356692906",
            "creatorName": "Akshay",
            "creatorPic": "https://img.neargroup.in/forcesize/512x512/pixelate_30/profile_1234215356692906"
        },
        "wowCount": "1",
        "story": "ooooooooooooooooooooooooooooooooooooooooooooooooo"
    }
}

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.end(JSON.stringify(json));
});

app.post('/saveComment', (req, res) => {
   let json = {"Response":false,"isVulgar":true,"channelId":"13513515135134","timestamp": "2018-06-06 19:09:28.0"}
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   res.end(JSON.stringify(json));
})

app.post('/followOnComment', (req, res) => {
  let json = {
    "Response":"Followed",
  }
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.end(JSON.stringify(json));
})



app.use(express.static(path.join(__dirname, '../example/public')));
app.use(express.static(path.join(__dirname, '../dist')));


app.listen(8081, '0.0.0.0', err => {
    if (err) {
        console.warn(err);
        return;
    }
    console.info('http://localhost:8081');
});
