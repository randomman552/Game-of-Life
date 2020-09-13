import { Cell, GameOfLife } from "./modules/gameoflife.js"

let game = new GameOfLife();

game.liveCells = [new Cell(0, 0), new Cell(1, 0), new Cell(0, 1), new Cell(1, 1)]
game.iterateCells();
game.updateCells();
console.log(game.liveCells);