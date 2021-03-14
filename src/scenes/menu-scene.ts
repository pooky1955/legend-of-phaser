import { getGameHeight, getGameWidth } from '../helpers';
import { MenuButton } from '../ui/button';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'MainMenu',
};

/**
 * The initial scene that starts, shows the splash screens, and loads the necessary assets.
 */
export class MainMenuScene extends Phaser.Scene {
    private backgroundPaths = ['CloudsBack', 'CloudsFront', 'BGBack', 'BGFront'];
    constructor() {
        super(sceneConfig);
    }

    public create(): void {
        this.createBGs();
        this.add
            .text(getGameWidth(this) / 2, getGameHeight(this) / 4, 'Welcome to the Legend of Phaser', {
                color: '#000000',
            })
            .setFontSize(50)
            .setOrigin(0.5, 0.5);
        this.add
            .text(getGameWidth(this) / 2, 4 * getGameHeight(this) / 5, 'Move with arrow keys\nHold the down arrow to roll\nStomp by holding the down arrow in midair\nWall Jump by moving towards the wall and jumping', {
                color: '#000000',
            })
            .setFontSize(28)
            .setOrigin(0.5, 0.5);

        new MenuButton(this, getGameWidth(this) / 2, getGameHeight(this) / 2, 'Start Game', () => {
                let audio = new Audio('assets/audio/song.mp3');
                audio.loop = true;
                // audio.muted = true;
                audio.play();

            this.scene.start('level1');
        }).setOrigin(0.5,0.5);

    }

    public createBGs() {
        this.backgroundPaths.forEach((imagePath) => {
            let i = 0;
            while (i <= getGameWidth(this)) {
                const img = this.add.image(0, 0, imagePath);
                img.setOrigin(0, 0);
                const scaleFactor = getGameHeight(this) / img.displayHeight;
                img.setScale(scaleFactor, scaleFactor);
                img.setX(i);
                i += img.displayWidth;
            }
        });
    }
}
