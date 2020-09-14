
//#region Canvas Setup

/**
 * Canvas Element
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");

/**
 * Rendering Context
 * @type {CanvasRenderingContext2D}
 */
const ctx = canvas.getContext("2d");

/**
 * Resize Action
 */
window.addEventListener("resize", () => {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
});
window.dispatchEvent(new Event("resize"));

//#endregion


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


    constructor() {}


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
        //Clear the screen
        ctx.beginPath();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        //Calculate draw offset
        const drawOffset = [
            (ctx.canvas.width / 2) - (50 / 2) + 1,
            (ctx.canvas.height / 2) - (50 / 2) + 1
        ];


        for (const cell of this.cells.live) {
            ctx.rect((cell.x * Cell.cellSize) + drawOffset[0], (cell.y * Cell.cellSize) + drawOffset[1], Cell.cellSize - 2, Cell.cellSize - 2);

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
}

//#endregion
