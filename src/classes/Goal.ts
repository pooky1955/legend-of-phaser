import { Level } from '../scenes/level';
import { Player } from './Player';

const getFrame = (path, index = 1) => {
    const paddedInt = index.toLocaleString('en-US', { minimumIntegerDigits: 3, useGrouping: false });
    return `${path}/${paddedInt}.png`;
};
export class Goal {
    private scene: Level;
    private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private done = false;
    constructor(scene: Level) {
        this.scene = scene;
    }
    spawn(x: number, y: number) {
        // this.scene.add.image(x,y,'goal',0).setScale(2,2)
        this.sprite = this.scene.physics.add.sprite(x, y - 10, 'goal', 0);
        // this.sprite.body.setAllowGravity(false)
        this.sprite.body.immovable = true;
        this.sprite.depth = 1000;
    }

    handleOverlapPlayer(player: Player) {
        const playerSprite = player.getSprite();
        this.scene.physics.add.overlap(this.getSprite(), playerSprite, () => {
            if (!this.done) {
                this.sprite.play('goalRised');
                setTimeout(() => {
                    Level.destroy(this.scene);
                    if (this.scene.last) {
                        this.scene.scene.start('winScene');
                    } else {
                        this.scene.scene.start(`level${this.scene.number + 1}`);
                    }
                }, 2500);
            }
            this.done = true;
        });
    }

    addPlatforms(platforms: Phaser.Tilemaps.TilemapLayer) {
        this.scene.physics.add.collider(this.sprite, platforms);
    }
    public static generateAnims(scene: Level) {
        const range = (n) => new Array(n).fill(0).map((_, i) => i);
        const generateFrames = (name, animCount) => {
            return range(animCount + 1).map((i) => ({ key: name, frame: `00${i}` }));
        };
        const frames = generateFrames('goal', 6);
        scene.anims.create({ frames: frames, frameRate: 5, key: 'goalRised' });
    }
    public getSprite(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
        return this.sprite;
    }
}
