document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let level = 1;
    let highScore = localStorage.getItem('highScore') || 0;
    let spawnInterval = 1000;
    let spawnTimer;
    let elementosPorNivel = 0;
    const elementosPorNivelLimite = 10;
    let gameOver = false;

    const elementos = [];
    const imgElemento = new Image();
    imgElemento.src = 'assets/images/elemento.png';
    const imgElementoClick = new Image();
    imgElementoClick.src = 'assets/images/explocion.png';

    // Función para agregar un nuevo elemento
    function addElemento() {
        if (elementosPorNivel < elementosPorNivelLimite) {
            const x = Math.random() * (canvas.width - 100);
            const y = canvas.height + 50;
            const velocidadX = (Math.random() - 0.5) * 4;
            const velocidadY = 2 + Math.random();
            elementos.push({ x, y, velocidadX, velocidadY, clicked: false });
            elementosPorNivel++;
        }
    }

    // Función para detectar colisiones entre dos elementos
    function detectCollision(el1, el2) {
        const distX = el1.x - el2.x;
        const distY = el1.y - el2.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        return distance < 100;
    }

    // Función para resolver las colisiones entre dos elementos
    function resolveCollision(el1, el2) {
        const dx = el1.x - el2.x;
        const dy = el1.y - el2.y;
        const collisionAngle = Math.atan2(dy, dx);
        const speed1 = Math.sqrt(el1.velocidadX * el1.velocidadX + el1.velocidadY * el1.velocidadY);
        const speed2 = Math.sqrt(el2.velocidadX * el2.velocidadX + el2.velocidadY * el2.velocidadY);

        el1.velocidadX = speed2 * Math.cos(collisionAngle);
        el1.velocidadY = Math.abs(speed2 * Math.sin(collisionAngle)); // Asegurar que siempre sea positivo
        el2.velocidadX = speed1 * Math.cos(collisionAngle + Math.PI);
        el2.velocidadY = Math.abs(speed1 * Math.sin(collisionAngle + Math.PI)); // Asegurar que siempre sea positivo
    }

    // Función para actualizar la posición de los elementos
    function updateElementos() {
        elementos.forEach((elemento, index) => {
            elemento.x += elemento.velocidadX;
            elemento.y -= elemento.velocidadY;

            // Rebote en los bordes laterales
            if (elemento.x <= 0 || elemento.x >= canvas.width - 100) {
                elemento.velocidadX = -elemento.velocidadX;
            }

            // Si un elemento pasa el borde superior, termina el juego
            if (elemento.y < -100) {
                gameOver = true;
            }

            // Detección de colisiones con otros elementos
            for (let i = index + 1; i < elementos.length; i++) {
                if (detectCollision(elemento, elementos[i])) {
                    resolveCollision(elemento, elementos[i]);
                }
            }
        });
    }

    // Función para dibujar los elementos en el canvas
    function drawElementos() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        elementos.forEach((elemento) => {
            const img = elemento.clicked ? imgElementoClick : imgElemento;
            ctx.drawImage(img, elemento.x, elemento.y, 100, 100);
        });
        drawHUD();
    }

    // Función para dibujar el HUD (Score, Level, High Score)
    function drawHUD() {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`Level: ${level}`, canvas.width - 100, 30);
        ctx.fillText(`High Score: ${highScore}`, 10, canvas.height - 10);
    }

    // Función para dibujar el mensaje de Game Over
    function drawGameOver() {
        ctx.fillStyle = 'red';
        ctx.font = '50px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Click to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
    }

    // Función para reiniciar el juego
    function resetGame() {
        score = 0;
        level = 1;
        spawnInterval = 1000;
        elementosPorNivel = 0;
        gameOver = false;
        elementos.length = 0;
        clearInterval(spawnTimer);
        spawnTimer = setInterval(addElemento, spawnInterval);
        requestAnimationFrame(gameLoop);
    }

    // Bucle principal del juego
    function gameLoop() {
        if (!gameOver) {
            updateElementos();
            drawElementos();
            requestAnimationFrame(gameLoop);
        } else {
            drawGameOver();
        }
    }

    // Manejo del clic del ratón
    canvas.addEventListener('click', (event) => {
        if (gameOver) {
            resetGame();
        } else {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            elementos.forEach((elemento, index) => {
                if (x > elemento.x && x < elemento.x + 100 && y > elemento.y && y < elemento.y + 100) {
                    elemento.clicked = true;
                    setTimeout(() => {
                        elementos.splice(index, 1);
                        elementosPorNivel--;
                    }, 200);
                    score++;
                    if (score % 10 === 0) {
                        level++;
                        updateSpawnInterval();
                    }
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('highScore', highScore);
                    }
                }
            });
        }
    });

    // Función para actualizar el intervalo de aparición de elementos
    function updateSpawnInterval() {
        clearInterval(spawnTimer);
        spawnInterval /= 2;
        spawnTimer = setInterval(addElemento, spawnInterval);
    }

    // Inicialización del juego
    spawnTimer = setInterval(addElemento, spawnInterval);
    requestAnimationFrame(gameLoop);
});
