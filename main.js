const playerSpeed = 0.6;

// Definición de la escena principal
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        this.load.image('player', 'assets/idle.png');
        this.load.image('background', 'assets/Rooms/01/Room1.png');
        this.load.image('collisionMap', 'assets/Rooms/01/Room1Collider.png');

        this.load.spritesheet('playerUp', 'assets/WalkUp.png', { frameWidth: 16, frameHeight: 46 });
        this.load.spritesheet('playerDown', 'assets/WalkDown.png', { frameWidth: 16, frameHeight: 47 });
        this.load.spritesheet('playerLeft', 'assets/WalkLeft.png', { frameWidth: 18, frameHeight: 46 });
        this.load.spritesheet('playerRight', 'assets/WalkRight.png', { frameWidth: 19, frameHeight: 47 });
        this.load.spritesheet('playerIdle', 'assets/idle.png', { frameWidth: 15, frameHeight: 44 });

        this.load.spritesheet('openDoor', 'assets/Rooms/01/RoomOpen.png', { frameWidth: 192, frameHeight: 144 });

    }

    create() {
        this.anims.create({ key: 'walkUp', frames: this.anims.generateFrameNumbers('playerUp', { start: 0, end: 11 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: 'walkDown', frames: this.anims.generateFrameNumbers('playerDown', { start: 0, end: 11 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: 'walkLeft', frames: this.anims.generateFrameNumbers('playerLeft', { start: 0, end: 11 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: 'walkRight', frames: this.anims.generateFrameNumbers('playerRight', { start: 0, end: 11 }), frameRate: 20, repeat: -1 });
        this.anims.create({ key: 'idle', frames: this.anims.generateFrameNumbers('playerIdle', { start: 0, end: 0 }), frameRate: 1, repeat: -1 });

        this.anims.create({ key: 'openingDoor', frames: this.anims.generateFrameNumbers('openDoor', { start: 0, end: 15 }), frameRate: 10, repeat: 0 });

        
        this.background = this.add.sprite(96, 72, 'backgroundAnim').setOrigin(0.5, 0.5);
        this.background.anims.play('openingDoor'); // Reproducir animación
        this.background.anims.stop();
        

        // Crear jugador usando Matter.js
        this.player = this.matter.add.sprite(96, 100, 'player', null, {
            chamfer: { radius: 10 },
            inertia: Infinity, // Bloquear rotación
            shape: {
                type: 'rectangle',
                width: 12, // Ancho de la colisión
                height: 12 // Altura de la colisión
            },
            render: { sprite: { xOffset: 0.0, yOffset: 0.4 } }
        });

        // Establecer los límites del mundo para las colisiones
        this.matter.world.setBounds(1, 0, 191, 143); // Establecer límites del mundo

        // Crear controles
        this.cursors = this.input.keyboard.createCursorKeys();

        this.isZPressed = false;
        this.input.keyboard.on('keydown-Z', () => {
            this.isZPressed = true;
            this.toggleDialogue();
        });

        this.input.keyboard.on('keyup-Z', () => {
            this.isZPressed = false; // Restablecer estado
        });
    
        // Crear colisiones invisibles
        this.createCollisionAreas();
        this.createInteractionArea();

        // Texto de diálogo
        this.dialogueText = this.add.text(96, 60, '', { 
            fontSize: '12px', 
            fill: '#fff',     
            stroke: '#000', // Agrega un contorno negro
            strokeThickness: 1 // Grosor del contorno
        }).setOrigin(0.5, 0);
        this.dialogueText.visible = false; // Ocultar por defecto
        this.isInInteractionArea = false; // Estado de interacción
    }

    update() {
        if(opening){
            this.background.play('openingDoor'); // Reproducir animación
            this.interactionArea2.text =""
            opening = false;
        }
        this.player.setVelocity(0);
        let isMoving = false;

        // Control de movimiento
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-playerSpeed);
            this.player.anims.play('walkLeft', true);
            isMoving = true;
        }
        if (this.cursors.right.isDown) {
            this.player.setVelocityX(playerSpeed);
            this.player.anims.play('walkRight', true);
            isMoving = true;
        }
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-playerSpeed);
            this.player.anims.play('walkUp', true);
            isMoving = true;
        }
        if (this.cursors.down.isDown) {
            this.player.setVelocityY(playerSpeed);
            this.player.anims.play('walkDown', true);
            isMoving = true;
        }

        // Detener animación si no se mueve
        if (!isMoving) {
            const velocityX = this.player.body.velocity.x;
            const velocityY = this.player.body.velocity.y;
            if (velocityX === 0 && velocityY === 0) {
                this.player.anims.stop();
            }
        }

        // Actualizar posición del texto de diálogo
        if (this.isInInteractionArea) {
            this.dialogueText.setPosition(this.player.x, this.player.y - 60); // Colocar texto sobre la cabeza
            //this.dialogueText.setText('Una estantería');
        } else {
            this.dialogueText.visible = false; // Ocultar texto si no está en el área de interacción
        }

        // Verificar si el jugador está en el área de interacción
        this.checkInteractionArea();
    }

    createCollisionAreas() {

        this.matter.add.rectangle(50, 90, 20, 60, {isStatic: true, angle: Phaser.Math.DegToRad(65), render: {isible: true}});
        this.matter.add.rectangle(89, 80, 20, 40, {isStatic: true, angle: Phaser.Math.DegToRad(30), render: {visible: true}});
        this.matter.add.rectangle(100, 84, 20, 40, {isStatic: true, angle: Phaser.Math.DegToRad(65), render: {visible: true}});
        this.matter.add.rectangle(140, 95, 10, 60, {isStatic: true, angle: Phaser.Math.DegToRad(-60), render: {visible: true}});
        this.matter.add.rectangle(65, 130, 10, 60, {isStatic: true, angle: Phaser.Math.DegToRad(-58), render: {visible: true}});
        this.matter.add.rectangle(128, 130, 10, 80, {isStatic: true,angle: Phaser.Math.DegToRad(65), render:{visible: true}});        

    }
    createInteractionArea() {
        // Crear un área de interacción que no impida el movimiento
        this.interactionArea = {
            x: 35,
            y: 90,
            width: 30,
            height: 10,
            text: "Una estantería"
        };

        this.interactionArea2 = {
            x: 130,
            y: 80,
            width: 30,
            height: 10,
            text: "¿Salir? (z)"
        }
    }

    checkInteractionArea() {
        const playerBounds = this.player.getBounds();
        var interactionArea = this.interactionArea;

        // Verificar si el jugador está dentro del área de interacción
        if (playerBounds.x < interactionArea.x + interactionArea.width &&
            playerBounds.x + playerBounds.width > interactionArea.x &&
            playerBounds.y < interactionArea.y + interactionArea.height &&
            playerBounds.y + playerBounds.height > interactionArea.y) {
            this.isInInteractionArea = true; // Establecer el estado a verdadero
            this.dialogueText.visible = true; // Mostrar texto de diálogo
            this.dialogueText.setText(this.interactionArea.text)
            return;
        } else {
            this.isInInteractionArea = false; // Establecer el estado a falso
            this.dialogueText.visible = false; // Ocultar texto de diálogo
        }
        

        if (opening) return;
        
        interactionArea = this.interactionArea2;

        // Verificar si el jugador está dentro del área de interacción
        if (playerBounds.x < interactionArea.x + interactionArea.width &&
            playerBounds.x + playerBounds.width > interactionArea.x &&
            playerBounds.y < interactionArea.y + interactionArea.height &&
            playerBounds.y + playerBounds.height > interactionArea.y) {
            this.isInInteractionArea = true; // Establecer el estado a verdadero
            this.dialogueText.visible = true; // Mostrar texto de diálogo
            this.dialogueText.setText(this.interactionArea2.text)

            if (this.isZPressed) { // 250 ms de duración
                opening = true;
            }

        } else {
            this.isInInteractionArea = false; // Establecer el estado a falso
            this.dialogueText.visible = false; // Ocultar texto de diálogo
        }
    }


    toggleDialogue() {
        // Alternar la visibilidad del diálogo
        if (this.isInInteractionArea) {
            this.dialogueText.visible = !this.dialogueText.visible;
        }
    }
}
var opening = false;

// Configuración del juego
const config = {
    type: Phaser.AUTO,
    width: 192,
    height: 144,
    scene: [MainScene],
    physics: {
        default: 'matter',  // Cambiado a 'matter'
        matter: {
            gravity: { y: 0 },
            debug: false // Puedes desactivar esto cuando no necesites ver la depuración
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    pixelArt: true,
    roundPixels: true,
};

const game = new Phaser.Game(config);
