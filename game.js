class SpaceFighterGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, paused, gameOver

        // Image loading
        this.images = {};
        this.imagesLoaded = false;
        this.loadImages();

        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.particles = [];

        // Game stats
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.bombs = 0;

        // Power-ups
        this.weaponBoostLevel = 0; // 0 = no boost, 1-5 = boost levels
        this.weaponBoostTimer = 0;
        this.weaponPersistMode = 'permanent'; // 'permanent' or 'timed'
        this.invincible = false;
        this.invincibilityTimer = 0;

        // Timing
        this.lastTime = 0;
        this.enemySpawnTimer = 0;
        this.powerUpSpawnTimer = 0;

        // Mouse position
        this.mouse = { x: 400, y: 300 };

        // Background settings
        this.selectedBackground = 'default';
        this.backgroundImage = null;
        this.backgroundY = 0;
        this.backgroundSpeed = 0.03; // 敌机基础速度(1像素/帧)的50% ≈ 0.03像素/毫秒

        this.initGame();
        this.bindEvents();
    }

    loadImages() {
        const imageFiles = [
            { name: 'player', src: 'image/战机1.png' },
            { name: 'enemy1', src: 'image/敌机1.png' },
            { name: 'enemy2', src: 'image/敌机2.png' }
        ];

        let loadedCount = 0;

        imageFiles.forEach(imageFile => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === imageFiles.length) {
                    this.imagesLoaded = true;
                    this.gameLoop();
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${imageFile.src}`);
                loadedCount++;
                if (loadedCount === imageFiles.length) {
                    this.imagesLoaded = true;
                    this.gameLoop();
                }
            };
            img.src = imageFile.src;
            this.images[imageFile.name] = img;
        });
    }

    loadBackgroundImage() {
        if (this.selectedBackground === 'default') {
            this.backgroundImage = null;
            return;
        }

        this.backgroundImage = new Image();
        this.backgroundImage.onload = () => {
            console.log(`Background image loaded: ${this.selectedBackground}`);
        };
        this.backgroundImage.onerror = () => {
            console.error(`Failed to load background image: ${this.selectedBackground}`);
            this.backgroundImage = null;
            this.selectedBackground = 'default';
        };
        this.backgroundImage.src = `background/${this.selectedBackground}`;
    }

    initGame() {
        this.player = new Player(400, 500);
        this.updateUI();
    }

    bindEvents() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.useBomb();
                }
            }
            if (e.code === 'Escape') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
            }
        });

        // Menu buttons
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('instructionsButton').addEventListener('click', () => this.showInstructions());
        document.getElementById('backButton').addEventListener('click', () => this.showMenu());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('resumeButton').addEventListener('click', () => this.resumeGame());
        document.getElementById('mainMenuButton').addEventListener('click', () => this.showMenu());
    }

    startGame() {
        // Read weapon persist mode from UI
        const weaponPersistSelect = document.getElementById('weaponPersist');
        this.weaponPersistMode = weaponPersistSelect.value;

        // Read background selection from UI
        const backgroundSelect = document.getElementById('backgroundSelect');
        this.selectedBackground = backgroundSelect.value;
        this.backgroundY = 0; // Reset background position
        this.loadBackgroundImage();

        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.bombs = 0;
        this.weaponBoostLevel = 0;
        this.invincible = false;
        this.weaponBoostTimer = 0;
        this.invincibilityTimer = 0;

        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.particles = [];

        this.player = new Player(400, 500);
        this.updateUI();
        this.hideAllMenus();
    }

    pauseGame() {
        this.gameState = 'paused';
        document.getElementById('pauseScreen').style.display = 'block';
    }

    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pauseScreen').style.display = 'none';
    }

    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('gameOverScreen').style.display = 'block';
    }

    restartGame() {
        this.startGame();
    }

    showMenu() {
        this.gameState = 'menu';
        this.hideAllMenus();
        document.getElementById('gameMenu').style.display = 'block';
        document.getElementById('instructions').style.display = 'none';
    }

    showInstructions() {
        document.getElementById('instructions').style.display = 'block';
    }

    hideAllMenus() {
        document.getElementById('gameMenu').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
    }

    useBomb() {
        if (this.bombs > 0) {
            this.bombs--;
            // Create explosion effect
            for (let i = 0; i < 20; i++) {
                this.particles.push(new Particle(400, 300, 'explosion'));
            }
            // Remove all enemies
            this.enemies = [];
            // Add score for each enemy destroyed
            this.score += 50;
            this.updateUI();
        }
    }

    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('levelValue').textContent = this.level;
        document.getElementById('livesValue').textContent = this.lives;
        document.getElementById('bombsValue').textContent = this.bombs;

        // Update power-up indicators
        if (this.weaponBoostLevel > 0) {
            document.getElementById('weaponBoost').style.display = 'block';
            if (this.weaponPersistMode === 'permanent') {
                document.getElementById('weaponBoost').innerHTML = `武器增强 x${this.weaponBoostLevel} (永久)`;
            } else {
                const timeLeft = Math.ceil(this.weaponBoostTimer / 1000);
                document.getElementById('weaponBoost').innerHTML = `武器增强 x${this.weaponBoostLevel} (${timeLeft}s)`;
            }
        } else {
            document.getElementById('weaponBoost').style.display = 'none';
        }

        if (this.invincible) {
            document.getElementById('invincibilityTimer').style.display = 'block';
            document.getElementById('invincibilityTime').textContent = Math.ceil(this.invincibilityTimer / 1000);
        } else {
            document.getElementById('invincibilityTimer').style.display = 'none';
        }
    }

    gameLoop(currentTime) {
        if (this.gameState === 'playing') {
            const deltaTime = currentTime - this.lastTime;
            this.update(deltaTime);
            this.render();
        }
        this.lastTime = currentTime;
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update background scrolling
        if (this.selectedBackground !== 'default') {
            this.backgroundY += this.backgroundSpeed * deltaTime;
            // Reset position when it scrolls off screen for seamless looping
            if (this.backgroundY >= 600) {
                this.backgroundY = 0;
            }
        }

        // Update player
        this.player.update(this.mouse.x, this.mouse.y);

        // Update power-up timers
        if (this.weaponBoostLevel > 0 && this.weaponPersistMode === 'timed') {
            this.weaponBoostTimer -= deltaTime;
            if (this.weaponBoostTimer <= 0) {
                this.weaponBoostLevel = Math.max(0, this.weaponBoostLevel - 1);
                if (this.weaponBoostLevel > 0) {
                    this.weaponBoostTimer = 15000; // 15 seconds per level
                }
            }
        }

        if (this.invincible) {
            this.invincibilityTimer -= deltaTime;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
            }
        }

        // Player shooting
        this.player.shoot(this.bullets, this.weaponBoostLevel);

        // Spawn enemies
        this.enemySpawnTimer += deltaTime;
        const spawnRate = Math.max(500 - this.level * 50, 100); // Faster spawning at higher levels
        if (this.enemySpawnTimer > spawnRate) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }

        // Spawn power-ups
        this.powerUpSpawnTimer += deltaTime;
        if (this.powerUpSpawnTimer > 10000) { // Every 10 seconds
            this.spawnPowerUp();
            this.powerUpSpawnTimer = 0;
        }

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].y < 0 || this.bullets[i].toRemove) {
                this.bullets.splice(i, 1);
            }
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update();
            if (this.enemies[i].y > 600 || this.enemies[i].toRemove) {
                this.enemies.splice(i, 1);
            }
        }

        // Update power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            this.powerUps[i].update();
            if (this.powerUps[i].y > 600 || this.powerUps[i].toRemove) {
                this.powerUps.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Collision detection
        this.checkCollisions();

        // Level progression
        if (this.score > this.level * 1000) {
            this.level++;
            this.updateUI();
        }

        this.updateUI();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, 800, 600);

        // Draw background
        this.drawBackground();

        // Draw game objects
        this.player.draw(this.ctx, this.invincible, this.images.player);

        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx));
        this.particles.forEach(particle => particle.draw(this.ctx));
    }

    drawBackground() {
        if (this.backgroundImage && this.selectedBackground !== 'default') {
            // Draw scrolling background image
            // Draw the main background image
            this.ctx.drawImage(this.backgroundImage, 0, this.backgroundY, 800, 600);
            // Draw a second copy above the first for seamless scrolling
            this.ctx.drawImage(this.backgroundImage, 0, this.backgroundY - 600, 800, 600);
        } else {
            // Draw default stars background
            this.ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 100; i++) {
                const x = (Math.sin(i * 0.1) * 400) + 400;
                const y = (i * 6 + Date.now() * 0.01) % 600;
                const size = Math.sin(i) * 2 + 1;
                this.ctx.fillRect(x, y, size, size);
            }
        }
    }

    spawnEnemy() {
        const types = ['basic', 'fast', 'heavy'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (800 - 80); // Adjusted for larger enemy images
        this.enemies.push(new Enemy(x, -80, type, this.level, this.images));
    }

    spawnPowerUp() {
        const types = ['weapon', 'invincibility', 'bomb'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (800 - 30);
        this.powerUps.push(new PowerUp(x, -30, type));
    }

    checkCollisions() {
        // Bullet-enemy collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.bullets[i] && this.enemies[j] &&
                    this.checkCollision(this.bullets[i], this.enemies[j])) {

                    // Create explosion particles
                    for (let k = 0; k < 5; k++) {
                        this.particles.push(new Particle(this.enemies[j].x, this.enemies[j].y, 'explosion'));
                    }

                    this.score += this.enemies[j].points;
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    break;
                }
            }
        }

        // Player-enemy collisions
        if (!this.invincible) {
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                if (this.checkCollision(this.player, this.enemies[i])) {
                    this.lives--;
                    this.enemies.splice(i, 1);

                    // Create explosion particles
                    for (let k = 0; k < 10; k++) {
                        this.particles.push(new Particle(this.player.x, this.player.y, 'explosion'));
                    }

                    // In permanent mode, losing life clears weapon boost
                    if (this.weaponPersistMode === 'permanent') {
                        this.weaponBoostLevel = 0;
                        this.weaponBoostTimer = 0;
                    }

                    if (this.lives <= 0) {
                        this.gameOver();
                        return;
                    }

                    // Temporary invincibility
                    this.invincible = true;
                    this.invincibilityTimer = 2000;
                    break;
                }
            }
        }

        // Player-powerup collisions
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            if (this.checkCollision(this.player, this.powerUps[i])) {
                this.applyPowerUp(this.powerUps[i].type);
                this.powerUps.splice(i, 1);
            }
        }
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    applyPowerUp(type) {
        switch (type) {
            case 'weapon':
                this.weaponBoostLevel = Math.min(5, this.weaponBoostLevel + 1); // Max 5 levels
                if (this.weaponPersistMode === 'timed') {
                    this.weaponBoostTimer = 15000; // 15 seconds per level
                }
                // In permanent mode, weapon boost persists until life is lost
                break;
            case 'invincibility':
                this.invincible = true;
                this.invincibilityTimer = 5000; // 5 seconds
                break;
            case 'bomb':
                this.bombs++;
                break;
        }
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60; // Increased size for image
        this.height = 60;
        this.speed = 5;
        this.shootTimer = 0;
    }

    update(mouseX, mouseY) {
        // Smooth movement towards mouse
        const dx = mouseX - this.x - this.width / 2;
        const dy = mouseY - this.y - this.height / 2;

        this.x += dx * 0.1;
        this.y += dy * 0.1;

        // Keep player in bounds
        this.x = Math.max(0, Math.min(800 - this.width, this.x));
        this.y = Math.max(0, Math.min(600 - this.height, this.y));
    }

    shoot(bullets, weaponBoostLevel) {
        this.shootTimer += 16; // Assuming 60 FPS
        const shootRate = weaponBoostLevel > 0 ? Math.max(50, 200 - weaponBoostLevel * 30) : 200;

        if (this.shootTimer > shootRate) {
            const centerX = this.x + this.width / 2 - 2;

            if (weaponBoostLevel === 0) {
                // Single shot
                bullets.push(new Bullet(centerX, this.y, -5));
            } else if (weaponBoostLevel === 1) {
                // Double shot
                bullets.push(new Bullet(centerX - 5, this.y, -5));
                bullets.push(new Bullet(centerX + 5, this.y, -5));
            } else if (weaponBoostLevel === 2) {
                // Triple shot
                bullets.push(new Bullet(centerX, this.y, -5));
                bullets.push(new Bullet(centerX - 8, this.y, -5, -0.5));
                bullets.push(new Bullet(centerX + 8, this.y, -5, 0.5));
            } else if (weaponBoostLevel === 3) {
                // Quad shot
                bullets.push(new Bullet(centerX - 10, this.y, -5));
                bullets.push(new Bullet(centerX - 3, this.y, -5));
                bullets.push(new Bullet(centerX + 3, this.y, -5));
                bullets.push(new Bullet(centerX + 10, this.y, -5));
            } else if (weaponBoostLevel === 4) {
                // Penta shot
                bullets.push(new Bullet(centerX, this.y, -5));
                bullets.push(new Bullet(centerX - 12, this.y, -5, -1));
                bullets.push(new Bullet(centerX - 6, this.y, -5, -0.5));
                bullets.push(new Bullet(centerX + 6, this.y, -5, 0.5));
                bullets.push(new Bullet(centerX + 12, this.y, -5, 1));
            } else if (weaponBoostLevel >= 5) {
                // Max level - spread shot
                for (let i = -2; i <= 2; i++) {
                    bullets.push(new Bullet(centerX + i * 8, this.y, -5, i * 0.3));
                }
                // Additional forward shots
                bullets.push(new Bullet(centerX - 3, this.y, -6));
                bullets.push(new Bullet(centerX + 3, this.y, -6));
            }
            this.shootTimer = 0;
        }
    }

    draw(ctx, invincible, playerImage) {
        if (invincible && Math.sin(Date.now() * 0.01) > 0) {
            ctx.globalAlpha = 0.5;
        }

        // Draw player ship image or fallback to rectangle
        if (playerImage && playerImage.complete) {
            ctx.drawImage(playerImage, this.x, this.y, this.width, this.height);
        } else {
            // Fallback drawing
            ctx.fillStyle = '#4a9eff';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Ship details
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);

            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(this.x + 15, this.y + 15, 10, 10);
        }

        ctx.globalAlpha = 1;
    }
}

class Bullet {
    constructor(x, y, speedY, speedX = 0) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speedY = speedY;
        this.speedX = speedX;
        this.toRemove = false;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor(x, y, type, level, images) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.toRemove = false;
        this.images = images;

        switch (type) {
            case 'basic':
                this.width = 50; // Increased for image
                this.height = 50;
                this.speed = 1 + level * 0.2;
                this.points = 10;
                this.color = '#ff6b6b';
                this.imageKey = 'enemy1';
                break;
            case 'fast':
                this.width = 40; // Smaller but still larger than before
                this.height = 40;
                this.speed = 2 + level * 0.3;
                this.points = 20;
                this.color = '#ff9f40';
                this.imageKey = 'enemy2';
                break;
            case 'heavy':
                this.width = 70; // Largest enemy
                this.height = 70;
                this.speed = 0.5 + level * 0.1;
                this.points = 30;
                this.color = '#9f40ff';
                this.imageKey = 'enemy1'; // Use enemy1 for heavy type too
                break;
        }
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx) {
        const enemyImage = this.images && this.images[this.imageKey];

        // Draw enemy image or fallback to rectangle
        if (enemyImage && enemyImage.complete) {
            ctx.drawImage(enemyImage, this.x, this.y, this.width, this.height);
        } else {
            // Fallback drawing
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Enemy details
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
        }
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.type = type;
        this.speed = 2;
        this.toRemove = false;
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    update() {
        this.y += this.speed;
        this.bobOffset += 0.1;
    }

    draw(ctx) {
        const bobY = this.y + Math.sin(this.bobOffset) * 3;

        switch (this.type) {
            case 'weapon':
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(this.x, bobY, this.width, this.height);
                ctx.fillStyle = '#000000';
                ctx.fillText('🔫', this.x + 5, bobY + 18);
                break;
            case 'invincibility':
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(this.x, bobY, this.width, this.height);
                ctx.fillStyle = '#000000';
                ctx.fillText('🛡️', this.x + 5, bobY + 18);
                break;
            case 'bomb':
                ctx.fillStyle = '#ff8800';
                ctx.fillRect(this.x, bobY, this.width, this.height);
                ctx.fillStyle = '#000000';
                ctx.fillText('💣', this.x + 5, bobY + 18);
                break;
        }
    }
}

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 5 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        if (this.type === 'explosion') {
            ctx.fillStyle = Math.random() > 0.5 ? '#ff6b6b' : '#ffaa00';
        }
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new SpaceFighterGame();
});