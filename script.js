document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let score = 0;
    let level = 1;
    let highScore = localStorage.getItem('highScore') || 0;
    let spawnInterval = 1000; // Intervalo de aparición de elementos (en ms)
    let spawnTimer;
    let elementosPorNivel = 0;
    const elementosPorNivelLimite = 10; // Número máximo de elementos por nivel
    let gameOver = false;

    const elementos = [];
    const imgElemento = new Image();
    imgElemento.src = 'assets/images/elemento.png';
    const imgElementoClick = new Image();
    imgElementoClick.src = 'assets/images/explocion.png'; // Imagen al hacer clic

    function addElemento() {
        if (elementosPorNivel < elementosPorNivelLimite) {
            const x = Math.random() * (canvas.width - 100); // Considerar el tamaño del elemento
            const y = canvas.height + 50; // Generar justo antes del borde inferior
            elementos.push({ x, y, clicked: false });
            elementosPorNivel++;
        }
    }

    function drawElementos() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        elementos.forEach((elemento, index) => {
            const img = elemento.clicked ? imgElementoClick : imgElemento;
            ctx.drawImage(img, elemento.x, elemento.y, 100, 100); // Aumentar tamaño
            elemento.y -= 2; // Desplazamiento vertical hacia arriba
            if (elemento.y < -100) { // Desaparece al pasar el borde superior
                gameOver = true; // Detener el juego
            }
        });
        drawHUD();
    }

    function drawHUD() {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`Level: ${level}`, canvas.width - 100, 30);
        ctx.fillText(`High Score: ${highScore}`, 10, canvas.height - 10);
    }

    function drawGameOver() {
        ctx.fillStyle = 'red';
        ctx.font = '50px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Click to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
    }

    function resetGame() {
        score = 0;
        level = 1;
        spawnInterval = 1000;
        elementosPorNivel = 0;
        gameOver = false;
        elementos.length = 0; // Vaciar el array de elementos
        clearInterval(spawnTimer);
        spawnTimer = setInterval(addElemento, spawnInterval);
        requestAnimationFrame(gameLoop);
    }

    function gameLoop() {
        if (!gameOver) {
            drawElementos();
            requestAnimationFrame(gameLoop);
        } else {
            drawGameOver();
        }
    }

    canvas.addEventListener('click', (event) => {
        if (gameOver) {
            resetGame();
        } else {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            elementos.forEach((elemento, index) => {
                if (x > elemento.x && x < elemento.x + 100 && y > elemento.y && y < elemento.y + 100) {
                    elemento.clicked = true; // Cambia la imagen al hacer clic
                    setTimeout(() => {
                        elementos.splice(index, 1);
                        elementosPorNivel--; // Disminuir el conteo de elementos por nivel
                    }, 200); // Elimina el elemento después de 200 ms
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

    function updateSpawnInterval() {
        clearInterval(spawnTimer);
        spawnInterval /= 2;
        spawnTimer = setInterval(addElemento, spawnInterval);
    }

    spawnTimer = setInterval(addElemento, spawnInterval);
    requestAnimationFrame(gameLoop);
});
