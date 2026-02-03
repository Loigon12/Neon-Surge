// --- UTILIDADES ---
class Vector {
    constructor(x, y) { this.x = x; this.y = y; }
    add(v) { this.x += v.x; this.y += v.y; }
    sub(v) { return new Vector(this.x - v.x, this.y - v.y); }
    mag() { return Math.sqrt(this.x**2 + this.y**2); }
    normalize() {
        const m = this.mag();
        return m > 0 ? new Vector(this.x / m, this.y / m) : new Vector(0, 0);
    }
}

// --- CLASES CORE ---
class Entity {
    constructor(x, y, radius, color) {
        this.pos = new Vector(x, y);
        this.radius = radius;
        this.color = color;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

class Player extends Entity {
    constructor() {
        super(window.innerWidth / 2, window.innerHeight / 2, 15, '#06b6d4');
        this.hp = 100;
        this.speed = 4;
        this.keys = {};
    }

    update() {
        let move = new Vector(0, 0);
        if (this.keys['w']) move.y -= 1;
        if (this.keys['s']) move.y += 1;
        if (this.keys['a']) move.x -= 1;
        if (this.keys['d']) move.x += 1;
        
        move = move.normalize();
        this.pos.x += move.x * this.speed;
        this.pos.y += move.y * this.speed;
    }
}

class Enemy extends Entity {
    constructor(x, y, level) {
        super(x, y, 10 + Math.random() * 10, '#f43f5e');
        this.speed = 1.5 + (level * 0.2);
    }

    update(target) {
        const dir = target.pos.sub(this.pos).normalize();
        this.pos.x += dir.x * this.speed;
        this.pos.y += dir.y * this.speed;
    }
}

class Projectile extends Entity {
    constructor(x, y, targetX, targetY) {
        super(x, y, 4, '#fde047');
        const dir = new Vector(targetX - x, targetY - y).normalize();
        this.velocity = new Vector(dir.x * 10, dir.y * 10);
    }
    update() { this.pos.add(this.velocity); }
}

// --- GESTOR DEL JUEGO ---
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
let player, enemies, projectiles, frameCount, kills, isRunning;

function initGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player = new Player();
    enemies = [];
    projectiles = [];
    frameCount = 0;
    kills = 0;
    isRunning = true;
    document.getElementById('menu').style.display = 'none';
    
    requestAnimationFrame(gameLoop);
}

// Controles
window.addEventListener('keydown', (e) => player.keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => player.keys[e.key.toLowerCase()] = false);
window.addEventListener('mousedown', (e) => {
    if(isRunning) projectiles.push(new Projectile(player.pos.x, player.pos.y, e.clientX, e.clientY));
});

function gameLoop() {
    if (!isRunning) return;
    
    // 1. Limpiar pantalla con efecto de rastro (fade)
    ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Spawn de enemigos (escalable según frameCount)
    if (frameCount % 60 === 0) {
        const x = Math.random() < 0.5 ? -50 : canvas.width + 50;
        const y = Math.random() * canvas.height;
        enemies.push(new Enemy(x, y, Math.floor(kills/10)));
    }

    // 3. Actualizar y Dibujar Jugador
    player.update();
    player.draw(ctx);

    // 4. Lógica de Proyectiles
    projectiles.forEach((p, pIdx) => {
        p.update();
        p.draw(ctx);
        // Limpieza fuera de pantalla
        if (p.pos.x < 0 || p.pos.x > canvas.width || p.pos.y < 0 || p.pos.y > canvas.height) {
            projectiles.splice(pIdx, 1);
        }
    });

    // 5. Lógica de Enemigos y Colisiones
    enemies.forEach((en, enIdx) => {
        en.update(player);
        en.draw(ctx);

        // Colisión con Jugador
        const distToPlayer = en.pos.sub(player.pos).mag();
        if (distToPlayer < en.radius + player.radius) {
            player.hp -= 0.5;
            document.getElementById('hpBar').style.width = `${player.hp}%`;
            if (player.hp <= 0) gameOver();
        }

        // Colisión con Balas
        projectiles.forEach((p, pIdx) => {
            const dist = en.pos.sub(p.pos).mag();
            if (dist < en.radius + p.radius) {
                enemies.splice(enIdx, 1);
                projectiles.splice(pIdx, 1);
                kills++;
                document.getElementById('killsLabel').innerText = `Bajas: ${kills}`;
                document.getElementById('scoreLabel').innerText = `LVL ${Math.floor(kills/10) + 1}`;
            }
        });
    });

    frameCount++;
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    isRunning = false;
    alert(`SISTEMA COMPROMETIDO. Bajas confirmadas: ${kills}`);
    location.reload();
}