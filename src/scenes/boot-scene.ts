import { getGameWidth, getGameHeight } from '../helpers';
import { maxLevel, range } from './level';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'Boot',
};

/**
 * The initial scene that loads all necessary assets to the game and displays a loading bar.
 */
export class BootScene extends Phaser.Scene {
    private backgroundPaths = ['CloudsBack', 'CloudsFront', 'BGBack', 'BGFront'];
    constructor() {
        super(sceneConfig);
    }

    public preload(): void {
        const halfWidth = getGameWidth(this) * 0.5;
        const halfHeight = getGameHeight(this) * 0.5;

        const progressBarHeight = 50;
        const progressBarWidth = 400;

        const progressBarContainer = this.add.rectangle(
            halfWidth,
            halfHeight,
            progressBarWidth,
            progressBarHeight,
            // 0x000000,
        );
        const progressBar = this.add.rectangle(
            halfWidth + 20 - progressBarContainer.width * 0.5,
            halfHeight,
            10,
            progressBarHeight - 20,
            0x4dd419,
        );

        const loadingText = this.add
            .text(halfWidth, halfHeight - 100, 'Loading...')
            .setFontSize(24)
            .setOrigin(0.5, 0.5);
        const percentText = this.add
            .text(halfWidth, halfHeight - 50, '0%')
            .setFontSize(24)
            .setOrigin(0.5, 0.5);
        const assetText = this.add
            .text(halfWidth, halfHeight + 100, '')
            .setFontSize(24)
            .setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            progressBar.width = (progressBarWidth - 30) * value;

            const percent = Math.round(value * 100);
            percentText.setText(`${percent}%`);
        });

        this.load.on('fileprogress', (file) => {
            assetText.setText(file.key);
        });

        this.load.on('complete', () => {
            setTimeout(() => {
                loadingText.destroy();
                percentText.destroy();
                assetText.destroy();
                progressBar.destroy();
                progressBarContainer.destroy();

                this.scene.start('MainMenu');
            }, 1000);
        });
        this.loadAssets();
    }

    /**
     * All assets that need to be loaded by the game (sprites, images, animations, tiles, music, etc)
     * should be added to this method. Once loaded in, the loader will keep track of them, indepedent of which scene
     * is currently active, so they can be accessed anywhere.
     */
    private loadAssets() {
        const loadAsset = (file: string) => this.load.image(file, `assets/maps/${file}.png`);
        this.load.image('base_tiles', 'assets/maps/Tileset_extruded.png');
        this.backgroundPaths.forEach(loadAsset);
        this.load.multiatlas('character', 'assets/sprites/character.json');
        this.load.multiatlas('enemies', 'assets/sprites/enemies.json');
        this.load.atlas('goal', 'assets/sprites/goal.png', 'assets/sprites/goal.json');
        this.load.atlas('spike', 'assets/sprites/spike.png', 'assets/sprites/spike.json');
        range(maxLevel).forEach((number) => {
            const levelName = `level${number+1}`;
            this.load.tilemapTiledJSON(levelName, `assets/maps/${levelName}.json`);
        });
    }
}
