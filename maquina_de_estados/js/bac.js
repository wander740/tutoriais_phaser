(function(){

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    pixelArt: true,
    zoom: 2,
    physics: {
      default: 'arcade'
    },
    scene: {
        preload() {
            this.load.spritesheet('hero', 'assets/hero.png', {
            frameWidth: 32,
            frameHeight: 32,
            });
            this.load.image('bg', 'assets/bg.png');
        },
        
        create() {
            this.keys = this.input.keyboard.createCursorKeys();
            // Static background
            this.add.image(200, 200, 'bg');
            
            // The movable character
            this.hero = this.physics.add.sprite(200, 150, 'hero', 0);
            this.hero.direction = 'down';
            this.hero.swinging = false;

            
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

        },
        
        update() {

            
            let moving = false;
            this.hero.setVelocity(0);
            
            /*
            if(this.keys.up.isDown){
                this.hero.setVelocityY(-100);
                this.hero.anims.play ('walk-up', true);
                moving = true;
            }else if(this.keys.down.isDown){
                this.hero.setVelocityY(100);
                this.hero.anims.play('walk-down', true);
                moving = true;
            }if (this.keys.left.isDown) {
                this.hero.setVelocityX(-100);
                this.hero.anims.play('walk-left', true);
                moving = true;
            } else if (this.keys.right.isDown) {
                this.hero.setVelocityX(100);
                this.hero.anims.play('walk-right', true);
                moving = true;
            }

            if (!moving){
                this.hero.anims.stop();
            }
            */ 

            if (!this.hero.swinging) {
                if (this.keys.space.isDown) {

                    this.hero.swinging = true;

                    this.hero.anims.play('swing-'+this.hero.direction, true);
                    this.hero.once('animationcomplete', () => {
                        this.hero.anims.play('walk-'+this.hero.direction, true);
                        this.hero.swinging = false;
                    });
                
                }else{

                    // Set new velocity based on input
                    if (this.keys.up.isDown) {
                        this.hero.setVelocityY(-100);
                        this.hero.direction = 'up';
                        moving = true;
                    } else if (this.keys.down.isDown) {
                        this.hero.setVelocityY(100);
                        this.hero.direction = 'down';
                        moving = true;
                    }
                    if (this.keys.left.isDown) {
                        this.hero.setVelocityX(-100);
                        this.hero.direction = 'left';
                        moving = true;
                    } else if (this.keys.right.isDown) {
                        this.hero.setVelocityX(100);
                        this.hero.direction = 'right';
                        moving = true;
                    }
                    
                    if (!moving) {
                        this.hero.anims.stop();
                    } else {
                        this.hero.anims.play('walk-'+this.hero.direction, true);
                    }
                }

            }
            

            
        },
    }

};

window.game = new Phaser.Game(config);      

}());