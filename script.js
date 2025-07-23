
// 2D 슈팅 게임 (비행기 vs 외계인)
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');
const scoreBoard = document.getElementById('score-board');

const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 48;
const PLAYER_Y = canvas.height - PLAYER_HEIGHT - 16;
const PLAYER_SPEED = 8;
const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 18;
const BULLET_SPEED = 12;
const ENEMY_WIDTH = 44;
const ENEMY_HEIGHT = 44;
const ENEMY_SPEED_BASE = 2.5;
const ENEMY_SPAWN_INTERVAL = 60;

let player, bullets, enemies, score, gameOver, animationId, leftPressed, rightPressed, frameCount;

function resetGame() {
    player = {
        x: canvas.width / 2 - PLAYER_WIDTH / 2,
        y: PLAYER_Y,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
    };
    bullets = [];
    enemies = [];
    score = 0;
    gameOver = false;
    leftPressed = false;
    rightPressed = false;
    frameCount = 0;
    scoreBoard.textContent = '';
    restartBtn.style.display = 'none';
    if (animationId) cancelAnimationFrame(animationId);
    loop();
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    ctx.fillStyle = '#1976d2';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(18, 18);
    ctx.lineTo(0, 10);
    ctx.lineTo(-18, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#b5ead7';
    ctx.beginPath();
    ctx.ellipse(0, -8, 7, 10, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#f9c74f';
    ctx.fillRect(-22, 6, 44, 7);
    ctx.fillStyle = '#ffafcc';
    ctx.fillRect(-6, 14, 12, 8);
    ctx.restore();
}

function drawBullets() {
    ctx.save();
    ctx.fillStyle = '#ffafcc';
    for (let b of bullets) {
        ctx.fillRect(b.x, b.y, BULLET_WIDTH, BULLET_HEIGHT);
    }
    ctx.restore();
}

function drawEnemies() {
    for (let e of enemies) {
        ctx.save();
        ctx.translate(e.x + e.width/2, e.y + e.height/2);
        ctx.fillStyle = '#43aa8b';
        ctx.beginPath();
        ctx.ellipse(0, 0, e.width/2, e.height/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-10, -6, 6, 8, 0, 0, Math.PI*2);
        ctx.ellipse(10, -6, 6, 8, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-10, -6, 2, 0, Math.PI*2);
        ctx.arc(10, -6, 2, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 8, 8, 0, Math.PI);
        ctx.stroke();
        ctx.strokeStyle = '#b5ead7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -e.height/2 + 4); ctx.lineTo(-16, -e.height/2 - 10);
        ctx.moveTo(8, -e.height/2 + 4); ctx.lineTo(16, -e.height/2 - 10);
        ctx.stroke();
        ctx.restore();
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();

    if (leftPressed) player.x -= PLAYER_SPEED;
    if (rightPressed) player.x += PLAYER_SPEED;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    for (let b of bullets) {
        b.y -= BULLET_SPEED;
    }
    bullets = bullets.filter(b => b.y + BULLET_HEIGHT > 0);

    let enemySpeed = ENEMY_SPEED_BASE + Math.floor(score / 10) * 0.7;
    for (let e of enemies) {
        e.y += enemySpeed;
    }
    for (let e of enemies) {
        if (e.y + e.height >= player.y && e.x < player.x + player.width && e.x + e.width > player.x) {
            endGame();
            return;
        }
    }
    enemies = enemies.filter(e => e.y < canvas.height);

    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            let b = bullets[i], e = enemies[j];
            if (b.x < e.x + e.width && b.x + BULLET_WIDTH > e.x && b.y < e.y + e.height && b.y + BULLET_HEIGHT > e.y) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score++;
                break;
            }
        }
    }

    if (frameCount % ENEMY_SPAWN_INTERVAL === 0) {
        let ex = Math.random() * (canvas.width - ENEMY_WIDTH);
        enemies.push({ x: ex, y: -ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT });
    }
    frameCount++;

    ctx.save();
    ctx.font = 'bold 1.7rem Pretendard, Segoe UI, sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(`점수: ${score}`, 24, 44);
    ctx.restore();

    animationId = requestAnimationFrame(loop);
}

function shoot() {
    if (gameOver) return;
    if (bullets.length && bullets[bullets.length-1].y > player.y - 60) return;
    bullets.push({ x: player.x + player.width/2 - BULLET_WIDTH/2, y: player.y - BULLET_HEIGHT });
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
    if (e.code === 'Space') shoot();
});
window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft') leftPressed = false;
    if (e.code === 'ArrowRight') rightPressed = false;
});
restartBtn.addEventListener('click', resetGame);

resetGame();

// 2D 슈팅 게임 (비행기 vs 외계인)
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');
const scoreBoard = document.getElementById('score-board');

const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 48;
const PLAYER_Y = canvas.height - PLAYER_HEIGHT - 16;
const PLAYER_SPEED = 8;
const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 18;
const BULLET_SPEED = 12;
const ENEMY_WIDTH = 44;
const ENEMY_HEIGHT = 44;
const ENEMY_SPEED_BASE = 2.5;
const ENEMY_SPAWN_INTERVAL = 60;

