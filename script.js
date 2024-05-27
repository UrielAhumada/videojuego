document.addEventListener('DOMContentLoaded', (event) => {
    // Obtener el canvas y su contexto
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Declaración de variables del juego
    let score = 0; // Puntuación del jugador
    let level = 1; // Nivel actual
    let highScore = localStorage.getItem('highScore') || 0; // Puntuación más alta
    let spawnInterval = 1000; // Intervalo de aparición inicial de elementos
    let spawnTimer; // Temporizador para agregar elementos
    let elementosPorNivel = 0; // Contador de elementos por nivel
    const elementosPorNivelLimite = 10; // Límite de elementos por nivel
    let gameOver = false; // Estado del juego (true si el juego ha terminado)

    // Arreglos para almacenar los elementos y sus imágenes
    const elementos = [];
    const imgElemento = new Image();
    imgElemento.src = 'assets/images/elemento.png'; // Imagen del elemento normal
    const imgElementoClick = new Image();
    imgElementoClick.src = 'assets/images/explocion.png'; // Imagen del elemento al hacer clic

    // Función para agregar un nuevo elemento al juego
    function addElemento() {
        if (elementosPorNivel < elementosPorNivelLimite) {
            // Generar coordenadas aleatorias para el nuevo elemento
            const x = Math.random() * (canvas.width - 100);
            const y = canvas.height + 50;
            // Generar velocidades aleatorias para el nuevo elemento
            const velocidadX = (Math.random() - 0.5) * 4;
            const velocidadY = 2 + Math.random();
            // Agregar el nuevo elemento al arreglo de elementos
            elementos.push({ x, y, velocidadX, velocidadY, clicked: false });
            // Incrementar el contador de elementos por nivel
            elementosPorNivel++;
        }
    }

    // Función para detectar colisiones entre dos elementos
    function detectCollision(el1, el2) {
        const distX = el1.x - el2.x;
        const distY = el1.y - el2.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        return distance < 100; // Retorna true si la distancia entre los elementos es menor a 100 (radio de colisión)
    }

    // Función para resolver las colisiones entre dos elementos
    function resolveCollision(el1, el2) {
        const dx = el1.x - el2.x;
        const dy = el1.y - el2.y;
        const collisionAngle = Math.atan2(dy, dx);
        const speed1 = Math.sqrt(el1.velocidadX * el1.velocidadX + el1.velocidadY * el1.velocidadY);
        const speed2 = Math.sqrt(el2.velocidadX * el2.velocidadX + el2.velocidadY * el2.velocidadY);

        // Calcular nuevas velocidades para los elementos después de la colisión
        el1.velocidadX = speed2 * Math.cos(collisionAngle);
        el1.velocidadY = Math.abs(speed2 * Math.sin(collisionAngle)); // Asegurar que la velocidad siempre sea positiva
        el2.velocidadX = speed1 * Math.cos(collisionAngle + Math.PI);
        el2.velocidadY = Math.abs(speed1 * Math.sin(collisionAngle + Math.PI)); // Asegurar que la velocidad siempre sea positiva
    }

    // Función para actualizar la posición de los elementos en cada fotograma
    function updateElementos() {
        elementos.forEach((elemento, index) => {
            // Mover el elemento según su velocidad en dirección vertical y horizontal
            elemento.x += elemento.velocidadX;
            elemento.y -= elemento.velocidadY;

            // Rebote en los bordes laterales del canvas
            if (elemento.x <= 0 || elemento.x >= canvas.width - 100) {
                elemento.velocidadX = -elemento.velocidadX; // Invertir la dirección horizontal
            }

            // Verificar si el elemento ha pasado el borde superior del canvas
            if (elemento.y < -100) {
                gameOver = true; // Establecer el estado del juego como "Game Over"
            }

            // Detección de colisiones con otros elementos
            for (let i = index + 1; i < elementos.length; i++) {
                if (detectCollision(elemento, elementos[i])) {
                    resolveCollision(elemento, elementos[i]); // Resolver la colisión entre los elementos
                }
            }
        });
    }

    // Función para dibujar los elementos en el canvas
    function drawElementos() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas en cada fotograma
        elementos.forEach((elemento) => {
            // Seleccionar la imagen del elemento según su estado (normal o al hacer clic)
            const img = elemento.clicked ? imgElementoClick : imgElemento;
            // Dibujar el elemento en el canvas en su posición actual
            ctx.drawImage(img, elemento.x, elemento.y, 100, 100);
        });
        drawHUD(); // Dibujar el HUD (puntuación, nivel, puntuación máxima)
    }

    // Función para dibujar el HUD (Heads-Up Display) en el canvas
    function drawHUD() {
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        // Mostrar la puntuación, nivel y puntuación máxima en el canvas
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`Level: ${level}`, canvas.width - 100, 30);
        ctx.fillText(`High Score: ${highScore}`, 10, canvas.height - 10);
    }

    // Función para dibujar el mensaje de "Game Over" en el canvas
    function drawGameOver() {
        ctx.fillStyle = 'red';
        ctx.font = '50px Arial';
        // Mostrar el mensaje de "Game Over" en el centro del canvas
        ctx.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2);
        ctx.font = '20px Arial';
        // Mostrar el mensaje "Click to Restart" debajo del mensaje de "Game Over"
        ctx.fillText('Click to Restart', canvas.width / 2 - 80, canvas.height / 2 + 40);
    }

    // Función para reiniciar el juego después de que termina el juego
    function resetGame() {
        // Restablecer todas las variables del juego
        score = 0;
        level = 1;
        spawnInterval = 1000;
        elementosPorNivel = 0;
        gameOver = false;
        elementos.length = 0; // Limpiar el arreglo de elementos
        clearInterval(spawnTimer); // Detener el temporizador de aparición de elementos
        spawnTimer = setInterval(addElemento, spawnInterval); // Reiniciar el temporizador
        requestAnimationFrame(gameLoop); // Volver a iniciar el bucle principal del juego
    }

    // Bucle principal del juego (se ejecuta en cada fotograma)
    function gameLoop() {
        if (!gameOver) {
            // Actualizar la posición de los elementos y dibujarlos en el canvas
            updateElementos();
            drawElementos();
            requestAnimationFrame(gameLoop); // Volver a solicitar el siguiente fotograma
        } else {
            // Si el juego ha terminado, dibujar el mensaje de "Game Over"
            drawGameOver();
        }
    }

    // Manejo del clic del ratón en el canvas
    canvas.addEventListener('click', (event) => {
        if (gameOver) {
            // Si el juego ha terminado y se hace clic en el canvas, reiniciar el juego
            resetGame();
        } else {
            // Si el juego está en curso, verificar si se ha hecho clic en algún elemento
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            elementos.forEach((elemento, index) => {
                if (x > elemento.x && x < elemento.x + 100 && y > elemento.y && y < elemento.y + 100) {
                    // Si se hace clic en un elemento, marcarlo como "clicked" y eliminarlo después de 200 milisegundos
                    elemento.clicked = true;
                    setTimeout(() => {
                        elementos.splice(index, 1); // Eliminar el elemento del arreglo
                        elementosPorNivel--; // Reducir el contador de elementos por nivel
                    }, 200);
                    score++; // Incrementar la puntuación del jugador
                    // Si la puntuación es un múltiplo de 10, aumentar el nivel y actualizar el intervalo de aparición de elementos
                    if (score % 10 === 0) {
                        level++;
                        updateSpawnInterval();
                    }
                    // Si la puntuación actual supera la puntuación máxima, actualizar la puntuación máxima
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('highScore', highScore); // Guardar la puntuación máxima en el almacenamiento local
                    }
                }
            });
        }
    });

    // Función para actualizar el intervalo de aparición de elementos después de cada incremento de nivel
    function updateSpawnInterval() {
        clearInterval(spawnTimer); // Detener el temporizador actual
        spawnInterval /= 2; // Reducir a la mitad el intervalo de aparición de elementos
        spawnTimer = setInterval(addElemento, spawnInterval); // Crear un nuevo temporizador con el intervalo actualizado
    }

    // Inicialización del juego: crear el primer elemento y comenzar el bucle principal del juego
    spawnTimer = setInterval(addElemento, spawnInterval);
    requestAnimationFrame(gameLoop);
});