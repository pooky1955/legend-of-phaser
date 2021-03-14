import { Level } from "../scenes/level";
import { Player } from "./Player";

const getFrame = (path, index = 1) => {
    const paddedInt = index.toLocaleString('en-US', { minimumIntegerDigits: 3, useGrouping: false });
    return `${path}/${paddedInt}.png`;
};
export class Spike {
    private scene : Level;
    private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private done : boolean = false;
    constructor(scene : Level){
        this.scene = scene
    } 
    spawn(x: number, y: number) {
        // this.scene.add.image(x,y,'goal',0).setScale(2,2)
        this.sprite = this.scene.physics.add.sprite(0,0, 'spike',0);
        this.sprite.setOrigin(0,1).setPosition(x,y)
        this.sprite.body.setAllowGravity(false)
        this.sprite.body.immovable = true
        this.sprite.depth = 1000
        this.sprite.play('spike')
    }


    handleOverlapPlayer(player : Player){
        const playerSprite = player.getSprite()
        this.scene.physics.add.overlap(this.sprite,playerSprite,()=>{
            this.scene.respawn()
            // DESTROY THE PLAYER!!!!!!!!!!!! MWHAHAHAAHAHH
        })
    }

    addPlatforms(platforms: Phaser.Tilemaps.TilemapLayer) {
        this.scene.physics.add.collider(this.sprite, platforms)
    }
    public static generateAnims(scene : Level) {
        const range = (n) => new Array(n).fill(0).map((_, i) => i);
        const generateFrames = (name,animCount) => {
            return range(animCount + 1).map((i) => ({ key : name, frame: `00${i}`}));
        };
        const frames = generateFrames("spike",4)
        scene.anims.create({frames : frames,frameRate : 5, key : "spike",repeat : -1})
    }

    public getSprite(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
        return this.sprite;
    }
}