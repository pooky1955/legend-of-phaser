import * as Phaser from 'phaser';
import Scenes from './scenes';

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Sample',

    type: Phaser.AUTO,

    scene: Scenes,
    render: {
        pixelArt: true,
    },
    scale: {
        mode: Phaser.Scale.ScaleModes.FIT,
        width: window.innerWidth,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        height: window.innerHeight,
    },
    physics: {
        default: 'arcade',
        arcade: {
             //debug : true,
            gravity: { y: 600 },
        },
    },

    parent: 'content',
    backgroundColor: '#412134',
};

export const game = new Phaser.Game(gameConfig);

window.addEventListener('resize', () => {
    game.scale.refresh();
});
