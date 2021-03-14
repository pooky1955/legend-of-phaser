import { charMapping } from '../data/charFrames';
import { charAnims } from '../data/charAnims';
import { animsCount } from '../data/animsCount';
import { animsRate, defaultRate } from '../data/animsRate';
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
            [26, 36 - 20],
            [15, 28 + 20],
        ],
        [
            [26, 36 - 20],
            [23, 28 + 20],
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
    private jumpLock: boolean = false;
    private RUN_SPEED: number = 40;
    private JUMP_SPEED: number = -300;
    private STOMP_SPEED: number = 60;
    private MAX_STOMP_SPEED: number = 600;
    private MAX_RUN_SPEED: number = 300;
    private WALL_DAMPING: number = 0.7;
    private WALL_JUMP_SPEED: number = 150;
    private currAnim: string = charAnims.idle;
    private locked: boolean = false;
    private PLAYER_WIDTH: number;
    private PLAYER_HEIGHT: number;
    private MAP_WIDTH: number;
    private MAP_HEIGHT: number;
    private spawnX: number;
    private spawnY: number;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    public setWorldDims(width, height) {
        this.MAP_WIDTH = width;
        this.MAP_HEIGHT = height;
    }

    spawn(x: number, y: number) {
        const idlePath = getFrame(charMapping.idle);
        this.spawnX = x;
        this.spawnY = y;
        this.sprite = this.scene.physics.add
            .sprite(0, 0, 'character', getFrame(charMapping.idle))
            .setOrigin(0.5, 1)
            .setPosition(x, y);
        this.PLAYER_HEIGHT = JSON.parse(JSON.stringify(this.sprite.body.height));
        this.PLAYER_WIDTH = JSON.parse(JSON.stringify(this.sprite.body.width));
        this.setBodySize(PLAYER_STATE.Standing);
    }

    respawn() {
        this.getSprite().setVelocity(0, 0);
        this.getSprite().setPosition(this.spawnX, this.spawnY);
    }
    setBodySize(state) {
        this.state = state;
        const selectedIndex = this.sprite.flipX ? 1 : 0;
        const [[posX, posY], [offX, offY]] = sizes[state][selectedIndex];
        this.sprite.body.setSize(posX, posY).setOffset(offX, offY);
    }

    addPlatforms(platforms: Phaser.Tilemaps.TilemapLayer) {
        this.scene.physics.add.overlap(this.sprite, platforms, () => {
        });
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
            const rate = animName in animsRate ? animsRate[animName] : defaultRate;
            const frames = generateFrames(fullAnimName, animCount);
            scene.anims.create({ frames: frames, frameRate: rate, repeat: -1, key: animName });
            log(`frames are of ${JSON.stringify(frames)}`);
        });
    }

    public getSprite(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
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

    updateVelocityX(number) {
        this.sprite.body.setVelocityX(number + this.sprite.body.velocity.x);
    }
    updateVelocityY(number) {
        this.sprite.body.setVelocityY(number + this.sprite.body.velocity.y);
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
        const bodySize = downKeyPressed ? PLAYER_STATE.Crouching : PLAYER_STATE.Standing;
        if (isLeft) {
            this.updateVelocityX(-this.RUN_SPEED);
            if (this.sprite.body.onFloor()) {
                this.playAnim(moveAnim);
                this.setBodySize(bodySize);
            }
        } else if (isRight) {
            this.updateVelocityX(this.RUN_SPEED);
            if (this.sprite.body.onFloor()) {
                this.playAnim(moveAnim);
                this.setBodySize(bodySize);
            }
        } else {
            this.sprite.setVelocityX(0);
            if (onFloor) {
                if (downKeyPressed) {
                    this.playAnim(charAnims.crouch);
                } else {
                    this.playAnim(charAnims.idle);
                }
                this.setBodySize(bodySize);
            }
        }

        // handle space bar
        if (wannaJump) {
            const jumpAnim = this.currAnim === charAnims.idle ? charAnims.idleJump : charAnims.runJump;
            this.playAnim(jumpAnim);
            this.playAnim(charAnims.jumpRising);
            this.sprite.setVelocityY(this.JUMP_SPEED);
            this.lock(100);
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
            this.updateVelocityY(this.STOMP_SPEED);
        }
        this.sprite.setVelocityY(Math.min(this.sprite.body.velocity.y, this.MAX_STOMP_SPEED));
        this.sprite.setVelocityX(this.constrain(this.sprite.body.velocity.x, -this.MAX_RUN_SPEED, this.MAX_RUN_SPEED));

        // handle wall climbing
        const onWorldWall = this.sprite.body.left === 0 || this.sprite.body.right === this.MAP_WIDTH;
        if (!onFloor && (this.sprite.body.blocked.left || this.sprite.body.blocked.right) && !onWorldWall) {
            this.sprite.toggleFlipX();
            const nudge = 5;
            if (this.state !== PLAYER_STATE.Walling) {
                if (this.sprite.body.blocked.right) {
                    this.sprite.body.x += nudge;
                } else {
                    this.sprite.body.x -= nudge;
                }
                this.jumpLock = true;
                setTimeout(() => {
                    this.jumpLock = false;
                }, 150);
            }
            if (isJump && !this.jumpLock) {
                this.jumpLock = false;
                this.sprite.setVelocityY(this.JUMP_SPEED);
                this.playAnim(charAnims.jumpRising, true);
                this.setBodySize(PLAYER_STATE.Standing);
                this.lock(250);
                if (this.sprite.body.blocked.right) {
                    this.sprite.setVelocityX(-this.WALL_JUMP_SPEED);
                } else if (this.sprite.body.blocked.left) {
                    this.sprite.setVelocityX(this.WALL_JUMP_SPEED);
                }
            } else {
                this.setBodySize(PLAYER_STATE.Walling);
                this.playAnim(charAnims.wallSlide, true);
                this.sprite.setVelocityY(this.sprite.body.velocity.y * this.WALL_DAMPING);
            }
        }
    }

    public playAnim(anim: string, overwrite: boolean = false) {
        this.currAnim = anim;
        const ignore = overwrite ? false : true;
        this.sprite.play(anim, ignore);
    }
}
