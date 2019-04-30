function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenSizeAlert(x) {
    if (x.matches) { // If media query matches
        await sleep(500);
        window.alert("The resolution of at least one axis of your window is below the recommended one. You can still play, but the experience might not be optimal!");
    }
}

x = window.matchMedia("(max-width: 1279px), (max-height: 719px)");
screenSizeAlert(x); // Call listener function at run time
x.addListener(screenSizeAlert); // Attach listener function on state changes