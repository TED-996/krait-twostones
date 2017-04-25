// Get the modal
var searchMatch = document.getElementById('searchMatch');

//Get the button that serches for a match
var findMatch = document.getElementById("findMatchBtn");

//Get the cancel button to interupt the search
var cancelBtn = document.getElementById("cancel");

findMatch.onclick = function() {
    searchMatch.style.display = "block";
}

cancelBtn.onclick = function() {
    searchMatch.style.display = "none";
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