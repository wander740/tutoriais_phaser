(function(){
    
        class StateMachine {
        
            constructor(initialState, possibleStates, stateArgs=[]) {
                this.initialState = initialState;
                this.possibleStates = possibleStates;
                this.stateArgs = stateArgs;
                this.state = null;
            
                // State instances get access to the state machine via this.stateMachine.
                for (const state of Object.values(this.possibleStates)) {
                    state.stateMachine = this;
                }
            }
        
            step() {
                // On the first step, the state is null and we need to initialize the first state.
                if (this.state === null) {
                    this.state = this.initialState;
                    this.possibleStates[this.state].enter(...this.stateArgs);
                }
            
                // Run the current state's execute
                this.possibleStates[this.state].execute(...this.stateArgs);
            }
            
            transition(newState, ...enterArgs) {
                this.state = newState;
                this.possibleStates[this.state].enter(...this.stateArgs, ...enterArgs);
            }
        
        }
        
        class State {
            enter() {
        
            }
        
            execute() {
        
            }

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
            //gravity: { y: 0 },
            debug: true
          }
        },
        scene: {
            preload() {
                this.load.spritesheet('hero', 'assets/hero.png', {
                frameWidth: 32,
                frameHeight: 32,
                });
                this.load.image('bg', 'assets/bg.png');

                this.load.image('star','assets/star.png');

                this.load.image('coli','assets/Piskel.png');
            },
            
            create() {
                
                this.coli = this.physics.add.group();

                this.keys = this.input.keyboard.createCursorKeys();
                // Static background

                var bac = this.add.sprite(400, 300, 'bg');

                this.stars = this.physics.add.sprite(110, 300, 'star');
                
                // The movable character
                this.hero = this.physics.add.sprite(110, 150, 'hero');
                //aument a caixa de colisão e acoloca ela no ponto (100,200)
                //this.hero.body.setSize(100, 32, 0, 0).setOffset(100, 200);
                this.hero.direction = 'down';

                this.stateMachine = new StateMachine('idle',{
                    idle: new idlState(),
                    move: new MoveState(),
                    swing: new SwingState(),
                    dash: new DashState(),
                }, [this,this.hero]);

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


                this.hero.setCollideWorldBounds(true);

                this.physics.add.overlap(this.coli, this.stars, function(player, enemy) {
                    player.destroy();
                    enemy.destroy();
                });

            },
            
            update() {
                this.stateMachine.step();         
            },
        }

    };
      
    class idlState extends State{

        enter(scenes, hero){
            hero.setVelocity(0);
            hero.anims.play('walk-'+hero.direction);
            hero.anims.stop();
        }

        execute(scenes, hero){
            scenes.coli.clear(true,true);
            const {left, right, up, down, space, shift} = scenes.keys;
        
            if (space.isDown) {
                this.stateMachine.transition('swing');
                return;
            }
                
            if (shift.isDown) {
                this.stateMachine.transition('dash');
                return;
            }

            // Transition to move if pressing a movement key
            if (left.isDown || right.isDown || up.isDown || down.isDown) {
                this.stateMachine.transition('move');
                return;
            }

        }
    }

    class MoveState extends State{
        execute(scenes, hero) {
            const {left, right, up, down, space, shift} = scenes.keys;

            // Transition to swing if pressing space
            if (space.isDown) {
                this.stateMachine.transition('swing');
                return;
            }

            if (shift.isDown) {
                this.stateMachine.transition('dash');
                return;
            }

            // Transition to idle if not pressing movement keys
            if (!(left.isDown || right.isDown || up.isDown || down.isDown)) {
                this.stateMachine.transition('idle');
                return;
            }

            hero.setVelocity(0);
            if (up.isDown) {
                hero.setVelocityY(-100);
                hero.direction = 'up';
            } else if (down.isDown) {
                hero.setVelocityY(100);
                hero.direction = 'down';
            }
            if (left.isDown) {
                hero.setVelocityX(-100);
                hero.direction = 'left';
            } else if (right.isDown) {
                hero.setVelocityX(100);
                hero.direction = 'right';
            }

            hero.anims.play('walk-'+hero.direction, true);
        }
    }

    class SwingState extends State {

        enter(scenes, hero) {
            hero.setVelocity(0);
            hero.anims.play('swing-'+hero.direction);

            var pos = 11;
            var colis = null;
            if(hero.direction == 'up'){
                colis = scenes.physics.add.sprite(hero.x,hero.y-pos,'coli');
                colis.displayHeight = 10;
            }else if(hero.direction == 'down'){
                colis = scenes.physics.add.sprite(hero.x,hero.y+pos,'coli');
                colis.displayHeight = 10;
            }else if(hero.direction == 'left'){
                colis = scenes.physics.add.sprite(hero.x-pos,hero.y,'coli');
                colis.displayWidth = 10;
            }else{
                colis = scenes.physics.add.sprite(hero.x+pos,hero.y,'coli');
                colis.displayWidth = 10;
            }
            
            scenes.coli.add(colis);
            
            hero.once('animationcomplete', () => {
                this.stateMachine.transition('idle');
            });

            
        }

    }

    class DashState extends State {
        enter(scenes, hero) {
            hero.setVelocity(0);
            hero.anims.play('walk-'+hero.direction);
            switch (hero.direction){
                case 'up':
                    hero.setVelocityY(-300);
                    break;
                case 'down':
                    hero.setVelocityY(300);
                    break;
                case 'left':
                    hero.setVelocityX(-300);
                    break;
                case 'right':
                    hero.setVelocityX(300);
                    break;
            }

            scenes.time.delayedCall(300, () => {
                this.stateMachine.transition('idle');
            });
        }
    }
    
    window.game = new Phaser.Game(config);      
    
}());