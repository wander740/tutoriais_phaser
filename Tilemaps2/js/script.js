import PlatformerScene from "./platformer.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    zoom: 1,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 1000 },
        //debug: true
      }
    },
    scene: PlatformerScene

};

window.game = new Phaser.Game(config);

