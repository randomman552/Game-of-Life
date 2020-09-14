import { Cell, GameOfLife } from "./modules/gameoflife.js"

const canvas = document.getElementById("canvas");
let game = new GameOfLife(canvas);


//Add resize listener to redraw current frame when resizing the canvas.
window.addEventListener("resize", () => {
    game.drawFrame()
});


//#region Play/Pause Action

const pauseButton = document.getElementById("pause/play");

function togglePlay() {
    if (game.interval.id) {
        game.stop();
    } else {
        game.start();
    }
    pauseButton.classList.toggle("active");
}

pauseButton.addEventListener("click", togglePlay);

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


//#region Move/Select Button

const modeSwitchButton = document.getElementById("move/select");

function switchMode() {
    game.toggleMoveMode()
    modeSwitchButton.classList.toggle("active");
    canvas.classList.toggle("move");
}

modeSwitchButton.addEventListener("click", switchMode);

//#endregion


//#region Click event binding

document.getElementById("canvas").addEventListener("pointerdown", (e) => {
   game.clickAction(e);
});

//#endregion
