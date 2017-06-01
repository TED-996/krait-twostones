// Get the modal
var searchMatch = document.getElementById('searchMatch');

//Get the button that serches for a match
var findMatch = document.getElementById("findMatchBtn");

//Get the cancel button to interupt the search
var cancelBtn = document.getElementById("cancel");

//Socket for webSockets
var socket;


findMatch.onclick = function() {
    socket = new WebSocket(getWebSocketUrl("/queue_wait"),"queueProtocol");
    searchMatch.style.display = "block";
};

cancelBtn.onclick = function() {
    searchMatch.style.display = "none";
    socket.send("exit queue");
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

function openNav() {
    document.getElementById("loadoutMenu").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("loadoutMenu").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}

var acc = document.getElementsByClassName("accordion");
var i;

for( i = 0; i<acc.length; i++) {
    acc[i].onclick = function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight){
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        } 
    }
}