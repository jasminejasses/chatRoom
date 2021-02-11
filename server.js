//HTTP-stuff
const express = require('express');
const app = express();
const port = 6942;

app.use(express.static('public'));
app.listen(port, () => {
    console.log('Server Started');
})

//WebSocket-stuff
const WebSocket = require('ws');
const server = new WebSocket.Server({port: 4269});

/*List of available kinds of messages
user-side
    u:connect
    u:message
    u:disconnect
server-side
    s:allMessages
    s:message*/

/*Anatomy of a message-object
{
    "type": "x:xxxxxx",
    "data": {
        "user": "xxxxx",
        "timestamp": "xx:xx",
        "message": "xxxxxx xx xxxxx"
    }
}*/

//Define the arrays that will hold the different kinds of content
let messageHistory = [];
let allUsers = [];

function randomNr() {
    return Math.floor(Math.random) * Math.floor(9999);
}

function saveUser(websocket) {
    let username = `User #${randomNr()}`;
    let user = {"username": username, "socket": websocket};
    allUsers.push(user);
}

function sendPrivate(websocket) {

    //Create a stringified message-object
    privMessage = JSON.stringify({"type": 's:allMessages', "data": messageHistory});

    //Send the message-object
    websocket.send(privMessage);
}

function sendPublic(server, message) {

    //Create a stringified message-object
    publMessage = JSON.stringify({"type": 's:message', "data": message});

    //Loop through all of the connected users...
    server.clients.forEach(currClient => {
        if (currClient.readyState == WebSocket.OPEN) {

            //... and send each one the message-object
            currClient.send(publMessage);
        }
    });
}

server.on('connection', (websocket) => {
    console.log('user has connected!');

    //Add them to the user-list
    saveUser(websocket);

    //Send all previous messages to them
    sendPrivate(websocket);

    //Server recieves a message from a user
    websocket.on('message', (message) => {

        //Parse the "data"-part of the message
        parsedMessage = JSON.parse(message.data);

        //Store the data-part
        messageHistory.push(parsedMessage);

        //Send the message to all the users
        sendPublic(server, parsedMessage);
    });

    websocket.on('close', (websocket) => {
        
    })
});