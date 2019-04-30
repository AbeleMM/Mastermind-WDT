function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ')
        c = c.substring(1);
      if (c.indexOf(name) == 0)
        return c.substring(name.length, c.length);
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    /*
    cookie expires after the given amount of days
    24 hours in a day
    60 minutes in an hour
    60 seconds in a minute
    1000 milliseconds in a second
    */
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function counterCookie() {
    var counterText = document.getElementById("nrVisits");
    counterText.textContent = "Times you have accessed this page: ";
    
    var visits = getCookie("visitCounter");
    // if the cookie wasn't found, this is the first visit
    if (!visits)
        visits = 1; // the value for the new cookie
    else
        visits = parseInt(visits) + 1; // increment the counter
    counterText.textContent += visits;
    // set the new cookie
    setCookie("visitCounter", visits, 365);
}

counterCookie();