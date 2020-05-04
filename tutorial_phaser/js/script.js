(function(){
    
    class stateMachine {
        constructor(initialState, possibleStates, stateArgs=[]) {
            this.initialState = initialState;
            this.possibleStates = possibleStates;
            this. stateArgs = stateArgs;
            this.state = null;

            for (const state of Object.values(this.possibleStates)) {
                state.stateMachine = this;
            }
        }

        step() {
            if(this.state === null) {
                this.state = this.initialState;
                this.possibleStates[this.state].execute(...this.stateArgs);
            }
            this.possibleStates[this.state].execute(...this.stateArgs);
        }

        transition(newState, ...enterArgs) {
            
            this.state = newState;
            this.possibleStates[this.state].enter(...this.stateArgs, ...enterArgs);
               
        }
    }

    class State {
        enter() {}
        execute() {}
    }

    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        pixelArt: true,
        zoom: 1,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 300 },
            //debug: true
          }
        },
        scene: {
            preload(){
                this.load.spritesheet('hero','assets/dude.png',{
                    frameWidth: 32, frameHeight:48,
                });
                this.load.image('sky','assets/sky.png');
                this.load.image('platform','assets/platform.png');
                this.load.tilemapTiledJSON('map','assets/plat.json');
            },       
            create(){
                this.gameOver=false;
                this.keys = this.input.keyboard.createCursorKeys();

                const map = this.make.tilemap({ key: 'map' });
                const tileset1 = map.addTilesetImage('fundo','sky');
                const tileset2 = map.addTilesetImage('plat','platform');

                const world1 = map.createStaticLayer("c1",tileset1,0,0);
                const world2 = map.createStaticLayer("c2",tileset2,0,0);

                world2.setCollisionByProperty({ collides: "true" });

                /*
                const debugGraphics = this.add.graphics().setAlpha(0.75);
                world2.renderDebug(debugGraphics, {
                tileColor: null, // Color of non-colliding tiles
                collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
                faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
                });*/

                const spaw = map.findObject('person',obj => obj.name === 'resp');
                this.hero = this.physics.add.sprite(spaw.x,spaw.y,'hero',4);
                this.hero.body.setGravityY(300);
                this.hero.setBounce(0.2);
                this.hero.direction = 'up-turn'

                this.stateMachine = new stateMachine('idle',{
                    idle: new idlState(),
                    move: new moveState(),
                    junping: new junpingState(), 
                },[this,this.hero]);

                this.anims.create({
                    key: 'left',
                    frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
                    frameRate: 10,
                    repeat: -1
                });
                
                this.anims.create({
                    key: 'up-turn',
                    frames: [ { key: 'hero', frame: 4 } ],
                    frameRate: 20
                });
                
                this.anims.create({
                    key: 'right',
                    frames: this.anims.generateFrameNumbers('hero', { start: 5, end: 8 }),
                    frameRate: 10,
                    repeat: -1
                });

                this.anims.create({
                    key: 'up-right',
                    frames: [ { key: 'hero', frame: 6 } ],
                    frameRate: 20
                });

                this.anims.create({
                    key: 'up-left',
                    frames: [ { key: 'hero', frame: 1 } ],
                    frameRate: 20
                });

                this.hero.setCollideWorldBounds(true);
                this.physics.add.collider(this.hero,world2);
            },
            update(){
                if (this.gameOver){
                    return;
                }
                console.log(this.hero.body.blocked.down+" "+this.hero.body.touching.down);
                this.stateMachine.step();
            },
        }

    };

    window.game = new Phaser.Game(config);      

    
        
        
        /*
        if(hero.body.blocked.down){
            if (keys.left.isDown){
                hero.setVelocityX(-160);

                hero.anims.play('left', true);
                hero.direction = 'left';
            }else if (keys.right.isDown){
                hero.setVelocityX(160);

                hero.anims.play('right', true);
                hero.direction = 'right';
            }else {
                hero.setVelocityX(0);

                hero.anims.play('up-turn');
                hero.direction = 'turn';
            }
            if (keys.up.isDown ){
                hero.setVelocityY(-360);
            }
        }else{
            hero.anims.play('up-'+hero.direction,true);
        }
        */

    

    class idlState extends State{
        enter(scenes,hero){
            hero.setVelocityX(0);
            hero.direction = 'turn';
            hero.anims.play('up-turn');
            hero.anims.stop();
        }
        execute(scenes,hero){
            const {left, right, up} = scenes.keys;

            if(up.isDown){
                this.stateMachine.transition('junping');
                return;
            }

            if(left.isDown || right.isDown){
                this.stateMachine.transition('move');
                return;
            }
        }
    }
    
    class moveState extends State{
        execute(scenes,hero){
            const {left, right, up} = scenes.keys;

            if(up.isDown){
                
                this.stateMachine.transition('junping');
                return;
            }

            if(!(left.isDown || right.isDown)){
                this.stateMachine.transition('idle');
                return;
            }

            //hero.setVelocity(0);
            if (left.isDown){
                hero.setVelocityX(-160);
                hero.direction = 'left';
            }else if (right.isDown){
                hero.setVelocityX(160);
                hero.direction = 'right';
            }

            hero.anims.play(hero.direction, true);
            
        }
    }

    class junpingState extends State{
        enter(scenes,hero){
            if(hero.body.blocked.down){
                hero.setVelocityY(-360);
                hero.anims.play('up-'+hero.direction,true);
            }
        }
        execute(scenes,hero){
            
            if(hero.body.blocked.down){
                const {left, right, up} = scenes.keys;
                if(up.isDown){
                    this.stateMachine.transition('junping');
                    return;
                }
    
                if(left.isDown || right.isDown){
                    this.stateMachine.transition('move');
                    return;
                }
                this.stateMachine.transition('idle');
            }else{
                hero.anims.play('up-'+hero.direction,true);
            }
        }
    }
}());