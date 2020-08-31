var rows = 9;
var columns = 9;
var numMines = 10
var mines = [];
var firstClick = true;
var revealed = 0;
var time = 0;
var board;
var start;
var minesRemaining = numMines;

//makes empty 2D array representation of board
function makeArrays(){
    board = new Array(length);
    for (var i = 0; i < rows; i++){
        board[i] = new Array(columns).fill(0);
    }
}
makeArrays();

//makes board by creating 2D array of buttons
function makeBoard(){
    document.getElementById("game").addEventListener('contextmenu', function (e) {e.preventDefault();}, false);
    document.getElementById("count").innerHTML = make3(minesRemaining);
    for (var i = 0; i < rows; i++){
        for(var j = 0; j < columns; j++){
            var gameBoard = document.getElementById("board");
            var button = document.createElement("button");
            button.id = "" + i + " "+ j;
            button.className = "cell";
            button.onmousedown = function(e) {play(parseInt(this.id.split(" ")[0]),parseInt(this.id.split(" ")[1]),e);};
            gameBoard.appendChild(button);
        }
        var br = document.createElement("br");
        gameBoard.appendChild(br);
    }
}
makeBoard();

function setDifficulty(d){
    switch(d){
        case 'b':
            rows = 9;
            columns = 9;
            numMines = 10;
            break;
       case 'i':
            rows = 16;
            columns = 16;
            numMines = 40;
            break;
        case 'e':
            rows = 16;
            columns = 30;
            numMines = 99;
            break; 
    }
    restart();
    var gameBoard = document.getElementById("board");
    gameBoard.style.minWidth = 32*columns + "px";
    gameBoard.style.minHeight = 32*rows +"px";
    gameBoard.style.width = 32*columns+"px";
    var top = document.getElementById("top");
    top.style.minWidth = 32*columns + "px";
    top.style.width = 32*columns+"px";

}

//randomnly generates mines around boards that cannot surround the first clicked button
function generateMines(x,y){
    while(mines.length < numMines){
        var mine = Math.floor(Math.random() * (rows * columns));
        if(mines.indexOf(mine) === -1 &&
                mine != ((x-1)*columns+y-1) && mine != ((x-1)*columns+y) && mine != ((x-1)*columns+y+1) &&
                mine != (x*columns+y-1) && mine != (x*columns+y) && mine != (x*columns+y+1) &&
                mine != ((x+1)*columns+y-1) && mine != ((x+1)*columns+y) && mine != ((x+1)*columns+y+1)){
            mines.push(mine);
        }
    }
}

//iterates through the array and sets each element equal to the number of mines surrounding it
function generateNumbers(){
    for(var i = 0; i < rows; i++){
        for(var j = 0; j < columns; j++){
            var count = 0;
            if(board[i][j] != "*"){
                for(var k = i-1; k <= i+1; k++){
                    for(var l = j-1; l <= j+1; l++){
                        if (board[k]!= undefined && board[k][l]!= undefined && board[k][l]=="*"){
                            count++;
                        }
                    }
                }
                board[i][j] = count;
            }
        }     
    }
}

//reveals the number or mine of a certain element in the array
function reveal(x,y){
    var q = document.getElementById(x+" "+y);
    if(board[x][y] != 0){
        q.innerHTML = board[x][y];
    }
    if(board[x][y] == '*'){
        q.style.backgroundImage = "url('Images/mine.jpg')";
        q.style.backgroundSize = "28px 28px";
    }
    var color;
    switch(board[x][y]){
        case 1:
            color = "blue";
            break;
        case 2:
            color = "green";
            break;
        case 3:
            color = "red";
            break;
        case 4:
            color = "purple";
            break;
        case 5:
            color = "maroon";
            break;
        case 6:
            color = "turqoise";
             break;
        case 7: 
            color = "black";
            break;
        case 8:
            color = "gray";
            break;
    }
    q.style.color = color;
    q.disabled = true;
    q.style.backgroundColor = "lightgrey";
    q.style.borderStyle = "solid";
    q.style.borderColor = "darkgrey";
    q.style.borderWidth = "1px";
    revealed++;
}

