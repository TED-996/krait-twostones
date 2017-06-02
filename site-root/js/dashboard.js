function makeActiveLoadout(button_id){
    var activeLoadout = document.getElementById(button_id);
    var allLoadouts = document.getElementsByClassName("active btn btn-default");
    var loadoutLen = allLoadouts.length;
    var display = document.getElementById("displayActiveLoadout");

    for(var i=0; i<loadoutLen; i++) {
        if(allLoadouts[i].id != button_id){
            allLoadouts[i].style.backgroundColor="#4CAF50";
            allLoadouts[i].firstChild.data = "Make active";
        }
    }
    var text = "Active loadout: ";
    var stringToCompare;
    if(activeLoadout.outerHTML){
        stringToCompare = activeLoadout.id;
    }
    if(activeLoadout.firstChild.data == "Make active"){
        activeLoadout.style.backgroundColor="#f44336";
        activeLoadout.firstChild.data = "Is active";
        if(display.firstChild.data != text.concat(stringToCompare)){
            display.firstChild.data = text.concat(stringToCompare);
        }
    } else { 
        alert("There must be an active loadout");
    }
}