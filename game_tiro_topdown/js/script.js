var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    pixelArt: true,
    zoom: 1,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
                    move: null,
                    gun: null,
                    healthpoints: null,
                    reticle: null,
                    moveKeys: null,
                    playerBullets: null,
                    enemyBullets: null,
                    time: 0,
                }
    }
};

var game = new Phaser.Game(config);

var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    // Bullet Constructor
    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.setSize(12, 12, true);
    },

    // Fires a bullet from the player to the reticle
    fire: function (shooter, target)
    {
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y)
        {
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }
        else
        {
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    },

    // Updates the position of the bullet each cycle
    update: function (time, delta)
    {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});

function preload ()
{
    // Load in images and sprites
    //this.load.spritesheet('player_handgun', 'assets/player_handgun.png',{ frameWidth: 66, frameHeight: 60 }); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
    
    this.load.spritesheet('player_handgun', 'assets/p1/p1.png',{
        frameWidth: 19,
        frameHeight: 24
    });

    this.load.spritesheet('h1', 'assets/pistol/p_diagdown.png',{
        frameWidth: 8,
        frameHeight: 10
    });

    this.load.spritesheet('h2', 'assets/pistol/p_diagup.png',{
        frameWidth: 8,
        frameHeight: 10
    });

    this.load.spritesheet('h3', 'assets/pistol/p_down.png',{
        frameWidth: 8,
        frameHeight: 10
    });

    this.load.spritesheet('h4', 'assets/pistol/p_side.png',{
        frameWidth: 8,
        frameHeight: 10
    });

    this.load.spritesheet('h5', 'assets/pistol/p_up.png',{
        frameWidth: 8,
        frameHeight: 10
    });

    this.load.image('bullet', 'assets/bullet6.png');
    this.load.image('target', 'assets/3crosshair.png');
    this.load.image('background', 'assets/underwater1.png');
}

function create ()
{
    // Set world bounds
    this.physics.world.setBounds(0, 0, 1600, 1200);

    // Add 2 groups for Bullet objects
    playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    // Add background player, enemy, reticle, healthpoint sprites
    var background = this.add.image(800, 600, 'background');
    
    move = false;
    player = this.physics.add.sprite(800, 600, 'player_handgun',4);
    enemy = this.physics.add.sprite(300, 600, 'player_handgun');
    

    reticle = this.physics.add.sprite(800, 700, 'target');
    hp1 = this.add.image(-350, -250, 'target').setScrollFactor(0);
    hp2 = this.add.image(-300, -250, 'target').setScrollFactor(0);
    hp3 = this.add.image(-250, -250, 'target').setScrollFactor(0);

    // Set image/sprite properties
    background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200);
    player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true).setDrag(500, 500);
    enemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true);
    reticle.setOrigin(0.5, 0.5).setDisplaySize(45, 45).setCollideWorldBounds(true);
    hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
    hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);

    this.anims.create({
        key: 'walk-down',
        frameRate: 8,
        repeat: -1,
        frames: this.anims.generateFrameNumbers('player_handgun', {start: 4, end: 7}),
    });

    this.anims.create({
        key: 'walk-right',
        frameRate: 8,
        repeat: -1,
        frames: this.anims.generateFrameNumbers('player_handgun', {start: 8, end: 11}),
    });

    this.anims.create({
        key: 'walk-up',
        frameRate: 8,
        repeat: -1,
        frames: this.anims.generateFrameNumbers('player_handgun', {start: 12, end: 15}),
    });

    this.anims.create({
        key: 'walk-diag-up',
        frameRate: 8,
        repeat: -1,
        frames: this.anims.generateFrameNumbers('player_handgun', {start: 16, end: 19}),
    });

    this.anims.create({
        key: 'walk-diag-down',
        frameRate: 8,
        repeat: -1,
        frames: this.anims.generateFrameNumbers('player_handgun', {start: 20, end: 23}),
    });

    // Set sprite variables
    player.health = 3;
    enemy.health = 3;
    enemy.lastFired = 0;

    // Set camera properties
    this.cameras.main.zoom = 0.5;
    this.cameras.main.startFollow(player);

    // Creates object for input with WASD kets
    moveKeys = this.input.keyboard.addKeys({
        'up': Phaser.Input.Keyboard.KeyCodes.W,
        'down': Phaser.Input.Keyboard.KeyCodes.S,
        'left': Phaser.Input.Keyboard.KeyCodes.A,
        'right': Phaser.Input.Keyboard.KeyCodes.D
    });

    // Enables movement of player with WASD keys
    this.input.keyboard.on('keydown_W', function (event) {
        move = true;
        player.setAccelerationY(-800);
    });
    this.input.keyboard.on('keydown_S', function (event) {
        move = true;
        player.setAccelerationY(800);
    });
    this.input.keyboard.on('keydown_A', function (event) {
        move = true;
        player.setAccelerationX(-800);
    });
    this.input.keyboard.on('keydown_D', function (event) {
        move = true;
        player.setAccelerationX(800);
    });

    // Stops player acceleration on uppress of WASD keys
    this.input.keyboard.on('keyup_W', function (event) {
        if (moveKeys['down'].isUp)
        {
            move = false;
            player.setAccelerationY(0);
        }
    });
    this.input.keyboard.on('keyup_S', function (event) {
        if (moveKeys['up'].isUp)
        {
            move = false;
            player.setAccelerationY(0);
        }
    });
    this.input.keyboard.on('keyup_A', function (event) {
        if (moveKeys['right'].isUp)
        {
            move = false;
            player.setAccelerationX(0);
        }
    });
    this.input.keyboard.on('keyup_D', function (event) {
        if (moveKeys['left'].isUp)
        {
            move = false;
            player.setAccelerationX(0);
        }
    });

    // Fires bullet from player on left click of mouse
    this.input.on('pointerdown', function (pointer, time, lastFired) {
        if (player.active === false)
            return;

        // Get bullet from bullets group
        var bullet = playerBullets.get().setActive(true).setVisible(true);

        if (bullet)
        {
            bullet.fire(player, reticle);
            this.physics.add.collider(enemy, bullet, enemyHitCallback);
        }
    }, this);

    // Pointer lock will only work after mousedown
    game.canvas.addEventListener('mousedown', function () {
        game.input.mouse.requestPointerLock();
    });

    // Exit pointer lock when Q or escape (by default) is pressed.
    this.input.keyboard.on('keydown_Q', function (event) {
        if (game.input.mouse.locked)
            game.input.mouse.releasePointerLock();
    }, 0, this);

    // Move reticle upon locked pointer move
    this.input.on('pointermove', function (pointer) {
        if (this.input.mouse.locked)
        {
            reticle.x += pointer.movementX;
            reticle.y += pointer.movementY;
        }
    }, this);

}

