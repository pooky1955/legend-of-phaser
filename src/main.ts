import * as Phaser from 'phaser';
import Scenes from './scenes';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',

  type: Phaser.CANVAS,

  scene: Scenes,
  render: {
    pixelArt: true, 
  },
  scale : {
    mode : Phaser.Scale.ScaleModes.FIT,
    width : window.innerWidth,
    autoCenter : Phaser.Scale.CENTER_BOTH,
    height : window.innerHeight,
    zoom : 2
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity : { y : 400}
    },
  },

  parent: 'content',
  backgroundColor: '#000000',
};

export const game = new Phaser.Game(gameConfig);

window.addEventListener('resize', () => {
  game.scale.refresh();
});
