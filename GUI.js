import Sudoku from "./Sudoku.js";
import Cell from "./Cell.js";
import EndOfGame from "./EndOfGame.js";

class GUI {
    constructor() {
        this.game = null;
    }
    startGame() {
        let form = document.forms[0];
        let level = parseInt(form.level.value);
        this.game = new Sudoku(level);
        this.createBoard(this.game.getBoard());
    }
    reset() {
        this.game.reset();
        this.createBoard(this.game.getInitialState());
    }
    createBoard(board) {
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        for (let i = 0; i < board.length; i++) {
            let tr = document.createElement("tr");
            tbody.appendChild(tr);
            for (let j = 0; j < board[i].length; j++) {
                let td = document.createElement("td");
                tr.appendChild(td);
                if (board[i][j] !== 0) {
                    td.textContent = board[i][j];
                    td.className = "blocked";
                } else {
                    td.contentEditable = "true";
                    td.textContent = "";
                }
                td.onfocus = this.showData.bind(this);
                td.oninput = this.updateValue.bind(this);
            }
        }
    }
    coordinates(cell) {
        return new Cell(cell.parentNode.rowIndex, cell.cellIndex);
    }
    updateValue(evt) {
        let td = evt.currentTarget;
        let coords = this.coordinates(td);
        let v = parseInt(td.textContent);
        this.play(coords, v, td);
    }
    play(coords, v, td) {
        this.setMessage("");
        v = isNaN(v) ? 0 : v;
        let end;
        try {
            end = this.game.play(coords, v);
            td.textContent = v === 0 ? "" : v;
        } catch (ex) {
            this.setMessage(ex.message);
        }
        if (end === EndOfGame.WIN) {
            this.setMessage("You win.");
        }
    }
    setMessage(message) {
        let msg = document.getElementById("message");
        msg.textContent = message;
    }
    showData(evt) {
        let td = evt.currentTarget;
        this.setMessage(this.game.getPossibilities(this.coordinates(td)));
    }
    hint() {
        let cells = document.querySelectorAll("td[contenteditable='true']");
        for (let td of cells) {
            let coords = this.coordinates(td);
            let poss = this.game.getPossibilities(coords);
            if (td.textContent === "" && poss.length === 1) {
                this.play(coords, poss[0], td);
                return;
            }
        }
        this.setMessage("No other hint is available.");
    }
    solve() {
        let table = document.querySelector("table");
        let board = this.game.solve();
        if(!board) {
            this.setMessage("No possible solution is available.");
            return;
        }
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                let td = table.rows[i].cells[j];
                td.textContent = board[i][j];
            }
        }
    }
    registerEvents() {
        this.startGame();
        let form = document.forms[0];
        let h = form.hint;
        h.onclick = this.hint.bind(this);
        let all = form.solve;
        all.onclick = this.solve.bind(this);
        let reset = form.reset;
        reset.onclick = this.reset.bind(this);
        let level = form.level;
        level.onchange = this.startGame.bind(this);
    }
}
let gui = new GUI();
gui.registerEvents();

//let s = new Sudoku();
//console.table(s.minimax());
//console.log(s.getPossibilities(new Cell(0, 6)));