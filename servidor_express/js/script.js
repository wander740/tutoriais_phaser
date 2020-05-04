var config = {
	type: Phaser.AUTO,
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
        update: update
    }
};

var game = new Phaser.Game(config);

function preload(){
    //this.load.tilemapTiledJSON('map', 'assets/map/example_map.json');
    //this.load.image('tileset', 'assets/map/tilesheet.png');
    this.load.image('bg', 'assets/map/bg.png');
    this.load.spritesheet('hero', 'assets/sprites/hero.png', {
        frameWidth: 32,
        frameHeight: 32,
    });
}
    
function create(){
    var self = this;
    this.socket = io();

    this.add.image(400, 300, 'bg');
    this.keys = this.input.keyboard.createCursorKeys();

    this.otherPlayers = this.physics.add.group();
    this.pos = {};

    /*
    var map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tilesheet', 'tileset'); 

    map.createStaticLayer("ground", tileset, 0, 0);
    map.createStaticLayer("groundvariations", tileset, 0, 0);
    map.createStaticLayer("mud", tileset, 0, 0);
    map.createStaticLayer("grass", tileset, 0, 0);
    map.createStaticLayer("stone", tileset, 0, 0);
    map.createStaticLayer("grassvariations", tileset, 0, 0);
    map.createStaticLayer("river", tileset, 0, 0);
    map.createStaticLayer("Houses", tileset, 0, 0);
    map.createStaticLayer("camps", tileset, 0, 0);
    map.createStaticLayer("Trees2", tileset, 0, 0);
    map.createStaticLayer("Bridge", tileset, 0, 0);
    */
    this.socket.on('currentPlayers',function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            } else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

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

    this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                //otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                otherPlayer.anims.play ('walk-'+playerInfo.dire, true);
                self.pos[playerInfo.playerId] = playerInfo.dire;
                //console.log('a '+otherPlayer.x+' b '+playerInfo.x);
                //mov(otherPlayer,playerInfo);
            }
            otherPlayer.anims.stop();
        });
    });
    
    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });

}

function mov(otherPlayer,playerInfo){
    if(otherPlayer.x !== playerInfo.x){
        console.log('a '+otherPlayer.x+' b '+playerInfo.x);
        while(otherPlayer.x !== playerInfo.x){
            console.log('a '+otherPlayer.x+' b '+playerInfo.x);
            if(playerInfo.dire == 'left'){
                otherPlayer.setVelocityX(-100);
                otherPlayer.anims.play ('walk-left', true);
            }else{
                otherPlayer.setVelocityX(100);
                otherPlayer.anims.play ('walk-right', true);
            }
        }
        
    }
    if(otherPlayer.y !== playerInfo.y){
        while(otherPlayer.y !== playerInfo.y){
            console.log('a '+otherPlayer.x+' b '+playerInfo.x);
            if(playerInfo.dire == 'up'){
                otherPlayer.setVelocityY(-100);
                otherPlayer.anims.play ('walk-up', true);
            }else{
                otherPlayer.setVelocityY(100);
                otherPlayer.anims.play ('walk-down', true);
            }
        }
    }
    otherPlayer.setVelocity(0);
    this.ship.anims.stop();
}

function update(){
    let moving = false;
    
    if(this.ship) {
        if(this.keys.up.isDown){
            this.ship.setVelocityY(-100);
            this.ship.anims.play ('walk-up', true);

            this.pos[this.socket.id] = 'up';
            moving = true;
        }else if(this.keys.down.isDown){
            this.ship.setVelocityY(100);
            this.ship.anims.play ('walk-down', true);

            this.pos[this.socket.id] = 'down';
            moving = true;
        }else if (this.keys.left.isDown) {
            this.ship.setVelocityX(-100);
            this.ship.anims.play ('walk-left', true);

            this.pos[this.socket.id] = 'left';
            moving = true;
        } else if (this.keys.right.isDown) {
            this.ship.setVelocityX(100);
            this.ship.anims.play ('walk-right', true);

            this.pos[this.socket.id] = 'right';
            moving = true;
        }else{
            this.ship.setVelocity(0);
        }

        if (!moving){
            this.ship.anims.stop();
        }

        this.physics.world.wrap(this.ship, 5);

        var x = this.ship.x;
        var y = this.ship.y;
        var d = this.pos[this.socket.id];
        if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y)) {
            this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y,dire: d});
        }
        
        // save old position data
        this.ship.oldPosition = {
            x: this.ship.x,
            y: this.ship.y,
            //dire: this.ship.dire
        };
    }
}

function addPlayer(self, playerInfo) {
    self.ship = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'hero',0);//.setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    self.pos[playerInfo.playerId] = playerInfo.dire;
    /*
    if (playerInfo.team === 'blue') {
        self.ship.setTint(0x0000ff);
    } else {
        self.ship.setTint(0xff0000);
    }*/
    self.ship.setDrag(100);
    //self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'hero',0);//.setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    self.pos[playerInfo.playerId] = playerInfo.dire;

    otherPlayer.setTint(0x0000ff);
    /*
    if (playerInfo.team === 'blue') {
      otherPlayer.setTint(0x0000ff);
    } else {
      otherPlayer.setTint(0xff0000);
    }
    */
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}