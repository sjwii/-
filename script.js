// 패들 그리기
function drawPaddle() {
    ctx.save();
    ctx.fillStyle = '#1976d2';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.restore();
}

// 공 그리기
function drawBall() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffafcc';
    ctx.shadowColor = '#bde0fe';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
}

// 벽돌 그리기
function drawBricks() {
    for (let r = 0; r < BRICK_ROW; r++) {
        for (let c = 0; c < BRICK_COL; c++) {
            if (!bricks[r][c].destroyed) {
                let brickX = BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING);
                let brickY = BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING);
                bricks[r][c].x = brickX;
                bricks[r][c].y = brickY;
                ctx.save();
                ctx.fillStyle = `hsl(${r*60 + c*10}, 70%, 60%)`;
                ctx.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.strokeRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.restore();
            }
        }
    }
}

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');
const scoreBoard = document.getElementById('score-board');

// 게임 설정
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 18;
const PADDLE_Y = canvas.height - 40;
const BALL_RADIUS = 12;
const BALL_SPEED = 6;
const BRICK_ROW = 5;
const BRICK_COL = 10;
const BRICK_WIDTH = 68;
const BRICK_HEIGHT = 28;
const BRICK_PADDING = 12;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 32;

let paddle, ball, bricks, score, gameOver, animationId, leftPressed, rightPressed;

function resetGame() {
    paddle = {
        x: canvas.width / 2 - PADDLE_WIDTH / 2,
        y: PADDLE_Y,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT
    };
    ball = {
        x: canvas.width / 2,
        y: PADDLE_Y - BALL_RADIUS - 2,
        dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
        dy: -BALL_SPEED,
        radius: BALL_RADIUS
    };
    bricks = [];
    for (let r = 0; r < BRICK_ROW; r++) {
        bricks[r] = [];
        for (let c = 0; c < BRICK_COL; c++) {
            bricks[r][c] = { x: 0, y: 0, destroyed: false };
        }
    }
    score = 0;
    gameOver = false;
    leftPressed = false;
    rightPressed = false;
    scoreBoard.textContent = '';
    restartBtn.style.display = 'none';
    if (animationId) cancelAnimationFrame(animationId);
    loop();
}
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    drawBall();
    drawBricks();

    // 패들 이동
    if (leftPressed) paddle.x -= 12;
    if (rightPressed) paddle.x += 12;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.width, paddle.x));

    // 남은 벽돌 개수에 따라 속도 증가
    const totalBricks = BRICK_ROW * BRICK_COL;
    const bricksLeft = totalBricks - score;
    // 최소 1.0, 최대 2.5배까지 빨라짐
    const speedMultiplier = 1 + (1.5 * (1 - bricksLeft / totalBricks));

    // 공 이동
    ball.x += ball.dx * speedMultiplier;
    ball.y += ball.dy * speedMultiplier;

    // 벽 충돌
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx *= -1;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // 패들 충돌
    if (
        ball.y + ball.radius >= paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.dy > 0
    ) {
        // 반사 각도 조정
        let hit = (ball.x - (paddle.x + paddle.width/2)) / (paddle.width/2);
        ball.dx = BALL_SPEED * hit;
        ball.dy = -BALL_SPEED;
    }

    // 벽돌 충돌
    for (let r = 0; r < BRICK_ROW; r++) {
        for (let c = 0; c < BRICK_COL; c++) {
            let brick = bricks[r][c];
            if (!brick.destroyed) {
                if (
                    ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + BRICK_WIDTH &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + BRICK_HEIGHT
                ) {
                    brick.destroyed = true;
                    score++;
                    // 충돌 방향 반전
                    let prevX = ball.x - ball.dx * speedMultiplier;
                    let prevY = ball.y - ball.dy * speedMultiplier;
                    if (
                        prevY + ball.radius <= brick.y ||
                        prevY - ball.radius >= brick.y + BRICK_HEIGHT
                    ) {
                        ball.dy *= -1;
                    } else {
                        ball.dx *= -1;
                    }
                }
            }
        }
    }

    // 게임 오버
    if (ball.y - ball.radius > canvas.height) {
        endGame();
        return;
    }

    // 클리어
    if (score === BRICK_ROW * BRICK_COL) {
        scoreBoard.innerHTML = `<span style="color:#43aa8b;">축하합니다!<br>모든 벽돌을 깼어요!</span>`;
        restartBtn.style.display = 'inline-block';
        cancelAnimationFrame(animationId);
        return;
    }

    ctx.save();
    ctx.font = 'bold 1.3rem Pretendard, Segoe UI, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(`점수: ${score}`, 24, 32);
    ctx.restore();

    animationId = requestAnimationFrame(loop);
}


function endGame() {
    gameOver = true;
    scoreBoard.innerHTML = `<span style="color:#ff6f91;">게임 오버!<br>최종 점수: <b>${score}</b></span>`;
    restartBtn.style.display = 'inline-block';
    cancelAnimationFrame(animationId);
}

window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft') leftPressed = true;
    if (e.code === 'ArrowRight') rightPressed = true;
});
window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft') leftPressed = false;
    if (e.code === 'ArrowRight') rightPressed = false;
});
restartBtn.addEventListener('click', resetGame);

resetGame();
