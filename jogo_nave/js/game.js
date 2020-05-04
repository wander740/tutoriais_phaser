
const config = {
    type: Phaser.WEBGL,
    width: 480,
    height: 640,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "black",
    zoom: 1,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0 ,y: 0 },
        //debug: true
      }
    },
    scene: [
      SceneMainMenu,
      SceneMain,
      SceneGameOver
    ]

};

window.game = new Phaser.Game(config);

