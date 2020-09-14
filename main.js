import { Cell, GameOfLife } from "./modules/gameoflife.js"

let game = new GameOfLife();

game.liveCells = [
    new Cell(-1, 0),
    new Cell(0, 0),
    new Cell(1, 0),
    new Cell(0, 1),
    new Cell(0, -1)
]

console.log(game.liveCells);


function updateFrame() {
    game.iterateCells();
    game.updateCells();
    game.drawFrame();
}

setInterval(updateFrame, 1000);
game.drawFrame();