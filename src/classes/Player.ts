import { charMapping } from '../data/charFrames';
import { charAnims } from '../data/charAnims';
import { animsCount } from '../data/animsCount';
import { log } from '../helpers';

const getFrame = (path, index = 1) => {
    const paddedInt = index.toLocaleString('en-US', { minimumIntegerDigits: 3, useGrouping: false });
    return `${path}/${paddedInt}.png`;
};

enum PLAYER_STATE {
    Standing,
    Walling,
    Crouching,
}
const sizes = {
    [PLAYER_STATE.Standing]: [
        [
            [26, 36],
            [15, 28],
        ],
        [
            [26, 36],
            [23, 28],
        ],
    ],
    [PLAYER_STATE.Crouching]: [
        [
            [26, 36 - 18],
            [15, 28 + 18],
        ],
        [
            [26, 36 - 18],
            [23, 28 + 18],
        ],
    ],
    [PLAYER_STATE.Walling]: [
        [
            [10, 36],
            [28, 28],
        ],
        [
            [10, 36],
            [25, 28],
        ],
    ],
};
export class Player {
    private sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private scene: Phaser.Scene;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private state: PLAYER_STATE;
    private RUN_SPEED: number = 40;
    private JUMP_SPEED: number = -200;
    private STOMP_SPEED: number = 60;
    private MAX_STOMP_SPEED: number = 600;
    private MAX_RUN_SPEED: number = 300;
    private WALL_DAMPING: number = 0.7;
    private WALL_JUMP_SPEED: number = 300;
    private currAnim: string = charAnims.idle;
    private locked: boolean = false;
    private PLAYER_WIDTH: number;
    private PLAYER_HEIGHT: number;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        console.log(scene);
        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    spawn(x: number, y: number) {
        const idlePath = getFrame(charMapping.idle);
        console.log(idlePath);
        this.sprite = this.scene.physics.add.sprite(x, y, 'character', getFrame(charMapping.idle));
        this.sprite.setCollideWorldBounds(true);
        this.PLAYER_HEIGHT = JSON.parse(JSON.stringify(this.sprite.body.height));
        this.PLAYER_WIDTH = JSON.parse(JSON.stringify(this.sprite.body.width));
    }
    setBodySize(state) {
        this.state = state;
        const selectedIndex = this.sprite.flipX ? 1 : 0;
        const [[posX, posY], [offX, offY]] = sizes[state][selectedIndex];
        this.sprite.body.setSize(posX, posY).setOffset(offX, offY);
    }

    addPlatforms(platforms: Phaser.Tilemaps.TilemapLayer) {
        this.scene.physics.add.collider(this.sprite, platforms);
    }

    public static generatePlayerAnims(scene: Phaser.Scene) {
        const range = (n) => new Array(n).fill(0).map((_, i) => i);
        const generateFrames = (animName: string, animCount: number, key = 'character') => {
            return range(animCount + 1).map((i) => ({ key, frame: getFrame(animName, i) }));
        };
        Object.keys(charAnims).forEach((animName) => {
            const fullAnimName = charMapping[animName];
            const animCount = animsCount[fullAnimName];
            const frames = generateFrames(fullAnimName, animCount);
            scene.anims.create({ frames: frames, frameRate: 24, repeat: -1, key: animName });
            log(`frames are of ${JSON.stringify(frames)}`);
        });
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    lock(time: number) {
        this.locked = true;
        setTimeout(() => {
            this.locked = false;
        }, time);
    }

    constrain(num, start, end) {
        if (num < start) {
            return start;
        } else if (num > end) {
            return end;
        } else {
            return num;
        }
    }

    handleKeys() {
        if (this.locked) {
            return;
        }
        // handle going left and right
        const downKeyPressed = this.cursors.down.isDown;
        const isLeft = this.cursors.left.isDown;
        const isRight = this.cursors.right.isDown;
        const onFloor = this.sprite.body.onFloor();
        const moveAnim = downKeyPressed ? charAnims.roll : charAnims.run;
        const isJump = this.cursors.space.isDown || this.cursors.up.isDown;
        const wannaJump = isJump && onFloor;
        const bodySize = downKeyPressed ? PLAYER_STATE.Crouching : PLAYER_STATE.Standing
        if (isLeft) {
            this.sprite.body.velocity.x -= this.RUN_SPEED;
            if (this.sprite.body.onFloor()) {
                this.playAnim(moveAnim);
                this.setBodySize(bodySize);
            }
        } else if (isRight) {
            this.sprite.body.velocity.x += this.RUN_SPEED;
            if (this.sprite.body.onFloor()) {
                this.playAnim(moveAnim);
                this.setBodySize(bodySize);
            }
        } else {
            this.sprite.setVelocityX(0);
            if (onFloor) {
                this.playAnim(charAnims.idle);
                this.setBodySize(bodySize);
            }
        }

        // handle space bar
        if (wannaJump) {
            const jumpAnim = this.currAnim === charAnims.idle ? charAnims.idleJump : charAnims.runJump;
            this.playAnim(jumpAnim);
            this.playAnim(charAnims.jumpRising);
            this.sprite.setVelocityY(this.JUMP_SPEED);
        }

        // handle falling
        if (this.sprite.body.velocity.y > 0) {
            this.playAnim(charAnims.jumpFalling);
        }

        // handle flipping
        if (this.sprite.body.velocity.x !== 0) {
            this.sprite.flipX = this.sprite.body.velocity.x < 0;
        }

        // handle stomp
        if (downKeyPressed && !this.sprite.body.onFloor()) {
            this.sprite.body.velocity.y += this.STOMP_SPEED;
        }
        this.sprite.body.velocity.y = Math.min(this.sprite.body.velocity.y, this.MAX_STOMP_SPEED);
        this.sprite.body.velocity.x = this.constrain(
            this.sprite.body.velocity.x,
            -this.MAX_RUN_SPEED,
            this.MAX_RUN_SPEED,
        );

        // handle wall climbing
        if (this.sprite.body.blocked.left || this.sprite.body.blocked.right) {
            this.sprite.toggleFlipX();
            const nudge = 5;
            if (this.state !== PLAYER_STATE.Walling) {
                if (this.sprite.body.blocked.right) {
                    this.sprite.body.x += nudge;
                } else {
                    this.sprite.body.x -= nudge;
                }
            }
            this.setBodySize(PLAYER_STATE.Walling);
            // this.lock(300);
            if (isJump) {
                this.sprite.setVelocityY(this.JUMP_SPEED);
                this.lock(100);
                if (this.sprite.body.blocked.right) {
                    this.sprite.setVelocityX(-this.WALL_JUMP_SPEED);
                } else if (this.sprite.body.blocked.left) {
                    this.sprite.setVelocityX(this.WALL_JUMP_SPEED);
                }
            } else {
                this.sprite.body.velocity.y *= this.WALL_DAMPING;
                this.playAnim(charAnims.wallSlide);
            }
        }
    }

    public playAnim(anim: string) {
        this.currAnim = anim;
        this.sprite.play(anim, true);
    }
}
