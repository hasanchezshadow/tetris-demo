import { BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, EVENT_MOVEMENTS, PIECES } from './consts';
import { Piece } from './piece.model';
import './style.css';

// 1. Canvas init
const canvas = document.querySelector<HTMLCanvasElement>('canvas')!;
const context = canvas.getContext('2d')!;
const $score = document.querySelector('span');
const $section = document.querySelector('section');

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

let score = 0;

// 3. Board // todo generate the board dinamically
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

function createBoard(width: number, height: number) {
  return Array(height).fill(0).map(() => Array(width).fill(0));
}

// 4. Pieces
let piece: Piece = buildPiece();
function buildPiece(): Piece {
  // get random shape
  const peacePossition = Math.floor(Math.random() * PIECES.length);
  const x = Math.floor(Math.random() * (BOARD_WIDTH - PIECES[peacePossition][0].length));
  return {
    position: { x, y: 0 },
    shape: PIECES[peacePossition]
  }
}

// 10. Ramdom Pieces


// 2. Game loop
// function update(): void {
//   draw();
//   window.requestAnimationFrame(update)
// }

// 9. Auto drop
let dropCounter: number = 0;
let lastTime: number = 0;
function update(time: number = 0) {
  const deltaTime: number = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;

  if (dropCounter > 1000) {
    piece.position.y++;
    dropCounter = 0;


    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }


  draw();
  window.requestAnimationFrame(update);
}

function draw(): void {
  // Filling canvas
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Drawing board
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = 'yellow';
        context.fillRect(x, y, 1, 1);
      }
    })
  });

  // Drawing piece
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = 'red';
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    })
  });

  if ($score) {
    $score.innerText = `${score}`;
  }
}

// 5. Moving the piece
document.addEventListener('keydown', (event) => {
  if (event.key === EVENT_MOVEMENTS.LEFT) {
    piece.position.x--;
    if (checkCollision()) {
      piece.position.x++;
    }
  }
  if (event.key === EVENT_MOVEMENTS.RIGHT) {
    piece.position.x++;
    if (checkCollision()) {
      piece.position.x--;
    }
  }
  if (event.key === EVENT_MOVEMENTS.DOWN) {
    piece.position.y++;
    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }
  if (event.key === EVENT_MOVEMENTS.UP) {
    const rotated = [];

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = [];
      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i]);
      }
      rotated.push(row);
    }

    const previousShape = piece.shape;
    piece.shape = rotated;

    if (checkCollision()) {
      piece.shape = previousShape;
    }
  }
});

// 6. Collisions
function checkCollision(): number[] | undefined {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return value !== 0 &&
        board[y + piece.position.y]?.[x + piece.position.x] !== 0
    })
  });
}

// 7. Solidify piece
function solidifyPiece(): void {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        board[y + piece.position.y][x + piece.position.x] = 1;
      }
    })
  });
  piece = buildPiece();
  if (checkCollision()) {
    window.alert('Game Over!! Sorry!');
    board.forEach((row) => row.fill(0));
    score = 0;
  }
}

// 8. Remove row when completed.
// todo try to refactor this
function removeRows(): void {
  const rowsToRemove: number[] = [];
  board.forEach((row, y) => {
    if (row.every(value => value === 1)) {
      rowsToRemove.push(y);
    }
  });

  rowsToRemove.forEach(y => {
    board.splice(y, 1);
    board.unshift(Array(BOARD_WIDTH).fill(0));
    score += 10;
  });
}

  // Final step Adding Audio
$section?.addEventListener('click', () => {
  $section.remove();
  const audio = new Audio('./sounds/Tetris.mp3');
  audio.volume = 0.5;
  audio.loop = true;
  audio.play();

  update();
});

