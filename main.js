import { Cell, GameOfLife } from "./modules/gameoflife.js"

let game = new GameOfLife();

game.cells.live = [
    new Cell(-1, 0),
    new Cell(0, 0),
    new Cell(1, 0),
    new Cell(0, 1),
    new Cell(0, -1)
]


game.start();
game.setLoopTime(250);

//Add resize listener to redraw current frame when resizing the canvas.
window.addEventListener("resize", () => {
    game.drawFrame()
});
