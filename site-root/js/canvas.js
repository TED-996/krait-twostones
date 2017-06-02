//Get the button that serches for a match
var findMatch = document.getElementById("findMatchBtn");
;
//Get the cancel button to interrupt the search
var cancelBtn = document.getElementById("cancelBtn");

//Socket for webSockets
var socket;


findMatch.onclick = function() {
    socket = new WebSocket(getWebSocketUrl("/queue_wait"),"queueProtocol");
    socket.onmessage = function (msg) {
        if (msg.data === "already_in_queue"){
            $('#myModal').modal('hide');
            $('#inQueue').modal('show')
            console.log("already in match");
            socket.close(); //trebuie facut aici o chestie care sa zica ca esti deja in queue


        }
    }
};

cancelBtn.onclick = function() {
    socket.send("exit_queue");
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
