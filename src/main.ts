import * as Phaser from 'phaser';
import Scenes from './scenes';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',

  type: Phaser.CANVAS,

  scale: {
    width : window.innerWidth,
    height : window.innerHeight
  },
  scene: Scenes,
  render: {
    pixelArt: true, 
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity : { y : 5}
    },
  },

  parent: 'game',
  backgroundColor: '#000000',
};

export const game = new Phaser.Game(gameConfig);

window.addEventListener('resize', () => {
  game.scale.refresh();
});
