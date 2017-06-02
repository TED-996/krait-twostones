//Get the button that serches for a match
var findMatch = document.getElementById("findMatchBtn");

//Get the cancel button to interrupt the search
var cancelBtn = document.getElementById("cancelBtn");

//Socket for webSockets
var socket;

var leaveBtn = document.getElementById("leaveBtn");
var joinBtn = document.getElementById("joinBtn");


findMatch.onclick = function() {
    socket = new WebSocket(getWebSocketUrl("/queue_wait"),"queueProtocol");
    socket.onmessage = function (msg) {
        if (msg.data === "already_in_queue") {
            $('#myModal').modal('hide');
            $('#inQueue').modal('show');
            console.log("already in match");
            socket.close();
        }
        else if(msg.data === "match_ready"){
            console.log("match ready")
            $('#myModal').modal('hide');
            $('#matchFoundModal').modal('show');
            }
        else if(msg.data === "match_ok"){
            console.log("redirect to game page");
            $(location).attr('href', '/gameplay')
        }
        else if(msg.data === "return_to_queue"){
            console.log("return to queue");
            $('#matchFoundModal').modal('hide');
            $('#myModal').modal('show');
        }
        else if(msg.data === "removed_from_queue"){
            console.log("removed from queue");
            $('#matchFoundModal').modal('hide');
            socket.close()
        }
    }
};

cancelBtn.onclick = function() {
    socket.send("exit_queue");
    socket.close();
};

leaveBtn.onclick = function(){
    console.log("match_declined")
    socket.send("deny_match");
    socket.close();
    $('#matchFoundModal').modal('hide');
}

joinBtn.onclick = function(){
    console.log("match_accepted")
    socket.send("accept_match");
}

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