let player, bullets, enemies, score, gameOver, animationId, leftPressed, rightPressed, frameCount;

function resetGame() {
    player = {
        x: canvas.width / 2 - PLAYER_WIDTH / 2,
        y: PLAYER_Y,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
    };
    bullets = [];
    enemies = [];
    score = 0;
    gameOver = false;
    leftPressed = false;
    rightPressed = false;
    frameCount = 0;
    scoreBoard.textContent = '';
    restartBtn.style.display = 'none';
    if (animationId) cancelAnimationFrame(animationId);
    loop();
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    ctx.fillStyle = '#1976d2';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(18, 18);
    ctx.lineTo(0, 10);
    ctx.lineTo(-18, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#b5ead7';
    ctx.beginPath();
    ctx.ellipse(0, -8, 7, 10, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#f9c74f';
    ctx.fillRect(-22, 6, 44, 7);
    ctx.fillStyle = '#ffafcc';
    ctx.fillRect(-6, 14, 12, 8);
    ctx.restore();
}

function drawBullets() {
    ctx.save();
    ctx.fillStyle = '#ffafcc';
    for (let b of bullets) {
        ctx.fillRect(b.x, b.y, BULLET_WIDTH, BULLET_HEIGHT);
    }
    ctx.restore();
}

function drawEnemies() {
    for (let e of enemies) {
        ctx.save();
        ctx.translate(e.x + e.width/2, e.y + e.height/2);
        ctx.fillStyle = '#43aa8b';
        ctx.beginPath();
        ctx.ellipse(0, 0, e.width/2, e.height/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-10, -6, 6, 8, 0, 0, Math.PI*2);
        ctx.ellipse(10, -6, 6, 8, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-10, -6, 2, 0, Math.PI*2);
        ctx.arc(10, -6, 2, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 8, 8, 0, Math.PI);
        ctx.stroke();
        ctx.strokeStyle = '#b5ead7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -e.height/2 + 4); ctx.lineTo(-16, -e.height/2 - 10);
        ctx.moveTo(8, -e.height/2 + 4); ctx.lineTo(16, -e.height/2 - 10);
        ctx.stroke();
        ctx.restore();
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();

    if (leftPressed) player.x -= PLAYER_SPEED;
    if (rightPressed) player.x += PLAYER_SPEED;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    for (let b of bullets) {
        b.y -= BULLET_SPEED;
    }
    bullets = bullets.filter(b => b.y + BULLET_HEIGHT > 0);

    let enemySpeed = ENEMY_SPEED_BASE + Math.floor(score / 10) * 0.7;
    for (let e of enemies) {
        e.y += enemySpeed;
    }
    for (let e of enemies) {
        if (e.y + e.height >= player.y && e.x < player.x + player.width && e.x + e.width > player.x) {
            endGame();
            return;
        }
    }
    enemies = enemies.filter(e => e.y < canvas.height);

    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            let b = bullets[i], e = enemies[j];
            if (b.x < e.x + e.width && b.x + BULLET_WIDTH > e.x && b.y < e.y + e.height && b.y + BULLET_HEIGHT > e.y) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score++;
                break;
            }
        }
    }

    if (frameCount % ENEMY_SPAWN_INTERVAL === 0) {
        let ex = Math.random() * (canvas.width - ENEMY_WIDTH);
        enemies.push({ x: ex, y: -ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT });
    }
    frameCount++;

    ctx.save();
    ctx.font = 'bold 1.7rem Pretendard, Segoe UI, sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(`점수: ${score}`, 24, 44);
    ctx.restore();

    animationId = requestAnimationFrame(loop);
}

function shoot() {
    if (gameOver) return;
    if (bullets.length && bullets[bullets.length-1].y > player.y - 60) return;
    bullets.push({ x: player.x + player.width/2 - BULLET_WIDTH/2, y: player.y - BULLET_HEIGHT });
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
    if (e.code === 'Space') shoot();
});
window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft') leftPressed = false;
    if (e.code === 'ArrowRight') rightPressed = false;
});
restartBtn.addEventListener('click', resetGame);

resetGame();

// 2D 슈팅 게임
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restart-btn');
const scoreBoard = document.getElementById('score-board');

const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 48;
const PLAYER_Y = canvas.height - PLAYER_HEIGHT - 16;
const PLAYER_SPEED = 8;
const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 18;
const BULLET_SPEED = 12;
const ENEMY_WIDTH = 44;
const ENEMY_HEIGHT = 44;
const ENEMY_SPEED_BASE = 2.5;
const ENEMY_SPAWN_INTERVAL = 60; // 프레임 단위

let player, bullets, enemies, score, gameOver, animationId, leftPressed, rightPressed, spacePressed, frameCount;

