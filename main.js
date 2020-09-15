import { Cell, GameOfLife } from "./modules/gameoflife.js"

const canvas = document.getElementById("canvas");
let game = new GameOfLife(canvas);


//Add resize listener to redraw current frame when resizing the canvas.
window.addEventListener("resize", () => {
    game.drawFrame()
});


//#region Play/Pause Action

const pauseButton = document.getElementById("start/stop");

function togglePlay() {
    if (game.interval.id) {
        game.stop();
        pauseButton.innerText = "start"
    } else {
        game.start();
        pauseButton.innerText = "stop"
    }
}

pauseButton.addEventListener("click", togglePlay);

//#endregion


//#region Step action

const stepButton = document.getElementById("step");

stepButton.addEventListener("click", () => {
   game.advance();
});

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

    //Invert update time (as range slider is backwards

    updateTime = maxUpdateTime - updateTime;
    game.setLoopTime(updateTime);
}

timeScaleIn.addEventListener("input", updateTimeScale);
timeScaleIn.dispatchEvent(new Event("input"));

//#endregion


//#region Move/Select Button

const modeSwitchButton = document.getElementById("move/select");

function switchMode() {
    game.toggleMoveMode();

    if (game.camera.moveMode) {
        modeSwitchButton.innerText = "edit mode";
    } else {
        modeSwitchButton.innerText = "move mode";
    }

    canvas.classList.toggle("move");
}

modeSwitchButton.addEventListener("click", switchMode);

//#endregion


//#region Zoom adjustment

const zoomInput = document.getElementById("zoom");

function updateZoom() {
    game.setCameraZoom(Number(zoomInput.value))
    game.drawFrame();
}

zoomInput.addEventListener("input", updateZoom);
zoomInput.dispatchEvent(new Event("input"));

//Mouse wheel zooming event
canvas.addEventListener("wheel", (e) => {
    let scale = game.camera.zoom + e.deltaY * -0.01;
    if (!(scale <= Number(zoomInput.min))) {
        zoomInput.value = scale;
        updateZoom();
    }
});

//#endregion


//#region Canvas click event binding

document.getElementById("canvas").addEventListener("pointerdown", (e) => {
   game.clickAction(e);
});

//#endregion
