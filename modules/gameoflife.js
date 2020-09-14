//#region Game Code

/**
 * Cell class.
 */
export class Cell{
    x;
    y;

    /**
     * Fill style for all cells.
     * @type {string}
     */
    static fillStyle = "white";

    /**
     * Size of each cell in pixels (used for cell drawing).
     * @type {number}
     */
    static cellSize = 50;

    /**
     * @param x The X coordinate of this cell
     * @param y The y coordinate of this cell
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }


    /**
     * Convert this cell to a string.
     * @returns {string}
     */
    toString() {
        return `(${this.x}, ${this.y})`;
    }


    /**
     * Check if this cell is equal to the given cell.
     * @param cell2 {Cell}
     * @returns {boolean}
     */
    isEqual(cell2) {
        return this.x === cell2.x && this.y === cell2.y;
    }


    /**
     * Check this cell to see if it will make it to the next iteration.
     *
     * The rules:
     *  Live cell with less than 2 neighbors dies,
     *  Live cell with 2 or 3 live neighbors lives on,
     *  Live cell with more than 3 neighbors dies,
     *  Dead cell with 3 neighbors becomes alive,
     *
     * @param liveCells {Cell[]}
     * @returns {boolean} True if cell is alive next round.
     */
    check(liveCells) {
        //Check how many live neighbors we have.
        let liveNeighbors = 0;
        for (const neighbor of this.neighbors) {
            //As we can't directly compared lists
            for (const liveCell of liveCells) {
                if (neighbor.isEqual(liveCell)) {
                    liveNeighbors++;
                }
            }
        }


        const alive = this.isAlive(liveCells);
        return alive && liveNeighbors >= 2 && liveNeighbors <= 3 || !alive && liveNeighbors === 3;
    }


    /**
     * Check if this cell is alive.
     * @param liveCells {Cell[]} The list of living cells
     * @returns {boolean} True if cell is alive.
     */
    isAlive(liveCells) {
        for (const liveCell of liveCells) {
            if (this.isEqual(liveCell)) {
                return true;
            }
        }
        return false;
    }


    /**
     * Get the neighbors of this cell.
     * In this diagram, cell X has all of the other cells as neighbors.
     *  [ ][ ][ ]
     *  [ ][x][ ]
     *  [ ][ ][ ]
     * @returns {[]}
     */
    get neighbors() {
        let results = []

        /**
         * Array of transformations to apply to this cell to get it's neighbors.
         */
        let transforms =  [
            //X transforms
            [-1, 0], [1, 0],
            //Y transforms
            [0, -1], [0, 1],
            //Diagonal transforms
            [1, 1], [-1, 1], [-1, -1], [1, -1]]

        for (const t of transforms) {
            results.push(new Cell(this.x + t[0], this.y + t[1]))
        }

        return results;
    }
}

/**
 * Class representing the game
 * Requires a canvas with the id 'canvas' as part of the DOM, this is where all cells will be drawn.
 */
export class GameOfLife {
    /**
     * Stores information on all cells in the game.
     * @type {{next: Cell[], checked: Set, live: Cell[]}}
     * @property {Cell[]} live Array containing all live cells.
     * @property {Cell[]} next Array containing the live cells for the next generation.
     * @property {Set} checked Set containing all checked cells for this generation (as strings).
     */
    cells = {
        live: [],
        next: [],
        checked: new Set()
    }


    /**
     * Stores game loop interval information.
     * @type {{id: number, time: number}}
     * @property {number} id The ID of the currently active interval.
     * If no interval is active then it will be 0.
     * @property {number} time The time between loop executions (in ms).
     */
    interval = {
        id: 0,
        time: 1000
    };


    /**
     * Stores information about the camera and it's movement.
     * @type {{pos: {x: number, y: number}, moveMode: boolean, zoom: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement}}
     * @property {boolean} moveMode Whether the user is currently in moving mode (changes onClick behavior).
     * @property {number} zoom The zoom multiplier currently in use.
     * @property {{x: number, y: number}} pos The current position of the camera.
     * @property {CanvasRenderingContext2D} ctx The canvas rendering context.
     * @property {HTMLCanvasElement} canvas The canvas in use by the game.
     */
    camera = {
        moveMode: false,
        pos: {
          x: 0,
          y: 0
        },
        zoom: 1,
        canvas: null,
        ctx: null
    };


    /**
     * @param canvas {HTMLCanvasElement}
     */
    constructor(canvas) {
        this.camera.ctx = canvas.getContext("2d")
        this.camera.canvas = canvas;

        window.addEventListener("resize", () => {
            canvas.width = document.documentElement.clientWidth;
            canvas.height = document.documentElement.clientHeight;
        });
        window.dispatchEvent(new Event("resize"));
    }