//recursivelychecks surrounding elements if the chosen element was a 0
function revealOthers(x,y){
    if(board[x][y] == 0){
        for(var i = x-1; i <= x+1; i++){
            for(var j = y-1; j <= y+1; j++){
                if ((i!=x || j!=y) && board[i]!= undefined && board[i][j]!= undefined && !document.getElementById(i +" "+ j).disabled && document.getElementById(i+" "+j).style.backgroundImage == ''){
                    reveal(i,j);
                    revealOthers(i,j);
                }
            }
        }
    }
}

// ends game after a mine was selected, reveals all other mines
function endGame(){
    for(var i = 0; i < rows; i++){
        for(var j = 0; j < columns; j++){
            if(board[i][j] == '*'){
                reveal(i,j);
            }
            document.getElementById(i + " " + j).disabled = true;
        }
    }
    clearInterval(start);
    document.getElementById("restart").style.backgroundImage = "url(Images/lose.jpg)";
    document.getElementById("results").innerHTML = "You Lose!";
}

//flags selected button
function flagCell(x,y){
    minesRemaining--;
    document.getElementById("count").innerHTML = make3(minesRemaining);
    var q = document.getElementById(x+" "+y);
    q.onclick = "disabled";
    q.style.backgroundImage = "url(Images/flag.jpg)";
    q.style.backgroundSize = "32px 32px";
    q.onmousedown = function(e){removeFlag(x,y,e);};
    q.style.backgroundColor = "lightgrey";
    q.style.borderStyle = "solid";
    q.style.borderColor = "darkgrey";
    q.style.borderWidth = "1px";
}

//unflags selected button and replaces it with a new button
function removeFlag(x,y,event){
    if(event.button == 2){
        minesRemaining++;
        document.getElementById("count").innerHTML = make3(minesRemaining);
        var q = document.getElementById(x+" "+y);
        var button = document.createElement("button");
        button.id = "" + x + y;
        button.className = "cell";
        button.onmousedown = function(e){play(x,y,e);}
        q.parentNode.replaceChild(button,q);
    }
}

//initializes game when first clicked
function startGame(x,y){
    generateMines(x,y);
    for(m of mines){
        var i = Math.floor(m/columns);
        var j = m%columns;
        board[i][j]='*';
    }
    generateNumbers();
}

//checks each time a button is pressed
function play(x,y,event){
    if(event.button == 2){
        flagCell(x,y);
    }
    else if(firstClick){
        startGame(x,y);
        reveal(x,y);
        if (board[x][y] == 0){
            revealOthers(x,y);
        }
        firstClick = false;
        start = setInterval(startTime,1000);

    }
    else if(board[x][y] == '*'){
        endGame();
        document.getElementById(x+" "+y).style.backgroundColor = "red";
    }
    else{
        reveal(x,y);
        if (board[x][y] == 0){
            revealOthers(x,y);
        }
    }
    checkWin();
}

//checks if all the non-mines have been selected, flags all mines, ends game
function checkWin(){
    if(revealed == rows*columns-numMines){    
        document.getElementById("restart").style.backgroundImage = "url(Images/win.jpg)";
        document.getElementById("results").innerHTML = "You win!";
        for(var i = 0; i < rows; i++){
            for(var j = 0; j < columns; j++){
                if(board[i][j] == '*'){
                    flagCell(i,j);
                }
                document.getElementById(i +" "+ j).disabled = true;
            }
        }
        clearInterval(start);
        document.getElementById("count").innerHTML = make3(0);
    }
}

//restarts the game when button is pressed, reinitializes all values
function restart(){
    document.getElementById("restart").style.backgroundImage = "url(Images/smiley.jpg)";
    firstClick = true;
    revealed = 0;
    makeArrays();
    var b = document.getElementById("board");
    var newB = document.createElement("div");
    b.parentNode.replaceChild(newB,b);
    newB.id = "board";
    makeBoard();
    mines = [];
    time = 0;
    clearInterval(start);
    minesRemaining = numMines;
    document.getElementById("count").innerHTML = make3(minesRemaining);
    document.getElementById("time").innerHTML = make3(0);
    document.getElementById("results").innerHTML = "";
}

//function used for keeping time
function startTime(){
    time++;
    document.getElementById("time").innerHTML = make3(time);
}

//appends additional 0s to a number so it becomes 3 digits
function make3(x){
    if(x>999){
        return 999;
    }
    else if(x>99){
        return x;
    }
    else if(x>9){
        return "0" + x;
    }
    else if(x>=0){
        return "00" + x;
    }
    else if(x>-10){
        return "-0"+Math.abs(x);
    }
    else {
        return x;
    }
}