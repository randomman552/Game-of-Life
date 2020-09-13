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

        //If at least two neighbors are alive, return true.
        return liveNeighbors >= 2;
    }


    /**
     * Get the neighbors of this cell.
     * @returns {[]}
     */
    get neighbors() {
        let results = []

        results.push(new Cell(this.x - 1, this.y));
        results.push(new Cell(this.x + 1, this.y));
        results.push(new Cell(this.x, this.y - 1));
        results.push(new Cell(this.x, this.y + 1));

        return results;
    }
}

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
