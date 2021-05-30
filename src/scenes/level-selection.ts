
import { getGameHeight, getGameWidth } from '../helpers';
import { MenuButton } from '../ui/button';
import {maxLevel} from './level';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'level_selection',
};

/**
 * The initial scene that starts, shows the splash screens, and loads the necessary assets.
 */
export class LevelSelectionScene extends Phaser.Scene {
    private backgroundPaths = ['CloudsBack', 'CloudsFront', 'BGBack', 'BGFront'];
    constructor() {
        super(sceneConfig);
    }

    public create(): void {
        this.createBGs();
        for (let i = 0 ; i < maxLevel; i++){
            const levelNumber = i+1;
            new MenuButton(this,getGameWidth(this) /2 , getGameHeight(this) * 0.1 + i / (maxLevel + 5) * getGameHeight(this),`Level ${levelNumber}`,() => {
                this.scene.start(`level${levelNumber}`)
            }).setOrigin(0.5,0.5)
        }
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
