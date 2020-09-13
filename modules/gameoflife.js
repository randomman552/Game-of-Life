
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
     * @param cell2
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
     * Array of the living cells in the game.
     * @type Array
     */
    liveCells;

    /**
     * Array of the living cells for the next iteration of the game.
     * @type Array
     */
    nextLiveCells;

    /**
     * Set of checked cells (stored as strings to prevent duplicates).
     * @type Set
     */
    checkedCells;

    constructor() {
        this.liveCells = [];
        this.nextLiveCells = [];
        this.checkedCells = new Set();
    }

    /**
     * Iterate the progress of the game by 1 iteration.
     */
    iterateCells() {
        //Check the neighbors of each live cell
        for (const liveCell of this.liveCells) {
            for (const checking of liveCell.neighbors) {
                //Check the cell if it hasn't already been checked
                if(!this.checkedCells.has(checking.toString()) && checking.check(this.liveCells)) {
                    this.nextLiveCells.push(checking);
                    this.checkedCells.add(checking.toString());
                }
            }
        }
    }

    /**
     * Move on to the next iteration and update the live cells.
     */
    updateCells() {
        this.liveCells = this.nextLiveCells;
        this.nextLiveCells = [];
        this.checkedCells.clear();
    }
}

//#endregion
