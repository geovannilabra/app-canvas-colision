const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "#ff8";

// Clase Círculo
class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.originalColor = color; // Guardamos el color original
        this.text = text;
        this.speed = speed;

        this.dx = 0; // No se moverán en la dirección X
        this.dy = -this.speed; // Movimiento hacia arriba
        this.collisionTimeout = 0; // Temporizador para mantener el color azul
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        this.draw(context);
        this.posY += this.dy; // Mueve el círculo hacia arriba

        // Restablecer el color después de que expire el temporizador
        if (this.collisionTimeout > 0) {
            this.collisionTimeout--;
        } else {
            this.color = this.originalColor;
        }

        // Eliminar círculos que se han salido del canvas por la parte superior
        if (this.posY + this.radius < 0) {
            this.color = this.originalColor; // Restablecer el color
            return false; // Indica que debe eliminarse
        }
        return true; // Indica que debe permanecer
    }

    isCollidingWith(otherCircle) {
        const distance = Math.sqrt(
            (this.posX - otherCircle.posX) ** 2 + (this.posY - otherCircle.posY) ** 2
        );
        return distance < this.radius + otherCircle.radius; // Verifica si están colisionando
    }

    setCollisionColor() {
        this.color = "#0000FF"; // Cambiar a azul
        this.collisionTimeout = 30; // Mantener el color azul por 30 frames (~0.5 segundos a 60 fps)
    }
}

// Crear un array para almacenar los círculos
let circles = [];

// Función para generar círculos aleatorios
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let x = Math.random() * (window_width - radius * 2) + radius; // Posición X aleatoria
        let y = window_height + radius; // Comienza justo fuera del margen inferior del canvas
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Color aleatorio
        let speed = Math.random() * 2 + 1; // Velocidad entre 1 y 3
        let text = `C${i + 1}`; // Etiqueta del círculo

        // Crear un nuevo círculo y añadirlo al array
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

// Función para manejar la colisión entre dos círculos
function handleCollision(circle1, circle2) {
    // Intercambiar velocidades en X
    let tempDx = circle1.dx;
    circle1.dx = circle2.dx;
    circle2.dx = tempDx;

    // Intercambiar velocidades en Y
    let tempDy = circle1.dy;
    circle1.dy = circle2.dy;
    circle2.dy = tempDy;
}

// Función para animar los círculos
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas

    // Verificar colisiones y eliminar círculos fuera del canvas
    circles = circles.filter(circle => circle.update(ctx)); // Actualizar y eliminar círculos fuera del canvas

    // Verificar colisiones entre los círculos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (circles[i].isCollidingWith(circles[j])) {
                circles[i].setCollisionColor(); // Cambiar color a azul por más tiempo
                circles[j].setCollisionColor(); // Cambiar color a azul por más tiempo
                handleCollision(circles[i], circles[j]); // Rebotar los círculos
            }
        }
    }

    requestAnimationFrame(animate); // Repetir la animación
}

// Detectar clic del mouse para eliminar círculos
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    circles = circles.filter(circle => {
        const distance = Math.sqrt((mouseX - circle.posX) ** 2 + (mouseY - circle.posY) ** 2);
        return distance > circle.radius; // Retorna solo los círculos que no están dentro del clic
    });
});

// Generar círculos y comenzar la animación
generateCircles(10); // Puedes cambiar el número de círculos aquí
animate();
