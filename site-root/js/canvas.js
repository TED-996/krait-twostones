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