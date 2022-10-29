import Sudoku from "./Sudoku.js";
import Cell from "./Cell.js";
import EndOfGame from "./EndOfGame.js";

class GUI {
    constructor() {
        this.game = null;
    }
    createElements() {
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        this.game = new Sudoku();
        let board = this.game.getBoard();
        for (let i = 0; i < board.length; i++) {
            let tr = document.createElement("tr");
            tbody.appendChild(tr);
            for (let j = 0; j < board[i].length; j++) {
                let td = document.createElement("td");
                tr.appendChild(td);
                let input = document.createElement("input");
                td.appendChild(input);
                input.type = "text";
                input.maxlength = "1";
                if (board[i][j] !== 0) {
                    input.value = board[i][j];
                    input.readOnly = true;
                } else {
                    input.value = "";
                    input.readOnly = false;
                }
                input.ondblclick = this.showData.bind(this);
                input.onchange = this.updateValue.bind(this);
            }
        }
    }
    coordinates(cell) {
        return new Cell(cell.parentNode.rowIndex, cell.cellIndex);
    }
    updateValue(evt) {
        let input = evt.currentTarget;
        let coords = this.coordinates(input.parentNode);
        let v = parseInt(input.value);
        this.play(coords, v, input);
    }
    play(coords, v, input) {
        this.setMessage("");
        v = isNaN(v) ? 0 : v;
        let end;
        try {
            end = this.game.play(coords, v);
            input.value = v === 0 ? "" : v;
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
        let input = evt.currentTarget;
        this.setMessage(this.game.getPossibilities(this.coordinates(input.parentNode)));
    }
    hint() {
        let inputs = document.querySelectorAll("input[type='text']:not(:read-only)");
        for (let input of inputs) {
            let coords = this.coordinates(input.parentNode);
            let poss = this.game.getPossibilities(coords);
            if (input.value === "" && poss.length === 1) {
                this.play(coords, poss[0], input);
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
                let input = td.firstChild;
                input.value = board[i][j];
            }
        }
    }
    registerEvents() {
        this.createElements();
        let form = document.forms[0];
        let h = form.hint;
        h.onclick = this.hint.bind(this);
        let all = form.solve;
        all.onclick = this.solve.bind(this);
        let reset = form.reset;
        reset.onclick = this.createElements.bind(this);
        let level = form.level;
        level.onchange = this.createElements.bind(this);
    }
}
let gui = new GUI();
gui.registerEvents();

//let s = new Sudoku();
//console.table(s.minimax());
//console.log(s.getPossibilities(new Cell(0, 6)));