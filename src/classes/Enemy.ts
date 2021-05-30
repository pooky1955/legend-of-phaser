import { Data } from 'phaser';
import { animsRate, defaultRate } from '../data/animsRate';
import { enemiesInfo } from '../data/enemiesComplete';
import { Player } from './Player';

const getFrame = (path, index = 1) => {
    const paddedInt = index.toLocaleString('en-US', { minimumIntegerDigits: 3, useGrouping: false });
    return `${path}/${paddedInt}.png`;
};

const getFrameNoPad = (path, index = 1) => {
    return `${path}/${index}.png`;
};

export class PlantEnemy {
    private scene: Phaser.Scene;
    private currAnim: string = enemiesInfo.Plant.Idle_.name;
    private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private balls: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[];
    private done = false;
    private player : Player;
    // private bullets :
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.balls = [];
    }
    spawn(x: number, y: number) {
        // this.scene.add.image(x,y,'goal',0).setScale(2,2)
        this.sprite = this.scene.physics.add.sprite(x, y - 10, 'enemies', getFrameNoPad(enemiesInfo.Plant.Idle_.name));
        this.sprite.body.immovable = true;
        this.sprite.depth = 1000;
        debugger;
        this.playAnim(enemiesInfo.Plant.Idle_.name);
        this.loopAttack();
    }

    public loopAttack() {
        this.attack();
        setTimeout(() => {
            this.loopAttack();
        }, 5000);
    }

    public playAnim(anim: string, overwrite = false) {
        this.currAnim = anim;
        const ignore = overwrite ? false : true;
        this.sprite.play(anim, ignore);
    }

    handleOverlapPlayer(player: Player) {
        const playerSprite = player.getSprite();
        this.player = player;
    }

    attack() {
        //alert("attacking lo")
        this.getSprite().play({ key: enemiesInfo.Plant.Attack_.name, repeat: 0 });
        setTimeout(() => {
            this.shootBall();
        }, 400);
        this.getSprite().playAfterRepeat(enemiesInfo.Plant.Idle_.name);
        //setTimeout(() => {
        //this.getSprite().play("Idle",true)
        //}, 800)
    }

    shootBall() {
        const ballSprite = this.scene.physics.add.sprite(
            this.getSprite().x - 40,
            this.getSprite().y,
            'enemies',
            enemiesInfo.Plant.Bullet.name,
        );
        this.scene.physics.add.overlap(ballSprite,this.player.getSprite(), () => {
            this.player.respawn()
        })
        ballSprite.setVelocityX(-200);
        ballSprite.body.setAllowGravity(false);
        ballSprite.setGravity(0, 0);
        ballSprite.setGravityY(0);
    }
    addPlatforms(platforms: Phaser.Tilemaps.TilemapLayer): void {
        this.scene.physics.add.collider(this.sprite, platforms);
    }
    public static generateAnims(scene: Phaser.Scene) {
        const range = (n) => new Array(n).fill(0).map((_, i) => i);
        const generateFrames = (animName: string, animCount: number, key = 'enemies') => {
            return range(animCount).map((i) => ({ key, frame: getFrameNoPad(animName, i) }));
        };
        Object.entries(enemiesInfo.Plant).forEach(([animName, data]) => {
            const { name, count: animCount, animated } = data;
            debugger;
            if (animated) {
                const fullAnimName = name;
                const rate = animName in animsRate ? animsRate[animName] : defaultRate;
                const frames = generateFrames(fullAnimName, animCount);
                const animObject = { frames: frames, frameRate: rate, key: name, repeat: -1 };
                console.log(animObject);
                scene.anims.create(animObject);
            }
        });
    }
    public getSprite(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
        return this.sprite;
    }
}