function enemyHitCallback(enemyHit, bulletHit)
{
    // Reduce health of enemy
    if (bulletHit.active === true && enemyHit.active === true)
    {
        enemyHit.health = enemyHit.health - 1;
        console.log("Enemy hp: ", enemyHit.health);

        // Kill enemy if health <= 0
        if (enemyHit.health <= 0)
        {
           enemyHit.setActive(false).setVisible(false);
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false);
    }
}

function playerHitCallback(playerHit, bulletHit)
{
    // Reduce health of player
    if (bulletHit.active === true && playerHit.active === true)
    {
        playerHit.health = playerHit.health - 1;
        console.log("Player hp: ", playerHit.health);

        // Kill hp sprites and kill player if health <= 0
        if (playerHit.health == 2)
        {
            console.log("h3");
            hp3.destroy();
        }
        else if (playerHit.health == 1)
        {
            console.log("h2");
            hp2.destroy();
        }
        else
        {
            console.log("h1");
            hp1.destroy();
            // Game over state should execute here
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false);
    }
}

function enemyFire(enemy, player, time, gameObject)
{
    if (enemy.active === false)
    {
        return;
    }

    if ((time - enemy.lastFired) > 1000)
    {
        enemy.lastFired = time;

        // Get bullet from bullets group
        var bullet = enemyBullets.get().setActive(true).setVisible(true);

        if (bullet)
        {
            bullet.fire(enemy, player);
            // Add collider between bullet and player
            gameObject.physics.add.collider(player, bullet, playerHitCallback);
        }
    }
}

// Ensures sprite speed doesnt exceed maxVelocity while update is called
function constrainVelocity(sprite, maxVelocity)
{
    if (!sprite || !sprite.body)
      return;

    var angle, currVelocitySqr, vx, vy;
    vx = sprite.body.velocity.x;
    vy = sprite.body.velocity.y;
    currVelocitySqr = vx * vx + vy * vy;

    if (currVelocitySqr > maxVelocity * maxVelocity)
    {
        angle = Math.atan2(vy, vx);
        vx = Math.cos(angle) * maxVelocity;
        vy = Math.sin(angle) * maxVelocity;
        sprite.body.velocity.x = vx;
        sprite.body.velocity.y = vy;
    }
}

// Ensures reticle does not move offscreen
function constrainReticle(reticle)
{
    var distX = reticle.x-player.x; // X distance between player & reticle
    var distY = reticle.y-player.y; // Y distance between player & reticle

    // Ensures reticle cannot be moved offscreen (player follow)
    if (distX > 800)
        reticle.x = player.x+800;
    else if (distX < -800)
        reticle.x = player.x-800;

    if (distY > 600)
        reticle.y = player.y+600;
    else if (distY < -600)
        reticle.y = player.y-600;
}

function playerRota(player,reticle)
{
    //console.log(reticle.x+" "+player.x);
    if(reticle.y >= player.y){
        if(Math.abs(reticle.x-player.x) <= 170){
            player.anims.play("walk-down", true);
        }else{
            if(reticle.x>player.x){
                player.setFlipX(false);
            }else{
                player.setFlipX(true);
            }

            if(Math.abs(reticle.y-player.y) <= 100){
                player.anims.play("walk-right", true);
            }else{
                player.anims.play("walk-diag-down", true);
            }
        }
    }else{
        if(Math.abs(reticle.x-player.x) <= 170){
            player.anims.play("walk-up", true);
        }else{
            if(reticle.x>player.x){
                player.setFlipX(false);
            }else{
                player.setFlipX(true);
            }
            
            if(Math.abs(reticle.y-player.y) <= 100){
                player.anims.play("walk-right", true);
            }else{
                player.anims.play("walk-diag-up", true);
            }
        }
    }

}

function update (time, delta)
{
    if (move) playerRota(player,reticle);
    // Rotates player to face towards reticle
    //player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

    // Rotates enemy to face towards player
    //enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);

    //Make reticle move with player
    reticle.body.velocity.x = player.body.velocity.x;
    reticle.body.velocity.y = player.body.velocity.y;

    // Constrain velocity of player
    constrainVelocity(player, 100);

    // Constrain position of constrainReticle
    constrainReticle(reticle);

    // Make enemy fire
    //enemyFire(enemy, player, time, this);
}