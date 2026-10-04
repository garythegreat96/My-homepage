let x;
let y;
let xx;
let yy;
const qq = 50;
let i = 1;
let mouse;
//let fail = null;
let curElem = null;
const MOUSE_WIDTH = 40;
let obstacle;
let bigBlackHawk;
let square;
let dx = 10;
let dy = 5;
function main() {
    addBackground();
    bigBlackHawk = initObstacle();
    setTimer(move, 4);
    mouse = initmice();
    i = addMice();
    setTimer(addMice, 1000);
    square = initSquare();
    mouseDownMethod(collect);
    keyDownMethod(moveSquare);
    
}
function initSquare() {
    xx = getWidth() / 2;
    yy = getHeight() / 2;
    let square = new Rectangle(50, 50);
    square.setColor("green");
    square.setPosition(xx, yy);
    add(square);
    return square;
}
function fail(Left, Top, PoosX, PoossY) {
    if (((Left) == (PoosX + 50)) || (Top == (PoossY + 50)) || ((Left + 50) == PoosX) || ((Top + 50) == PoossY)) {
        return false;
    }
}
function moveSquare(e) {
    let XX = square.getX();
    let YY = square.getY();
    if (e.key == "ArrowLeft" || e.key == "a") {
        if (XX + 50 != getWidth() && YY + 50 != 0 || XX != 0 && YY != getHeight()) {
            square.setPosition(XX - 50, YY);
        }
    }
    if (e.key == "ArrowDown" || e.key == "s") {
        if (XX + 50 != getWidth() && YY + 50 != 0 || XX != 0 && YY != getHeight()) {
            square.setPosition(XX, YY + 50);
        }
    }
    if (e.key == "ArrowRight" || e.key == "d") {
        if (XX + 50 != getWidth() && YY + 50 != 0 || XX != 0 && YY != getHeight()) {
            square.setPosition(XX + 50, YY);
        }
    }
    if (e.key == "ArrowUp" || e.key == "w") {
        if (XX + 50 != getWidth() && YY + 50 != 0 || XX != 0 && YY != getHeight()) {
            square.setPosition(XX, YY - 50);
        }
    }
}
function graphicType() {
    let type = mouse.getType();
    return type;
}
function initmice() {
    x = Randomizer.nextInt(0, getWidth());
    y = Randomizer.nextInt(0, getHeight());
    let mouse = new Circle(20);
    mouse.setPosition(x, y);
    mouse.setColor("Yellow");
    add(mouse);
    return mouse;
}
function addMice() {
    initmice(x, y);
    i = i + 1;
    return i;
}
function addBackground() {
    let thingy = new Rectangle(getWidth(), getHeight());
    thingy.setColor("Lightgreen");
    thingy.setPosition(0, 0);
    add(thingy);
}
function initObstacle() {
    obstacle = new Rectangle(50,50);
    obstacle.setPosition(getWidth() / 2 + 100, getHeight() / 2 + 100);
    obstacle.setColor("Red");
    add(obstacle);
    return obstacle;
}
function checkCollision() {
    if (bigBlackHawk.getX() == 0 || bigBlackHawk.getX() + 50 == getWidth()) {
        dx = -dx;
    }
    if (bigBlackHawk.getY() == 0 || bigBlackHawk.getY() + 50 == getHeight()) {
        dy = -dy;
    }
    
}
function collect(e){
    curElem = getElementAt(e.getX(),e.getY());
    let type = curElem.getType();
    if(type == "Circle"){
        remove(curElem);
        return true;
    }
}
function move() {
    checkCollision();
    bigBlackHawk.move(dx, dy);
    let Left = square.getX();
    let Top = square.getY();
    let left = bigBlackHawk.getX();
    let top = bigBlackHawk.getY();
    let fr = fail(Left, Top, left, top);
    if (Left < left + 50 && Left + 50 > left && Top < top + 50 && Top + 50 > top) {
        stopTimer(move);
        stopTimer(addMice);
        let txt = new Text("GAME OVER", "30pt Arial");
        txt.setPosition(100, 200);
        txt.setColor("red");
        add(txt);
    }
}
main();