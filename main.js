import { GameOfLife } from "./modules/gameoflife.js"
import { examples } from "./modules/examples.js";

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
    if (!(scale < Number(zoomInput.min))) {
        zoomInput.value = scale;
        updateZoom();
    } else {
        zoomInput.value = zoomInput.min;
        updateZoom();
    }
});

//#endregion


//#region Save functionality

const saveButton = document.getElementById("save");

saveButton.addEventListener("click", () => {
    //Get the save data as a JSON encoded string.
    const toSave = JSON.stringify(game.save());

    //Create a blob object to store the data
    const file = new Blob([toSave], {type: "application/json"})

    //Create a temporary anchor tag to download the file
    const tempLink = document.createElement("a");
    tempLink.download = "save.json";
    tempLink.href = window.URL.createObjectURL(file);
    tempLink.click();
});

//#endregion


//#region Load functionality


const loadPopup = document.getElementById("load-popup");

//File load functionality
const fileLoad = document.getElementById("file-load");

//Attach event handler to load the game state when a file is selected by the user
fileLoad.addEventListener("change", () => {
    const fr = new FileReader();
    fr.readAsText(fileLoad.files[0])

    //Once the file reader has read the contents of the file, load them into the game
    fr.onload = function() {
        const toLoad = JSON.parse(fr.result);

        game.load(toLoad);

        loadPopup.parentElement.classList.toggle("open");
    };
});

//Example loading functionality
const exampleLoad = document.getElementById("example-load");

exampleLoad.addEventListener("change", () => {
    if (exampleLoad.value in examples) {
        game.load(examples[exampleLoad.value]);
        loadPopup.parentElement.classList.toggle("open");
    }
});

//Add each of the examples to the example load select
for (const example in examples) {
    const option = document.createElement("option");
    option.value = example;
    option.innerText = example;

    exampleLoad.appendChild(option);
}

//#endregion


//#region Clear functionality

const clearButton = document.getElementById("clear");

clearButton.addEventListener("click", () => {
   game.reset();
});

//#endregion
