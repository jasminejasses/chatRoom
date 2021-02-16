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
    s:newUserData
    s:message
    s:userlistUpdate
*/

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

//A simple function to generate a random number for the usernames
function randomNr() {
    return Math.floor(Math.random() * 9999);
}

function saveUser() {

    //Create a username
    let username = `User #${randomNr()}`;

    //Loop through all users in allUsers. If their name is the same as the one just generated
    //generate a new one and loop through all of the users again
    for (let i = 0; i < allUsers.length; i++) {
        if (allUsers[i].username == username) {
            username == `User #${randomNr()}`;
            i = 0;
        }
    }

    //Save the user with their name and socket in a object in allUsers and return the name
    let user = {"username": username};
    allUsers.push(user);
    return username;
}

function newUserHandling(websocket) {

    //Create, save and get a new username
    let username = saveUser();

    //Create a object that contains the username and the saved chathistory
    let newUserObject = {
        "type": "s:newUserData",
        "data": {
            "username": username,
            "messageHistory": messageHistory
        }
    }

    //Send the object only to the new user
    sendPrivate(websocket, newUserObject);
    return username;
}

function sendPrivate(websocket, messageObj) {

    //Create a stringified message-object
    privMessage = JSON.stringify(messageObj);

    //Send the message-object
    websocket.send(privMessage);
}

function sendPublic(server, message) {

    console.log(message);

    //Create a stringified message-object
    publMessage = JSON.stringify(message);

    //Loop through all of the connected users...
    server.clients.forEach(currClient => {
        if (currClient.readyState == WebSocket.OPEN) {

            //... and send each one the message-object
            currClient.send(publMessage);
        }
    });
}

function sendMessage(server, message) {

    //Parse the message
    parsedMessage = JSON.parse(message);

    //Store the data-part
    messageHistory.push(parsedMessage.data);

    //Change the type of the message
    parsedMessage.type = "s:message";

    //Send the message to all the users
    sendPublic(server, parsedMessage);
}

function sendUserListUpdate(server) {

    //Create a message-object with the correct type and that contains the updated list of all the users
    let userListUpdateObj = {
        "type": "s:userlistUpdate",
        "data": allUsers
    }

    //Send the object to all users
    sendPublic(server, userListUpdateObj);
}

server.on('connection', (websocket) => {
    console.log('user has connected!');

    /*This function handles all the stuff that comes with a new user; creating a username,
    saving that in the user-list and sending that and the chat-history to them.
    We need to save the name in a variable so that we can reach it and compare to it when a user disconnects*/
    const username = newUserHandling(websocket);

    //This function sends the updated userlist to all users
    sendUserListUpdate(server);

    //Server recieves a message from a user
    websocket.on('message', (message) => {
        sendMessage(server, message);
    });

    //Someone disconnects
    websocket.on('close', () => {

        /*Loop through all users and, if their username matches the one we saved in a variable when
        they connected, remove them from the list*/
        allUsers.forEach(user => {
            if(user.username == username) {
                let index = allUsers.indexOf(user);
                allUsers.splice(index, 1);
            }
        });

        //Send the updated list to all users
        sendUserListUpdate(server);
    });
});