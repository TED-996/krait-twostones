//Get the button that serches for a match
var findMatch = document.getElementById("findMatchBtn");
console.log(findMatch)
//Get the cancel button to interrupt the search
var cancelBtn = document.getElementById("cancelBtn");
console.log(cancelBtn)
//Socket for webSockets
var socket;


findMatch.onclick = function() {
    socket = new WebSocket(getWebSocketUrl("/queue_wait"),"queueProtocol");
    //searchMatch.style.display = "block"
    socket.onmessage = function (msg) {
        if (msg.data === "already_in_queue"){
            console.log("already in match")
            socket.close() //trebuie facut aici o chestie care sa zica ca esti deja in queue
            //searchMatch.style.display = "none";
            console.log("already in match")
        }
    }
}

cancelBtn.onclick = function() {
    //searchMatch.style.display = "none";
    socket.send("exit_queue");
    time.sleep(1);
    socket.close()
};

function getWebSocketUrl (absolute_url) {
    var loc = window.location;
    var new_uri;
    if (loc.protocol === "https:") {
        new_uri = "wss:";
    }
    else {
        new_uri = "ws:";
    }
    new_uri += "//" + loc.host;
    new_uri += absolute_url;
    return new_uri;
}
