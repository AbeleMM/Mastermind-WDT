function quit() {
    location.href = "/";
}

function isFullscreen() {
    return (document.fullScreenElement && document.fullScreenElement !== null) ||
        (document.mozFullScreen || document.webkitIsFullScreen);
}

function enterFullscreen() {
    var page = document.documentElement;
    if (page.requestFullscreen) page.requestFullscreen();
    else if (page.mozRequestFullScreen) page.mozRequestFullScreen();
    else if (page.webkitRequestFullScreen) page.webkitRequestFullScreen();
}

function exitFullscreen() {
    if (document.exitFullScreen) return document.exitFullScreen();
    else if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
}

function toggleFullscreen() {
    if (!isFullscreen())
        enterFullscreen();
    else
        exitFullscreen();
}

function disableInput() {
    document.getElementById("guess").disabled = true;

    var elements = document.querySelectorAll(".circle");
    Array.from(elements).forEach(function (e) {
        var cloned = e.cloneNode(true);
        e.parentNode.replaceChild(cloned, e);
    });

    var elements = document.querySelectorAll(".big-circle");
    Array.from(elements).forEach(function (e) {
        var cloned = e.cloneNode(true);
        e.parentNode.replaceChild(cloned, e);
    });
}

validInput = function(str) { // checks player A's input for validity
    for (let i = 0; i < str.length; i++)
        if (Setup.COLOR_NAMES[str[i]] == undefined)
            return false;
    return true;
};

// basic constructor of game state
function GameState(socket) {

    this.playerType = null; // A - maker, B - breaker
    this.guesses = 1;
    this.targetCode = null;

    this.revealTargetCode = function() {
        for (let i = 1; i <= 4; i++) {
            document.getElementById("code-" + i).style.backgroundColor = Setup.COLOR_NAMES[this.targetCode[i - 1]];
            document.getElementById("code-" + i).textContent = "";
        }
    };

    this.getPlayerType = function () {
        return this.playerType;
    };

    this.getGuesses = function () {
        return this.guesses;
    };

    this.setPlayerType = function(p) {
        console.assert(typeof p == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof p);
        this.playerType = p;
    };

    this.setTargetCode = function(w) {
        console.assert(typeof w == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof w);
        this.targetCode = w;
    };

    this.incrGuesses = function() {
        this.guesses++;
    };

    this.whoWon = function(blackPegs) {
        //too many wrong guesses? Player A (who set the code) won
        if (this.guesses > Setup.MAX_ALLOWED_GUESSES) {
            return "A";
        }
        //code solved? Player B won
        if (blackPegs == Setup.NR_COLORS) {
            return "B";
        }
        return null; //nobody won yet
    };

    this.revealPegs = function(blackPegs, whitePegs) { // black pegs - 🙂, white pegs - 😐

        let pegSpan = document.getElementById("p" + (this.guesses - 1));
        pegSpan.textContent = "";
        for (let i = 1; i <= blackPegs; i++)
                pegSpan.textContent += "🙂";
        for (let i = 1; i <= whitePegs; i++)
                pegSpan.textContent += "😐";
    };

    this.submitGuess = function(combination) {
        for (let i = 1; i <= Setup.NR_COLORS; i++)
            document.getElementById("c" + (this.guesses) + "-" + i).style.backgroundColor = Setup.COLOR_NAMES[combination[i - 1]];
    };

    this.updateGame = function(combination) {

        console.assert(typeof combination == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof clickedColor);

        this.submitGuess(combination);

        var blackPegs = 0;
        var whitePegs = 0;

        let combinationArray = combination.split("");
        for (let i = 0; i < 4; i++) {
            let index = combinationArray.indexOf(this.targetCode[i]);
            if (index != -1) {
                if (index == i)
                    blackPegs++;
                else
                    whitePegs++;
                combinationArray[index] = "-";
            }
        }

        console.log(blackPegs);
        console.log(whitePegs);

        this.incrGuesses();
        this.revealPegs(blackPegs, whitePegs);

        if (this.playerType == "B") {
            var outgoingMsg = Messages.O_MAKE_A_GUESS;
            outgoingMsg.data = combination;
            socket.send(JSON.stringify(outgoingMsg));
        }

        //is the game complete?
        let winner = this.whoWon(blackPegs);

        document.getElementById("g" + (this.guesses - 1)).style.backgroundColor = "white";
        if (this.guesses <= Setup.MAX_ALLOWED_GUESSES && winner == null)
            document.getElementById("g" + this.guesses).style.backgroundColor = "gray";

        if (winner != null) {
            this.revealTargetCode();
            disableInput();

            let resultString;
            if (winner == this.playerType) {
                resultString = Status["gameWon"];
            }
            else {
                resultString = Status["gameLost"];
            }
            document.getElementById("player-type").style.fontSize = "2em";
            document.getElementById("player-type").textContent = resultString;
                
            var node = document.createElement("a");
            var textnode = document.createTextNode(Status["playAgain"]);
            node.setAttribute("href", "/play");
            node.appendChild(textnode);
             document.getElementById("info").appendChild(node);

             //player B sends final message
            if (this.playerType == "B") {
                let finalMsg = Messages.O_GAME_WON_BY;
                finalMsg.data = winner;
                socket.send(JSON.stringify(finalMsg));
            }
            socket.close();
        }
    };
}

