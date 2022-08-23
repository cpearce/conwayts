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
        if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
            return DEAD;
        }
        return this.board[row][col];
    }

    neighbours(row: number, col: number): number {
        const deltas = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ];
        let count = 0;
        for (let d of deltas) {
            let dx = d[0];
            let dy = d[1];
            count += this.get(row + dy, col + dx);
        }
        return count;
    }
}

let board: Board = new Board(800, 600);
let buffer: Board = new Board(800, 600);

function step() {
    // Rules:
    //
    // Any live cell with two or three neighbours lives.
    // Any dead cell with three live neighbours comes to life.
    // All other cells die/remain dead.

    let next = buffer;
    for (let row = 0; row < board.height; row++) {
        for (let col = 0; col < board.width; col++) {
            const n = board.neighbours(row, col);
            let value = DEAD;
            if (board.get(row, col) == ALIVE) {
                if (n == 2 || n == 3) {
                    // Any live cell with two or three neighbours lives.
                    value = ALIVE;
                }
            } else if (n == 3) {
                // Any dead cell with three live neighbours comes to life.
                value = ALIVE;
            }
            // All other cells die/remain dead.
            next.set(row, col, value);
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
            if (board.get(row, col) == ALIVE) {
                imageData.data[stride * row + col * 4 + 3] = 255;
            } else {
                imageData.data[stride * row + col * 4 + 3] = 0;
            }
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
    running = true;
    board.randomize();
    render();
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
