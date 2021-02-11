'use strict';

// funktion som skapar en chattbubbla
function createBubbe(inputText){
    let bubble = document.createElement('div');
    bubble.setAttribute('class', 'message');
    let sender = document.createElement('div');
    // --------------------------------------------Ändra så sender blir den som skickar 
    // - om det är en själv så ska den även få klassen .ownMessage-----------------------------------------
    sender.innerHTML = 'user_123';
    sender.setAttribute('class', 'sender');
    let text = document.createElement('div');
    text.setAttribute('class', 'text');
    text.innerHTML = inputText;
    bubble.append(sender, text); 
    return bubble;
}

// Ser till att användaren alltid ser det som är nyast i chatten
function updateScroll(){
    chatBox.scrollTop = chatBox.scrollHeight;
}

// clickfunktion på send som hämtar input och skickar det till funktionen som skapar bubblan
// + appendar den i boxen
sendBtn.addEventListener("click", (e) => {
    if (inputText.value !== ''){
        let textFromInput = inputText.value;
        inputText.value = '';
        let bubble = createBubbe(textFromInput);
        chatBox.append(bubble);
        updateScroll();
    }
});