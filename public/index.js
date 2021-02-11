const socket = new WebSocket('ws://localhost:4269');

socket.addEventListener('open', (event) => {
    console.log('connected!');
});

function send(data) {
    let JSONData = JSON.stringify(data);
    socket.send(JSONData);
}