    /**
     * Iterate the progress of the game by 1 iteration.
     */
    iterateCells() {
        //Check the neighbors of each live cell
        for (const liveCell of this.cells.live) {
            for (const checking of liveCell.neighbors) {
                //Check the cell if it hasn't already been checked
                if(!this.cells.checked.has(checking.toString()) && checking.check(this.cells.live)) {
                    this.cells.next.push(checking);
                    this.cells.checked.add(checking.toString());
                }
            }
        }
    }


    /**
     * Move on to the next iteration and update the live cells.
     */
    updateCells() {
        this.cells.live = this.cells.next;
        this.cells.next = [];
        this.cells.checked.clear();
    }


    /**
     * Draw a frame on the canvas.
     */
    drawFrame() {
        let ctx = this.camera.ctx;

        //Clear the screen
        ctx.beginPath();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        //Calculate draw offset
        const drawOffset = this.drawOffset;


        for (const cell of this.cells.live) {
            ctx.rect(
                (cell.x * Cell.cellSize) + drawOffset[0],
                (cell.y * Cell.cellSize) + drawOffset[1],
                Cell.cellSize - 2,
                Cell.cellSize - 2);

            //Set fill and stroke styles according to the values in the Cell class.
            ctx.fillStyle = Cell.fillStyle;

            //Fill and stroke the cell
            ctx.fill();
        }
        ctx.closePath();
    }


    /**
     * Advance the game, and draw the frame of the next generation.
     */
    advance() {
        this.iterateCells();
        this.updateCells();
        this.drawFrame();
    }


    /**
     * This method starts the main game loop as an interval in the background.
     */
    start() {
        if (!this.interval.id) {
            this.interval.id = setInterval(() => {
                this.advance();
            }, this.interval.time);

            //Draw the first frame NOW as the second will not be drawn until the next interval is called.
            this.drawFrame();
        }
    }


    /**
     * This method stops the main game loop interval.
     */
    stop() {
        if (this.interval.id) {
            clearInterval(this.interval.id)
            this.interval.id = 0;
        }
    }


    /**
     * Set the new game loop interval time.
     * @param val {number} The new interval time value
     */
    setLoopTime(val) {
        this.interval.time = val;

        if (this.interval.id) {
            this.stop();
            this.start();
        }
    }


    /**
     * Toggle movement mode
     */
    toggleMoveMode() {
        this.camera.moveMode = !this.camera.moveMode;
    }


    /**
     * Game click action
     * @param e {MouseEvent}
     */
    clickAction(e) {
        //Calculate draw offset
        const offset = this.drawOffset;

        if (this.camera.moveMode) {
            //Camera moving code

            //Store mouse down position
            let start = {
                x: e.x,
                y: e.y
            }


            //Store old camera position
            let oldPos = {
                x: this.camera.pos.x,
                y: this.camera.pos.y
            }


            /**
             * Function to be called on pointer move.
             */
            const onMove = (e) => {
                //Update camera position
                this.camera.pos.x = oldPos.x + (e.x - start.x);
                this.camera.pos.y = oldPos.y + (e.y - start.y);

                //Move canvas background with dragging
                this.camera.canvas.style.backgroundPosition = `calc(50% + ${this.camera.pos.x}px) calc(50% + ${this.camera.pos.y}px)`;
                this.drawFrame();
            }


            /**
             * Function to be called once drag has stopped.
             */
            const onUp = () => {
                //Remove the event handlers added earlier
                this.camera.canvas.removeEventListener("pointermove", onMove);
                this.camera.canvas.removeEventListener("pointerup", onUp);
                this.camera.canvas.removeEventListener("pointerout", onUp);
            }


            //Add the required event handlers
            this.camera.canvas.addEventListener("pointermove", onMove);
            this.camera.canvas.addEventListener("pointerup", onUp);
            this.camera.canvas.addEventListener("pointerout", onUp);

        } else {
            //Activate the required cell

            //Get the clicked x and x position for the cell.
            let cellX = Math.floor((e.x - offset[0]) / Cell.cellSize);
            let cellY = Math.floor((e.y - offset[1]) / Cell.cellSize);

            //Create the current cell as an object and get it's string representation.
            const curCell = new Cell(cellX, cellY);

            //If the cell is already alive, remove it from the live array and return.
            //We also draw the next frame so that the cell state changes on screen.
            for (let i = 0; i < this.cells.live.length; i++) {
                const liveCell = this.cells.live[i];
                if (curCell.isEqual(liveCell)) {
                    this.cells.live.splice(i, 1);
                    this.drawFrame();
                    return;
                }
            }

            //If the cell is not already alive, add it to the live cells array.
            this.cells.live.push(curCell);
            this.drawFrame();
        }
    }


    /**
     * Draw offset used when drawing elements on the canvas.
     * @returns {number[]}
     */
    get drawOffset() {
        return [
            (this.camera.ctx.canvas.width / 2) - (Cell.cellSize / 2) + (this.camera.pos.x) + 1,
            (this.camera.ctx.canvas.height / 2) - (Cell.cellSize / 2) + (this.camera.pos.y) + 1
        ];
    }
}

//#endregion
