import { getGameWidth, getGameHeight } from '../helpers';
import { Player } from '../classes/Player';
import { charAnims } from '../data/charAnims';
import { Goal } from '../classes/Goal';
import { Spike } from '../classes/Spike';
import { PlantEnemy } from '../classes/Enemy';

export class Level extends Phaser.Scene {
    //private cursorKeys : Phaser.Types.Input.Keyboard.CursorKeys;
    public player: Player;
    private name: string;
    private goal: Goal;
    private spikes: Spike[] = [];
    public last = false;
    public map: Phaser.Tilemaps.Tilemap;
    private mapWidth: number;
    private mapHeight: number;
    private backgroundPaths = ['CloudsBack', 'CloudsFront', 'BGBack', 'BGFront'];
    private platforms: Phaser.Tilemaps.TilemapLayer;
    public number: number;

    constructor(number: number) {
        super({
            active: false,
            visible: false,
            key: `level${number}`,
        });
        this.name = `level${number}`;
        this.number = number;
    }

    loadBGs(mapWidth, mapHeight) {
        Level.loadBGs(this, mapWidth, mapHeight);
    }

    loadMap() {
        Level.loadMap(this);
        if (this.map.getLayer('Spikes') !== null) {
            this.loadSpikes();
        }
    }
    loadSpikes() {
        const spikeLayer = this.map.createLayer('Spikes', 'standard_tiles');
        Spike.generateAnims(this);
        spikeLayer.forEachTile((tile) => {
            if (tile.index !== -1) {
                const x = tile.getLeft();
                const y = tile.getBottom();
                const spike = new Spike(this);
                spike.spawn(x, y);
                this.spikes.push(spike);
                spikeLayer.removeTileAt(tile.x, tile.y);
            }
        });
    }
    loadPlayer() {
        Level.loadPlayer(this);
    }
    loadEnemies() {
        Level.loadEnemies(this);
    }

    loadGoal() {
        Level.loadGoal(this);
        this.spikes.forEach((spike) => {
            spike.handleOverlapPlayer(this.player);
        });
    }

    public create(): void {
        this.loadMap();
        this.loadPlayer();
        this.loadGoal();
        this.loadEnemies();
    }
    public preload() {}
    public update(): void {
        this.player.handleKeys();
    }

    static loadBGs(level: Level, mapWidth: number, mapHeight: number) {
        level.backgroundPaths.forEach((imagePath) => {
            let i = 0;
            while (i <= mapWidth) {
                const img = level.add.image(0, 0, imagePath);
                img.setOrigin(0, 0);
                const scaleFactor = mapHeight / img.displayHeight;
                img.setScale(scaleFactor, scaleFactor);
                img.setX(i);
                i += img.displayWidth;
            }
        });
    }

    static loadMap(level: Level) {
        level.map = level.make.tilemap({ key: level.name });
        const tileset = level.map.addTilesetImage('standard_tiles', 'base_tiles', 16, 16, 1, 2);
        const layer = level.map.createLayer('Ground', 'standard_tiles');
        level.map.createLayer('Decor', 'standard_tiles').depth = 1000;
        const [width, height] = [layer.layer.widthInPixels, layer.layer.heightInPixels];
        level.mapWidth = width;
        level.mapHeight = height;
        level.platforms = layer;
        layer.setCollisionByExclusion([-1], true);
        layer.setOrigin(0, 0);
        layer.setPosition(0, 0);
        layer.depth = 500;
        level.loadBGs(width, height);
    }

    static loadPlayer(level: Level) {
        level.player = new Player(level);
        const objectLayer = level.map.getObjectLayer('Spawn');
        const { x, y } = objectLayer.objects[0];
        Player.generatePlayerAnims(level);
        PlantEnemy.generateAnims(level)
        level.player.spawn(x, y);
        level.player.setWorldDims(level.mapWidth, level.mapHeight);
        level.player.addPlatforms(level.platforms);
        level.physics.world.setBounds(0, 0, level.mapWidth, level.mapHeight);
        level.player.getSprite().setCollideWorldBounds(true);
        level.cameras.main.startFollow(level.player.getSprite());
        level.cameras.main.setBounds(0, 0, level.mapWidth, level.mapHeight);
        const zoom = (1.1 * window.innerHeight) / level.mapHeight;
        level.cameras.main.setZoom(Math.min(zoom, 4));
    }

    static loadEnemies(level: Level) {
        const enemiesDict = {
            "Plant" : PlantEnemy
        }
        const enemyPool = {}
        level.map.objects.map(({name}) => {
            let enemyType
            if (name.startsWith("Enemies")){
                enemyType = name.split("_")[1]
                enemyPool[enemyType] = level.map.getObjectLayer(name).objects.map(({x,y}) => {
                    const enemy = new enemiesDict[enemyType](level)
                    console.log(`spawning enemy at ${x}, ${y}`)
                    enemy.spawn(x,y)
                    enemy.addPlatforms(level.platforms)
                    enemy.getSprite().setCollideWorldBounds(true)
                    enemy.handleOverlapPlayer(level.player)
                    return enemy
                })
            }
        })

    }

    static destroy(level: Level) {
        level.platforms.destroy();
        level.player.getSprite().destroy();
        level.goal.getSprite().destroy();
    }

    static loadGoal(level: Level) {
        level.goal = new Goal(level);
        const objectLayer = level.map.getObjectLayer('Goal');
        const { x, y } = objectLayer.objects[0];
        Goal.generateAnims(level);
        level.goal.spawn(x, y);
        level.goal.addPlatforms(level.platforms);
        level.goal.handleOverlapPlayer(level.player);
    }

    respawn() {
        this.player.respawn();
    }
}

export const maxLevel = 6;
export const range = (n) => new Array(n).fill(0).map((_, i) => i);

export const levels = range(maxLevel).map((number) => {
    const levelNumber = number + 1;
    return class CurrentLevel extends Level {
        constructor() {
            super(levelNumber);
            if (levelNumber === 1) performance.mark('run');
            this.last = levelNumber === maxLevel;
        }
    };
});
