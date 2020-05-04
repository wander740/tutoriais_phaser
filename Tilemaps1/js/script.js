(function(){
    
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        pixelArt: true,
        zoom: 1,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            //debug: true
          }
        },
        scene: {
            preload: preload,        
            create: create,
            update: update
        }

    };
      
    var hero;
    var keys;

    window.game = new Phaser.Game(config);      

    function preload() {
        this.load.spritesheet('hero', 'assets/hero.png', {
          frameWidth: 32,
          frameHeight: 32,
        });
        this.load.image("tiles", "assets/tuxmon-sample-32px-extruded.png");
        this.load.tilemapTiledJSON("map", "assets/tuxemon-town.json");
      }
      
      function create() {
        keys = this.input.keyboard.createCursorKeys();
            
        const map = this.make.tilemap({ key: "map" });
      
        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");
      
        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
        //const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);
        

        worldLayer.setCollisionByProperty({ collides: "true" });
        
        /*
        const debugGraphics = this.add.graphics().setAlpha(0.75);
        worldLayer.renderDebug(debugGraphics, {
          tileColor: null, // Color of non-colliding tiles
          collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
          faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });*/

        const spaw = map.findObject("Objects",obj => obj.name === "Spaw");
        hero = this.physics.add.sprite(spaw.x, spaw.y, 'hero', 0);
        hero.direction = 'down';
        hero.swinging = false;

        
        this.anims.create({
            key: 'walk-down',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('hero', {start: 0, end: 3}),
        });

        this.anims.create({
            key: 'walk-right',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('hero', {start: 4, end: 7}),
        });

        this.anims.create({
            key: 'walk-up',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('hero', {start: 8, end: 11}),
        });

        this.anims.create({
            key: 'walk-left',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('hero', {start: 12, end: 15}),
        });

        this.anims.create({
            key: 'swing-down',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('hero', {start: 16, end: 19}),
        });

        this.anims.create({
            key: 'swing-up',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('hero', {start: 20, end: 23}),
        });

        this.anims.create({
            key: 'swing-right',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('hero', {start: 24, end: 27}),
        });

        this.anims.create({
            key: 'swing-left',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('hero', {start: 28, end: 31}),
        });

        this.physics.add.collider(hero, worldLayer);
      }
      

    function update() {
      
      let moving = false;
      hero.setVelocity(0);   

      if (!hero.swinging) {
        if (keys.space.isDown) {

            hero.swinging = true;

            hero.anims.play('swing-'+hero.direction, true);
            hero.once('animationcomplete', () => {
                hero.anims.play('walk-'+hero.direction, true);
                hero.swinging = false;
            });
        
        }else{

            // Set new velocity based on input
            if (keys.up.isDown) {
                hero.setVelocityY(-100);
                hero.direction = 'up';
                moving = true;
            } else if (keys.down.isDown) {
                hero.setVelocityY(100);
                hero.direction = 'down';
                moving = true;
            }
            if (keys.left.isDown) {
                hero.setVelocityX(-100);
                hero.direction = 'left';
                moving = true;
            } else if (keys.right.isDown) {
                hero.setVelocityX(100);
                hero.direction = 'right';
                moving = true;
            }
            
            if (!moving) {
                hero.anims.stop();
            } else {
                hero.anims.play('walk-'+hero.direction, true);
            }
        }

      }

    }

}());