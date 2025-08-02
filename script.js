class DinoGame {
    constructor() {
        this.gameContainer = document.getElementById('gameContainer');
        this.dino = document.getElementById('dino');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        
        this.isGameRunning = false;
        this.isJumping = false;
        this.score = 0;
        this.highScore = localStorage.getItem('dinoHighScore') || 0;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.gameLoop = null;
        this.difficultyLevel = 1;
        
        this.init();
    }
    
    init() {
        this.updateScore();
        this.setupEventListeners();
        // Activar animación de correr desde el inicio
        this.dino.classList.add('running');
    }
    
    setupEventListeners() {
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (!this.isGameRunning) {
                    this.startGame();
                } else {
                    this.jump();
                }
            }
            
            // Easter egg: reset high score con 'R'
            if (e.code === 'KeyR' && !this.isGameRunning) {
                this.resetHighScore();
            }
        });
        
        // Eventos de click/touch
        this.gameContainer.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.isGameRunning) {
                this.startGame();
            } else {
                this.jump();
            }
        });
        
        // Eventos touch para móviles
        this.gameContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.isGameRunning) {
                this.startGame();
            } else {
                this.jump();
            }
        });
        
        // Prevenir scroll y zoom en móviles
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Pause/resume cuando la ventana pierde foco
        window.addEventListener('blur', () => {
            if (this.isGameRunning) {
                this.pauseGame();
            }
        });
        
        window.addEventListener('focus', () => {
            if (this.isGameRunning) {
                this.resumeGame();
            }
        });
    }
    
    createClouds() {
        // Función eliminada - estilo minimalista sin nubes
    }
    
    startGame() {
        this.isGameRunning = true;
        this.score = 0;
        this.gameSpeed = 4;
        this.difficultyLevel = 1;
        this.obstacles = [];
        this.obstacleTimer = 0;
        
        this.gameOverElement.style.display = 'none';
        this.dino.classList.add('running');
        this.dino.classList.remove('jumping');
        
        // Limpiar obstáculos existentes
        document.querySelectorAll('.cactus').forEach(cactus => cactus.remove());
        
        // Reanudar animaciones
        document.querySelectorAll('.paused').forEach(el => {
            el.classList.remove('paused');
        });
        
        this.gameLoop = setInterval(() => this.update(), 20);
        
        // Sonido de inicio (simulado con vibración en móviles)
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    jump() {
        if (!this.isJumping && this.isGameRunning) {
            this.isJumping = true;
            this.dino.classList.add('jumping');
            
            // Sonido de salto (simulado con vibración)
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
            
            setTimeout(() => {
                this.isJumping = false;
                if (this.isGameRunning) {
                    this.dino.classList.add('running');
                    this.dino.classList.remove('jumping');
                }
            }, 600);
        }
    }
    
    createObstacle() {
        // Solo cactus y cactus pequeño
        const types = ['cactus', 'cactus small'];
        const type = types[Math.floor(Math.random() * types.length)];
        const obstacle = document.createElement('div');
        obstacle.className = type;
        obstacle.style.right = '-40px';
        obstacle.style.position = 'absolute';
        obstacle.style.bottom = '20px';
        this.gameContainer.appendChild(obstacle);
        this.obstacles.push(obstacle);
    }
    
    update() {
        // Incrementar puntuación
        this.score += 1;
        this.updateScore();

        // Aumentar dificultad cada 500 puntos
        if (this.score % 500 === 0 && this.score > 0) {
            this.difficultyLevel++;
            this.gameSpeed += 0.3;
            this.gameContainer.style.filter = 'brightness(1.2)';
            setTimeout(() => {
                this.gameContainer.style.filter = 'brightness(1)';
            }, 200);
        }

        // Crear obstáculos con frecuencia variable
        this.obstacleTimer++;
        const obstacleFrequency = Math.max(80 - (this.difficultyLevel * 5), 40);

        if (this.obstacleTimer > Math.random() * obstacleFrequency + obstacleFrequency) {
            this.createObstacle();
            this.obstacleTimer = 0;
        }

        // Mover y limpiar obstáculos
        this.obstacles.forEach((obstacle, index) => {
            const currentRight = parseInt(obstacle.style.right) || 0;
            obstacle.style.right = (currentRight + this.gameSpeed) + 'px';

            // Remover obstáculos que salieron de pantalla
            if (currentRight > 950) {
                obstacle.remove();
                this.obstacles.splice(index, 1);
            }

            // Detectar colisión solo con cactus
            if ((obstacle.classList.contains('cactus') || obstacle.classList.contains('cactus small')) && this.checkCollision(obstacle)) {
                this.gameOver();
            }
        });
    }
    
    checkCollision(obstacle) {
        const dinoRect = this.dino.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();
        
        // Hacer la detección un poco más permisiva para mejor jugabilidad
        const margin = 8;
        
        return !(dinoRect.right < obstacleRect.left + margin || 
                dinoRect.left > obstacleRect.right - margin || 
                dinoRect.bottom < obstacleRect.top + margin || 
                dinoRect.top > obstacleRect.bottom - margin);
    }
    
    gameOver() {
        this.isGameRunning = false;
        clearInterval(this.gameLoop);
        
        // Pausar todas las animaciones
        document.querySelectorAll('.cactus, .ground').forEach(el => {
            el.classList.add('paused');
        });
        
        this.dino.classList.remove('running', 'jumping');
        this.dino.classList.remove('running', 'jumping');
        
        // Actualizar high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dinoHighScore', this.highScore);
            
            // Celebrar nuevo récord
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100, 50, 100]);
            }
        }
        
        // Vibración de game over
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
        
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
        this.updateScore();
        
        // Efecto visual de game over
        this.gameContainer.style.filter = 'grayscale(0.5)';
        setTimeout(() => {
            this.gameContainer.style.filter = 'grayscale(0)';
        }, 1000);
    }
    
    pauseGame() {
        if (this.isGameRunning) {
            clearInterval(this.gameLoop);
            document.querySelectorAll('.cactus, .ground').forEach(el => {
                el.classList.add('paused');
            });
        }
    }
    
    resumeGame() {
        if (this.isGameRunning) {
            document.querySelectorAll('.paused').forEach(el => {
                el.classList.remove('paused');
            });
            this.gameLoop = setInterval(() => this.update(), 20);
        }
    }
    
    updateScore() {
        const scoreStr = this.score.toString().padStart(5, '0');
        const highScoreStr = this.highScore.toString().padStart(5, '0');
        this.scoreElement.textContent = `HI ${highScoreStr} ${scoreStr}`;
    }
    
    resetHighScore() {
        this.highScore = 0;
        localStorage.removeItem('dinoHighScore');
        this.updateScore();
        
        // Feedback visual
        this.scoreElement.style.color = '#DC143C';
        setTimeout(() => {
            this.scoreElement.style.color = '#2F4F4F';
        }, 500);
    }
    
    restart() {
        clearInterval(this.gameLoop);
        
        // Limpiar obstáculos
        document.querySelectorAll('.cactus').forEach(cactus => cactus.remove());
        this.obstacles = [];
        
        // Reiniciar animaciones y estilos
        document.querySelectorAll('.paused').forEach(el => {
            el.classList.remove('paused');
        });
        
        this.gameContainer.style.filter = 'grayscale(0)';
        
        this.startGame();
    }
}

// Variables globales
let game;

// Inicializar el juego cuando se carga la página
window.addEventListener('load', () => {
    game = new DinoGame();
});

// Función para reiniciar (llamada desde el botón)
function restartGame() {
    game.restart();
}

// Prevenir comportamiento por defecto de teclas de navegación
window.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
});

// Manejar cambios de orientación en móviles
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // Reajustar elementos si es necesario
        if (game && !game.isGameRunning) {
            game.updateScore();
        }
    }, 100);
});

// Detectar si el dispositivo soporta vibración
if (navigator.vibrate) {
    console.log('Vibración soportada - Se agregaron efectos de vibración');
} else {
    console.log('Vibración no soportada en este dispositivo');
}

// Easter eggs y cheats (solo en desarrollo)
window.addEventListener('keydown', (e) => {
    // Cheat: Presionar 'G' para modo invencible (solo si no hay high score)
    if (e.code === 'KeyG' && game && !game.isGameRunning && game.highScore === 0) {
        console.log('Modo debug activado - Cheat codes disponibles');
    }
});