function Selection(gs) {
    this.combination = "";

    this.initialize = function() {
        // attach listeners for addColor
        var elements = document.getElementsByClassName("circle");
        Array.from(elements).forEach( (el) => {
            el.style.cursor = "crosshair";
            el.addEventListener("click", (e) => {
                this.addColor(e.target.id);
            });
        });

        var send = document.getElementById("guess");
        send.onclick = () => {
            if (this.combination.length == Setup.NR_COLORS && this.combination.indexOf("w") == -1) {
                new Audio("./data/guessConfirm.wav").play();
                gs.updateGame(this.combination);
                this.combination = "";
            }
        };
        
        // attach listeners for removeColor
        elements = document.getElementsByClassName("big-circle");
        Array.from(elements).forEach( (el) => {
            el.style.cursor = "crosshair";
            el.addEventListener("click", (e) => {
                this.removeColor(e.target.id);
            });
        });
    };

    this.addColor = function(id) {
        var ind = this.combination.indexOf("w");
        if (this.combination.length < Setup.NR_COLORS && ind == -1) {
            this.combination += id;
            document.getElementById("c" + gs.getGuesses() + "-" + this.combination.length).style.backgroundColor = Setup.COLOR_NAMES[id];
        }
        else if (ind != -1) {
            this.combination = this.combination.substr(0, ind) + id + this.combination.substr(ind + 1);
            document.getElementById("c" + gs.getGuesses() + "-" + (ind + 1)).style.backgroundColor = Setup.COLOR_NAMES[id];
        }
    };

    this.removeColor = function(id) {
        var cid = id.replace("c" + gs.getGuesses() + "-", "");
        if (this.combination.length > 0 && this.combination[cid - 1] != undefined) {
            this.combination = this.combination.substr(0, cid - 1) + "w" + this.combination.substr(cid);
            document.getElementById(id).style.backgroundColor = "white";
        }
    }
}

// set everything up, including the WebSocket
(function setup() {
    let socket = new WebSocket(Setup.WEB_SOCKET_URL);

    //initializing all UI elements of the game
    var gs = new GameState(socket);
    var sel = new Selection(gs);
    
    socket.onmessage = function(event) {

        let incomingMsg = JSON.parse(event.data);
 
        //set player type
        if (incomingMsg.type == Messages.T_PLAYER_TYPE) {

            gs.setPlayerType( incomingMsg.data );//should be "A" or "B"

            document.getElementById("g1").style.backgroundColor = "gray";

            //if player type is A, (1) pick a combination, and (2) sent it to the server
            if (gs.getPlayerType() == "A") {
                document.getElementById("player-type").textContent = Status["maker"];

                let validCode = false;
                let promptString = Status["prompt"];
                let res = null;

                while (validCode == false) {
                    res = prompt(promptString);

                    if ( res == null)
                        promptString = status["prompt"];
                    else {
                        res = res.toLowerCase().replace(/\s/g,"");

                        if (res.length != 4)
                            promptString = Status["promptAgainLength"];
                        else if (validInput(res) == false)
                            promptString = Status["promptChars"];
                        else
                            validCode = true;
                    }
                }

                disableInput();
                gs.setTargetCode(res);
                gs.revealTargetCode();

                let outgoingMsg = Messages.O_TARGET_CODE;
                outgoingMsg.data = res;
                socket.send(JSON.stringify(outgoingMsg));
            }
            else { }
        }

        //Player B: wait for target code and then start guessing ...
        if (incomingMsg.type == Messages.T_TARGET_CODE && gs.getPlayerType() == "B") {
            document.getElementById("player-type").textContent = Status["breaker"];

            gs.setTargetCode(incomingMsg.data);
            sel.initialize();
        }

        //Player A: wait for guesses and update the board ...
        if( incomingMsg.type == Messages.T_MAKE_A_GUESS && gs.getPlayerType()=="A") {
            gs.updateGame(incomingMsg.data);
        }
    };
    
    socket.onopen = function() {
        socket.send("{}");
    };
    
    //server sends a close event only if the game was aborted from some side
    socket.onclose = function() {
        if (gs.whoWon()==null) { }
    };

    socket.onerror = function() { };
})();