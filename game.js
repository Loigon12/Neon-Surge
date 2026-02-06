/**
 * CLASE VECTOR: Maneja matemáticas de posición y movimiento.
 * Fundamental para cálculos de distancia y normalización de velocidad.
 */
class Vector {
    constructor(x, y) { this.x = x; this.y = y; }
    
    // Suma un vector a la posición actual
    add(v) { this.x += v.x; this.y += v.y; }
    
    // Retorna un nuevo vector restando el actual de otro (para direcciones)
    sub(v) { return new Vector(this.x - v.x, this.y - v.y); }
    
    // Calcula la magnitud (longitud) del vector usando Pitágoras
    mag() { return Math.sqrt(this.x**2 + this.y**2); }
    
    // Convierte el vector en unitario (magnitud 1) para velocidad constante
    normalize() {
        const m = this.mag();
        return m > 0 ? new Vector(this.x / m, this.y / m) : new Vector(0, 0);
    }
}

/**
 * CLASE ENTITY: Clase base para todos los objetos renderizables en el canvas.
 */
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

/**
 * CLASE PLAYER: Gestiona la lógica del usuario, salud y controles.
 */
class Player extends Entity {
    constructor() {
        super(window.innerWidth / 2, window.innerHeight / 2, 15, '#06b6d4');
        this.hp = 100;
        this.speed = 4;
        this.keys = {}; // Diccionario para múltiples teclas presionadas
    }

    update() {
        let move = new Vector(0, 0);
        // Captura de movimiento del personake usando WASD
        if (this.keys['w']) move.y -= 1;
        if (this.keys['s']) move.y += 1;
        if (this.keys['a']) move.x -= 1;
        if (this.keys['d']) move.x += 1;
        
        // Normalización evita que el jugador se mueva más rápido en diagonal
        move = move.normalize();
        this.pos.x += move.x * this.speed;
        this.pos.y += move.y * this.speed;
    }
}