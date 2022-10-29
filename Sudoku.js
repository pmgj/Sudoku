import Cell from "./Cell.js";
import EndOfGame from "./EndOfGame.js";

export default class Sudoku {
    constructor() {
        this.rows = 9;
        this.cols = 9;
        this.board = this.createBoard();
        this.initialState = this.createBoard();    
    }
    createBoard() {
        //        return [[9, 4, 7, 1, 6, 2, 3, 5, 8], [6, 1, 3, 8, 5, 7, 9, 2, 4], [8, 5, 2, 4, 9, 3, 1, 7, 6], [1, 2, 9, 3, 8, 4, 5, 6, 7], [5, 7, 8, 9, 2, 6, 4, 3, 1], [3, 6, 4, 7, 1, 5, 2, 8, 9], [2, 9, 1, 6, 3, 8, 7, 4, 5], [7, 8, 5, 2, 4, 1, 6, 9, 3], [4, 3, 6, 5, 7, 9, 8, 1, 2]];
        //        return [[9, 4, 0, 1, 0, 2, 0, 5, 8], [6, 0, 0, 0, 5, 0, 0, 0, 4], [0, 0, 2, 4, 0, 3, 1, 0, 0], [0, 2, 0, 0, 0, 0, 0, 6, 0], [5, 0, 8, 0, 2, 0, 4, 0, 1], [0, 6, 0, 0, 0, 0, 0, 8, 0], [0, 0, 1, 6, 0, 8, 7, 0, 0], [7, 0, 0, 0, 4, 0, 0, 0, 3], [4, 3, 0, 5, 0, 9, 0, 1, 2]];
        return [[1, 0, 2, 0, 0, 0, 0, 0, 0], [0, 5, 0, 7, 0, 0, 0, 9, 0], [0, 6, 0, 0, 0, 8, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 5], [2, 0, 0, 0, 4, 0, 0, 0, 0], [0, 0, 3, 0, 0, 0, 0, 0, 6], [0, 0, 0, 0, 0, 0, 0, 2, 0], [7, 0, 0, 9, 0, 0, 0, 0, 0], [0, 0, 8, 0, 1, 0, 3, 0, 0]];
    }
    getBoard() {
        return this.board;
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