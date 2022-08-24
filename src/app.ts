const CHANCE_OF_LIFE: number = 0.05;
const ALIVE: number = 1;
const DEAD: number = 0;
let delay = 0;

class Board {
    board: Array<Uint8Array>;
    width: number;
    height: number;

    constructor(width: number, height: number) {
        let rows = new Array<Uint8Array>(height);
        for (let row = 0; row < height; row++) {
            rows[row] = new Uint8Array(width);
        }
        this.board = rows;
        this.width = width;
        this.height = height;

        this.randomize();
    }

    randomize() {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                const value = Math.random() < CHANCE_OF_LIFE ? ALIVE : DEAD;
                this.set(row, col, value);
            }
        }
    }

    set(row: number, col: number, value: number) {
        this.board[row][col] = value;
    }

    get(row: number, col: number): number {
        return this.board[row][col];
    }

    fieldSum(row: number, col: number): number {
        let sum = 0;
        for (
            let y = Math.max(0, row - 1);
            y <= Math.min(this.height - 1, row + 1);
            y++
        ) {
            for (
                let x = Math.max(0, col - 1);
                x <= Math.min(this.width - 1, col + 1);
                x++
            ) {
                sum += this.get(y, x);
            }
        }
        return sum;
    }
}

let board: Board = new Board(800, 600);
let buffer: Board = new Board(800, 600);

function step() {
    // https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Algorithms
    // "If the sum of all nine fields in a given neighbourhood is three,
    // the inner field state for the next generation will be life;
    // if the all-field sum is four, the inner field retains its current state;
    // and every other sum sets the inner field to death.
    let next = buffer;
    for (let row = 0; row < board.height; row++) {
        for (let col = 0; col < board.width; col++) {
            const n = board.fieldSum(row, col);
            switch (n) {
                case 3: {
                    next.set(row, col, ALIVE);
                    break;
                }
                case 4: {
                    next.set(row, col, board.get(row, col));
                    break;
                }
                default: {
                    next.set(row, col, DEAD);
                    break;
                }
            }
        }
    }
    let tmp = board;
    board = next;
    next = tmp;
}

function render() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    ctx.imageSmoothingEnabled = false;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const stride = imageData.width * 4;
    for (let row = 0; row < canvas.height; row++) {
        for (let col = 0; col < canvas.width; col++) {
            // Mark alive pixels as non transparent.
            // The alive cells have board.board[row][col] == 1, so
            // here we set the alpha channel to either 0 or 255.
            const offset = stride * row + col * 4 + 3;
            imageData.data[offset] = 255 * board.get(row, col);
        }
    }
    ctx.putImageData(imageData, 0, 0);
}

let running = false;

function loop() {
    if (!running) {
        return;
    }
    step();
    render();
    setTimeout(loop, delay);
}

function toggle() {
    if (!running) {
        running = true;
        setTimeout(loop, delay);
    } else {
        running = false;
    }
}

function reset() {
    board.randomize();
    render();
    if (!running) {
        toggle();
    }
}

document.body.addEventListener('keypress', (ev) => {
    switch (ev.key) {
        case ' ': {
            toggle();
            break;
        }
        case 'r':
        case 'R': {
            reset();
        }
    }
});

// Ensure we draw the initial board.
render();

// Ensure the first time we focus the window, we start a round;
// we don't start before people are looking, that would waste battery!
function startOnFocus() {
    window.removeEventListener('focus', startOnFocus);
    toggle();
}

window.addEventListener('focus', startOnFocus);
