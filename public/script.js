'use strict';

//Create global variable that will store the name assigned to the client by the server
let myName;

// Funktion som skapar tid för messagen
function time() {
    const d = new Date();
    return d.toTimeString().slice(0, 8);
}
// Ser till att användaren alltid ser det som är nyast i chatten
function updateScroll(){
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Funktion som skapar en chattbubbla
function createBubbe(message){
    console.log(message.content.name)
    
    let bubble = document.createElement('div');
    bubble.setAttribute('class', 'message'); //ownMessage
    let sender = document.createElement('div');
    // -------------------------------------

    /*If the sender has the same name as that stored in the global variable the message is from "me"
    and the sender is set as "You" and the bubble gets the class "ownMessage"*/
    if (message.content.name == myName) {
        sender.innerHTML = message.content.time+'. You:';
        bubble.setAttribute('class', 'ownMessage');
    } else {
        sender.innerHTML = message.content.time+'. '+message.content.name + ':';
    }
    sender.setAttribute('class', 'sender');
    let theText = document.createElement('div');
    theText.setAttribute('class', 'text');
    theText.innerHTML = message.content.text;
    bubble.append(sender, theText); 
    return bubble;
}
// Funktion som placerar meddelandet i chatten
function postMessage(message) {
    // Create message-bubble with the text from input - (param given from keyup function)
    let bubble = createBubbe(message);
    chatBox.append(bubble);
}
// Funktion för att placera ett nytt meddelande i chatten (onödigt mellanled?)
function chatMessage(data) {
    postMessage(data);
} 
// Funktion för att placera history i chatten vid connect och spara användarnamnet
function chatHistory(data) {

    //Put the assigned username in myName
    myName = data.data.username;
    let messageHistory = data.data.messageHistory
    messageHistory.forEach((message) => {
      postMessage(message);
    });
}
// Funktion som uppdaterar connectade users 
function userList(message) {
    // Tömmer alla users
    usersWrapper.innerHTML = '';
    // Tar ut datan från message-obj från servern
    let list = message.data;
    // Går igenom alla users (med den nya tillagd eller borttagen) o appendar dem på nytt
    list.forEach((user) => {
        let userDiv = document.createElement('div');
        let userName = document.createElement('div');
        let dot = document.createElement('div');

        userDiv.className = 'user';
        userName.className = 'userName';
        dot.className = 'dot';
        userName.innerHTML = user.username;

        userDiv.append(userName, dot)
        usersWrapper.append(userDiv);
    });
}

/* --- lägg till sen?
// Handles user connections
function userJoin(data) {
    const div = document.createElement('div');
    div.className = 'user';
    div.textContent = data.name; // same as `innerHTML` (text only)
    users.append(div);
  
    postMessage({
      time: time(),
      text: `${data.name} joined the channel.`,
      name: 'Server'
    });
}
  
// Handles user disconnections
function userLeave(data) {
    document.querySelectorAll('.user').forEach((elem) => {
        if (elem.textContent == data.name) {
        elem.remove();
        }
    });
  
    postMessage({
        time: time(),
        text: `${data.name} left the channel.`,
        name: 'Server'
    });
}
*/


// Här finns funktionerna som lyssnar på events från ws och som hanterar meddelanden samlade
const ACTIONS = {
    's:userlistUpdate': userList, // denna uppdateras både på join och leave
    's:message': chatMessage,
    's:newUserData': chatHistory // denna ger historiken till en ny connecter 
  };

// Skapa en WebSocket-server
// Ska lyssna till open, message, close
const socket = new WebSocket('ws://localhost:4269');
// Vid connect
socket.addEventListener('open', () => {
    console.log('Opened');
  });
// Vid disconnect
socket.addEventListener('close', () => {
    console.log('Closed');
});
// Vid skrivet meddelande
socket.addEventListener('message', (event) => {
    let data = JSON.parse(event.data);
    console.log(data)
    // Check if 
    if (ACTIONS[data.type] !== undefined) {
      // Call the action with the received payload ------ vet inte vad data.payload ska va? bara data?
      ACTIONS[data.type](data);
    }
});

function send(messageToServer) {
    // Stringify to send it to webSocket-server
    socket.send(JSON.stringify(messageToServer));
}

// Lägg till knapp-event?
inputText.addEventListener('keyup', (event) => {
    // Check if someone pressed <Enter> && if there is text in the input field
    if (event.keyCode == 13 && inputText.value !== '') {
        
        let textFromInput = inputText.value;
  
        // Create the message to the server
        let message = { text: textFromInput, time: time(), name: myName };
    
        // Send the message to the server as a chat:message
        send({ type: 'chat:message', content: message });
        //postMessage(message);
    
        // Clear the input field
        inputText.value = '';

        // Scroll to the bottom
        updateScroll();
    }
  });