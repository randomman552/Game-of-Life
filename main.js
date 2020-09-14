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

//Add resize listener to redraw current frame when resizing the canvas.
window.addEventListener("resize", () => {
    game.drawFrame()
});

//#region Play/Pause Action

const pauseButton = document.getElementById("pause/play");

function togglePlay() {
    if (game.interval.id) {
        game.stop();
        pauseButton.classList.remove("active");
    } else {
        game.start();
        pauseButton.classList.add("active");
    }
}

pauseButton.addEventListener("click", togglePlay)

//#endregion


//#region Timescale Adjustment

/**
 * Time scale input element
 * @type {HTMLInputElement}
 */
const timeScaleIn = document.getElementById("timescale");

/**
 * The maximum amount of time between game loop executions,
 * is scaled down using the timescale input.
 * @type {number}
 */
const maxUpdateTime = 1000;

function updateTimeScale() {
    let updateTime = maxUpdateTime * (Number(timeScaleIn.value / timeScaleIn.max));
    game.setLoopTime(updateTime);
}

timeScaleIn.addEventListener("input", updateTimeScale);
timeScaleIn.dispatchEvent(new Event("input"));

//#endregion
