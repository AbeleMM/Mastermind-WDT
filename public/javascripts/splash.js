function overlayOn(eId) {
    document.getElementById(eId).style.display = "block";
    document.getElementsByTagName("body")[0].style.overflow = "hidden";
}

function overlayOff(eId) {
    document.getElementById(eId).style.display = "none";
    document.getElementsByTagName("body")[0].style.overflow = "auto";
}