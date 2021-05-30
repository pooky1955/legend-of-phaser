import { getGameHeight, getGameWidth } from '../helpers';
import { MenuButton } from '../ui/button';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'winScene',
};

/**
 * The initial scene that starts, shows the splash screens, and loads the necessary assets.
 */
export class WinScene extends Phaser.Scene {
    private backgroundPaths = ['CloudsBack', 'CloudsFront', 'BGBack', 'BGFront'];
    constructor() {
        super(sceneConfig);
    }

    public create(): void {
        performance.mark('run');
        const [start, end] = performance.getEntriesByName('run');
        const seconds = Math.round(end.startTime - start.startTime) / 1000;
        performance.clearMarks();
        this.createBGs();
        this.add
            .text(
                getGameWidth(this) / 2,
                getGameHeight(this) / 4,
                `Congratulations! You finished the game in ${seconds} seconds!`,
                {
                    color: '#000000',
                },
            )
            .setFontSize(50)
            .setOrigin(0.5, 0.5);

        new MenuButton(this, getGameWidth(this) / 2, getGameHeight(this) / 2, 'Replay Game', () => {
            performance.mark('run');
            this.scene.start('level1');
        }).setOrigin(0.5, 0.5);
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