function resetGame() {
    player = {
        x: canvas.width / 2 - PLAYER_WIDTH / 2,
        y: PLAYER_Y,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
    };
    bullets = [];
    enemies = [];
    score = 0;
    gameOver = false;
    leftPressed = false;
    rightPressed = false;
    spacePressed = false;
    frameCount = 0;
    scoreBoard.textContent = '';
    restartBtn.style.display = 'none';
    if (animationId) cancelAnimationFrame(animationId);
    loop();
}

function drawPlayer() {
    // 전투 비행기(간단한 도형 조합)
    ctx.save();
    ctx.translate(player.x + player.width/2, player.y + player.height/2);
    // 본체
    ctx.fillStyle = '#1976d2';
    ctx.beginPath();
    ctx.moveTo(0, -22); // 앞
    ctx.lineTo(18, 18); // 오른쪽 뒤
    ctx.lineTo(0, 10); // 중앙 뒤
    ctx.lineTo(-18, 18); // 왼쪽 뒤
    ctx.closePath();
    ctx.fill();
    // 조종석
    ctx.fillStyle = '#b5ead7';
    ctx.beginPath();
    ctx.ellipse(0, -8, 7, 10, 0, 0, Math.PI*2);
    ctx.fill();
    // 날개
    ctx.fillStyle = '#f9c74f';
    ctx.fillRect(-22, 6, 44, 7);
    // 꼬리날개
    ctx.fillStyle = '#ffafcc';
    ctx.fillRect(-6, 14, 12, 8);
    ctx.restore();
}

function drawBullets() {
    ctx.save();
    ctx.fillStyle = '#ffafcc';
    for (let b of bullets) {
        ctx.fillRect(b.x, b.y, BULLET_WIDTH, BULLET_HEIGHT);
    }
    ctx.restore();
}

function drawEnemies() {
    for (let e of enemies) {
        ctx.save();
        ctx.translate(e.x + e.width/2, e.y + e.height/2);
        // 외계인 몸통
        ctx.fillStyle = '#43aa8b';
        ctx.beginPath();
        ctx.ellipse(0, 0, e.width/2, e.height/2, 0, 0, Math.PI*2);
        ctx.fill();
        // 눈
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-10, -6, 6, 8, 0, 0, Math.PI*2);
        ctx.ellipse(10, -6, 6, 8, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(-10, -6, 2, 0, Math.PI*2);
        ctx.arc(10, -6, 2, 0, Math.PI*2);
        ctx.fill();
        // 입
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 8, 8, 0, Math.PI);
        ctx.stroke();
        // 더듬이
        ctx.strokeStyle = '#b5ead7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -e.height/2 + 4); ctx.lineTo(-16, -e.height/2 - 10);
        ctx.moveTo(8, -e.height/2 + 4); ctx.lineTo(16, -e.height/2 - 10);
        ctx.stroke();
        ctx.restore();
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();

    // 플레이어 이동
    if (leftPressed) player.x -= PLAYER_SPEED;
    if (rightPressed) player.x += PLAYER_SPEED;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

    // 총알 이동
    for (let b of bullets) {
        b.y -= BULLET_SPEED;
    }
    // 총알 화면 밖 제거
    bullets = bullets.filter(b => b.y + BULLET_HEIGHT > 0);

    // 적 이동
    let enemySpeed = ENEMY_SPEED_BASE + Math.floor(score / 10) * 0.7;
    for (let e of enemies) {
        e.y += enemySpeed;
    }
    // 적 화면 밖 제거 및 게임오버 체크
    for (let e of enemies) {
        if (e.y + e.height >= player.y && e.x < player.x + player.width && e.x + e.width > player.x) {
            endGame();
            return;
        }
    }
    enemies = enemies.filter(e => e.y < canvas.height);

    // 총알-적 충돌
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            let b = bullets[i], e = enemies[j];
            if (b.x < e.x + e.width && b.x + BULLET_WIDTH > e.x && b.y < e.y + e.height && b.y + BULLET_HEIGHT > e.y) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score++;
                break;
            }
        }
    }

    // 적 생성
    if (frameCount % ENEMY_SPAWN_INTERVAL === 0) {
        let ex = Math.random() * (canvas.width - ENEMY_WIDTH);
        enemies.push({ x: ex, y: -ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT });
    }
    frameCount++;

    // 점수 표시
    ctx.save();
    ctx.font = 'bold 1.7rem Pretendard, Segoe UI, sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(`점수: ${score}`, 24, 44);
    ctx.restore();

    animationId = requestAnimationFrame(loop);
}

function shoot() {
    if (gameOver) return;
    // 연사 방지: 이미 마지막 총알이 플레이어 위에 있으면 발사 안함
    if (bullets.length && bullets[bullets.length-1].y > player.y - 60) return;
    bullets.push({ x: player.x + player.width/2 - BULLET_WIDTH/2, y: player.y - BULLET_HEIGHT });
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
    if (e.code === 'Space') shoot();
});
window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft') leftPressed = false;
    if (e.code === 'ArrowRight') rightPressed = false;
});
restartBtn.addEventListener('click', resetGame);

resetGame();

