import Cell from "./Cell.js";
import EndOfGame from "./EndOfGame.js";

export default class Sudoku {
    constructor(level = 0) {
        this.rows = 9;
        this.cols = 9;
        this.initialState = null;
        this.board = this.createBoard(level);
    }
    createBoard(level) {
        let emptyCells = [31, 41, 46, 51, 56];
        let temp = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        let shuffle = function (array) {
            let currentIndex = array.length, randomIndex;
            // While there remain elements to shuffle...
            while (currentIndex !== 0) {
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            }
            return array;
        };
        let possibilities = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        temp[0] = possibilities;
        let b = this.solve(temp);
        for (let i = 0; i < emptyCells[level]; i++) {
            let row = Math.floor(Math.random() * this.rows);
            let col = Math.floor(Math.random() * this.cols);
            if (b[row][col] === 0) {
                i--;
            } else {
                b[row][col] = 0;
            }
        }
        this.initialState = b.map(arr => arr.slice());
        return b;
    }
    reset() {
        this.board = this.initialState.map(arr => arr.slice());
    }
    getBoard() {
        return this.board;
    }
    getInitialState() {
        return this.initialState;
    }
    onBoard({ x, y }) {
        let inLimit = (value, limit) => value >= 0 && value < limit;
        return (inLimit(x, this.rows) && inLimit(y, this.cols));
    }
    correctNumber(num) {
        return num >= 0 && num <= this.rows;
    }
    play(cell, n) {
        let { x, y } = cell;
        if (!this.onBoard(cell)) {
            throw new Error(`The coordinates (${x}, ${y}) are not in the board.`);
        }
        if (!this.correctNumber(n)) {
            throw new Error(`The informed number (${n}) is invalid.`);
        }
        if (this.initialState[x][y] !== 0) {
            throw new Error("You can not change this value.");
        }
        this.board[x][y] = n;
        return this.check();
    }
    check(matrix = this.board) {
        for (let i = 0; i < this.rows; i++) {
            let temp = matrix[i].slice().sort().filter(v => v !== 0);
            if (new Set(temp).size !== temp.length) {
                throw new Error(`Row ${i} has duplicate values.`);
            }
        }
        for (let i = 0; i < this.cols; i++) {
            let temp = matrix.map(a => a[i]).slice().sort().filter(v => v !== 0);
            if (new Set(temp).size !== temp.length) {
                throw new Error(`Column ${i} has duplicate values.`);
            }
        }
        let sub = [{ row: 0, col: 0 }, { row: 0, col: 3 }, { row: 0, col: 6 }, { row: 3, col: 0 }, { row: 3, col: 3 }, { row: 3, col: 6 }, { row: 6, col: 0 }, { row: 6, col: 3 }, { row: 6, col: 6 }];
        for (let i = 0; i < sub.length; i++) {
            let temp = [];
            for (let r = sub[i].row; r < sub[i].row + 3; r++) {
                for (let c = sub[i].col; c < sub[i].col + 3; c++) {
                    temp.push(matrix[r][c]);
                }
            }
            temp = temp.sort().filter(v => v !== 0);
            if (new Set(temp).size !== temp.length) {
                throw new Error(`Submatrix (${sub[i].row}, ${sub[i].col}) has duplicate values.`);
            }
        }
        if (matrix.flat().every(v => v !== 0)) {
            return EndOfGame.WIN;
        }
        return EndOfGame.NO;
    }
    getPossibilities(cell, matrix = this.board) {
        let { x, y } = cell;
        if (!this.onBoard(cell)) {
            throw new Error(`The coordinates (${x}, ${y}) are not in the board.`);
        }
        if (matrix[x][y] !== 0) {
            return [matrix[x][y]];
        }
        let possibilities = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        let temp = matrix[x].slice().sort().filter(v => v !== 0);
        possibilities = possibilities.filter(el => !temp.includes(el));
        temp = matrix.map(a => a[y]).slice().sort().filter(v => v !== 0);
        possibilities = possibilities.filter(el => !temp.includes(el));
        temp = [];
        let row = 3 * Math.trunc(x / 3), col = 3 * Math.trunc(y / 3);
        for (let r = row; r < row + 3; r++) {
            for (let c = col; c < col + 3; c++) {
                temp.push(matrix[r][c]);
            }
        }
        temp = temp.sort().filter(v => v !== 0);
        possibilities = possibilities.filter(el => !temp.includes(el));
        return possibilities;
    }
    solve(matrix = this.board) {
        let moves = this.getAvailableMoves(matrix);
        if (moves.length > 0) {
            for (let m of moves) {
                let temp = this.solve(m);
                if (temp !== null) {
                    return temp;
                }
            }
        } else {
            let res = this.check(matrix);
            if (res === EndOfGame.WIN) {
                return matrix;
            }
        }
        return null;
    }
    getAvailableMoves(matrix) {
        let moves = [];
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[0].length; j++) {
                if (matrix[i][j] === 0) {
                    let poss = this.getPossibilities(new Cell(i, j), matrix);
                    if (poss.length > 0) {
                        for (let p of poss) {
                            let clone = matrix.map(arr => arr.slice());
                            clone[i][j] = p;
                            moves.push(clone);
                        }
                    }
                    return moves;
                }
            }
        }
        return moves;
    }
}