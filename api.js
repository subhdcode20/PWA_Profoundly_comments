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




    // if(req.query.id == 1) {
    //     json = {
    //       "comments": [
    //         {
    //           comment: "comment 11111------comment 11111comment 11111comment 11111comment 11111",
    //           from: {
    //             name: "Prashant Pitti",
    //             id: "13123413412355d",
    //             imageUrl: "1400629773370951",
    //           },
    //           likes: 2,
    //           timeStamp: "1234435455555"
    //         },
    //         {
    //           comment: "hahahah hadhfifjoa oijd oijoiasjfa oijaoj aosj hahahah hadhfifjoa oijd oijoiasjfa oijaoj aosj hahahah hadhfifjoa oijd oijoiasjfa oijaoj aosj hahahah hadhfifjoa oijd oijoiasjfa oijaoj aosj hahahah hadhfifjoa oijd oijoiasjfa oijaoj aosj hahahah hadhfifjoa oijd oijoiasjfa oijaoj aosj ",
    //           from: {
    //             name: "Prashant Pitti",
    //             id: "13123413412355d",
    //             imageUrl: "1799237930126421",
    //           },
    //           likes: 2,
    //           timeStamp: "1234435455555"
    //         },
    //         {
    //           comment: "comment 2222222------comment 2222222------comment 2222222------comment 2222222------comment 2222222------",
    //           from: {
    //             name: "Haseeb Mehraj",
    //             id: "13123413412355d",
    //             imageUrl: "1620622704725965",
    //           },
    //           type: 'like',
    //           likes: 3,
    //           timeStamp: "1234435455555"
    //         },
    //         {
    //           comment: "comment 333333------comment 333333------comment 333333------comment 333333------comment 333333------comment 333333------comment 333333------comment 333333------comment 333333------comment 333333------comment 333333------comment 333333------comment 333333------",
    //           from: {
    //             "name": "Rohit Gupta",
    //             "id": "13123413412355d",
    //             "imageUrl": "1986024088082802",
    //           },
    //           likes: 100,
    //           timeStamp: "1234435455555"
    //         }
    //       ],
    //       "story" : {
    //         storyText: "This is the story texttt....s simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged",
    //         creator: {
    //           name: "Subham Dey",
    //           id: "97889655d76e978e0",
    //           imageUrl: "1810890608953142",
    //         },
    //         storyId: "134ijsfog"
    //       },
    //       "me": {
    //     		"channelId":"1799237930126421",
    //     		"imageUrl":"https://img.neargroup.me/project/50x50/profile_1799237930126421",
    //     		"name":"Subham Dey"
    //     	}
    //     }
    // } else if(req.query.id == 2) {
    //     json = {
    //         "friends": [
    //             {
    //                 "name": "Dev",
    //                 "channelId": "app123464761549791",
    //                 "imageUrl": "app123464761549791",
    //                 "meetingId": "39917045"
    //             },
    //             {
    //                 "name": "Manas",
    //                 "channelId": "1633552226682996",
    //                 "imageUrl": "1633552226682996",
    //                 "meetingId": "39917041"
    //             }
    //         ],
    //         "me": {
    //             "name": "Rohit",
    //             "channelId": "1497165653730393",
    //             "imageUrl": "1497165653730393"
    //         }
    //     }
    // } else if(req.query.id == 3) {
    //     json = {
    //         "friends": [
    //             {
    //                 "name": "Rohit",
    //                 "channelId": "1497165653730393",
    //                 "imageUrl": "1497165653730393",
    //                 "meetingId": "39917045"
    //             },
    //             {
    //                 "name": "Manas",
    //                 "channelId": "1633552226682996",
    //                 "imageUrl": "1633552226682996",
    //                 "meetingId": "39917040"
    //             }
    //         ],
    //         "me": {
    //             "name": "Dev",
    //             "channelId": "app123464761549791",
    //             "imageUrl": "app123464761549791"
    //         }
    //     }
    // }
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



app.use(express.static(path.join(__dirname, '../example/public')));
app.use(express.static(path.join(__dirname, '../dist')));


app.listen(8081, '0.0.0.0', err => {
    if (err) {
        console.warn(err);
        return;
    }
    console.info('http://localhost:8081');
});
