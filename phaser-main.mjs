import * as Phaser from './node_modules/phaser/dist/phaser.esm.min.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);
const segmentSize = 20;
let snake;
let cursors;
let timer;
let lastDirection = Phaser.Math.Vector2.RIGHT;
let newDirection = null;
let fruit;
let fruitX;
let fruitY;
let snakeSegments = [{ x: 100, y: 100 }];
let fpsText;
let frameCount = 0;
let startTime;

function create() {
  snake = this.add.graphics({ fillStyle: { color: 0xffffff } });
  snake.fillRect(100, 100, 20, 20);

  cursors = this.input.keyboard.createCursorKeys();

  timer = this.time.addEvent({
    delay: 100,
    callback: moveSnake,
    callbackScope: this,
    loop: true,
    paused: true,
  });

  this.input.on('pointerdown', function () {
    if (!timer.running) {
      timer.paused = false;
    }
  });

  createFruit(this);

  fpsText = this.add.text(10, 10, 'FPS: 0', { font: '16px Arial', fill: '#ffffff' });
  startTime = Date.now();
}

function update() {
  if (cursors.left.isDown && lastDirection !== Phaser.Math.Vector2.RIGHT) {
    newDirection = Phaser.Math.Vector2.LEFT;
  } else if (cursors.right.isDown && lastDirection !== Phaser.Math.Vector2.LEFT) {
    newDirection = Phaser.Math.Vector2.RIGHT;
  }

  if (cursors.up.isDown && lastDirection !== Phaser.Math.Vector2.DOWN) {
    newDirection = Phaser.Math.Vector2.UP;
  } else if (cursors.down.isDown && lastDirection !== Phaser.Math.Vector2.UP) {
    newDirection = Phaser.Math.Vector2.DOWN;
  }

  frameCount++;

  if (Date.now() - startTime >= 1000) {
    const fps = Math.round((frameCount * 1000) / (Date.now() - startTime));
    fpsText.setText('FPS: ' + fps);
    frameCount = 0;
    startTime = Date.now();
  }
}

function moveSnake() {
  if (newDirection) {
    lastDirection = newDirection;
    newDirection = null;
  }

  // Создаем новую голову
  const newHead = {
    x: snakeSegments[0].x + lastDirection.x * segmentSize,
    y: snakeSegments[0].y + lastDirection.y * segmentSize,
  };

  // Проверяем столкновение с границами экрана
  checkScreenBounds(newHead);

  // Проверяем столкновение с телом змеи
  if (checkSelfCollision(newHead.x, newHead.y)) {
    // Игра завершается при столкновении головы с телом
    game.scene.pause();
    console.log('Game Over!');
    return;
  }

  // Добавляем новую голову в начало массива сегментов
  snakeSegments.unshift(newHead);

  // Удаляем последний сегмент, чтобы змейка не росла бесконечно
  if (!checkCollision(newHead.x, newHead.y, fruitX, fruitY)) {
    snakeSegments.pop();
  } else {
    // Если змейка поела фрукт, создаем новый фрукт
    createFruit(this);
  }

  // Обновляем графику змейки
  updateSnakeGraphics();
}

function checkScreenBounds(head) {
  // Проверяем, выходит ли голова за видимые границы экрана
  if (head.x >= game.config.width) {
    head.x = 0;
  } else if (head.x < 0) {
    head.x = game.config.width - segmentSize;
  }

  if (head.y >= game.config.height) {
    head.y = 0;
  } else if (head.y < 0) {
    head.y = game.config.height - segmentSize;
  }
}

function checkSelfCollision(x, y) {
  // Проверяем, сталкивается ли голова с каким-то из сегментов тела (кроме головы)
  return snakeSegments.slice(1).some((segment) => checkCollision(x, y, segment.x, segment.y));
}

function updateSnakeGraphics() {
  // Очищаем графику змейки
  snake.clear();

  // Рисуем каждый сегмент змейки
  snakeSegments.forEach((segment, index) => {
    // Изменяем цвет головы на фиолетовый
    const color = index === 0 ? 0x800080 : 0xffffff;

    // Рисуем сегмент с учетом цвета
    snake.fillStyle(color);
    snake.fillRect(segment.x, segment.y, segmentSize, segmentSize);
  });
}

function createFruit(scene) {
  if (fruit) {
    fruit.destroy();
  }

  fruitX = Phaser.Math.Between(0, scene.game.config.width / 20 - 1) * 20;
  fruitY = Phaser.Math.Between(0, scene.game.config.height / 20 - 1) * 20;

  // Создаем новый фрукт как красный пиксель
  fruit = scene.add.graphics({ fillStyle: { color: 0xff0000 } });
  fruit.fillRect(fruitX, fruitY, 20, 20);
}

// Используем координаты объектов вместо getBounds()
function checkCollision(x1, y1, x2, y2) {
  return x1 === x2 && y1 === y2;
}
