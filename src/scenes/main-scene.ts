import { getGameWidth, getGameHeight } from '../helpers';
import {Player} from "../classes/Player"
const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'main-scene',
};

export class MainScene extends Phaser.Scene {
    //private cursorKeys : Phaser.Types.Input.Keyboard.CursorKeys;
    private image : Phaser.Physics.Arcade.Sprite;
    private player : Player = new Player()
    private map : Phaser.Tilemaps.Tilemap;
    private backgroundPaths = ['BGBack','BGFront','CloudsBack','CloudsFront']
    // private platforms : Phaser.

    constructor(){
        super(sceneConfig)
    }

    public create() : void {
        //this.cursorKeys = this.input.keyboard.createCursorKeys()
        this.map = this.make.tilemap({key : 'level1'})
        const images = ['CloudsBack','BGBack','CloudsFront','BGFront']
        images.forEach(imagePath => {
            const img = this.add.image(0,0,imagePath)
            img.setScale(getGameHeight(this) / img.displayHeight * 2)

        })
        const tileset = this.map.addTilesetImage('standard_tiles','base_tiles')
        console.log(tileset)
        const layer = this.map.createLayer("Ground",tileset)
        const objectLayer = this.map.getObjectLayer("Spawn")
        const {x,y} = objectLayer.objects[0]
        this.player.spawn(x,y)
        layer.setPosition(30,30)
        // layerNames.forEach(layerName => {
        //     console.log(`loading ${layerName}`)
        //     const layer = this.map.createLayer(layerName,tileset)
        //     layer.setScale(300,300)
        //     const {x,y,width,height} = layer
        //     console.log({x,y,width,height})
        // })
        
        
        
    }

    public preload() : void {
        const loadAsset = (file) => this.load.image(file,`assets/maps/${file}.png`)
        console.log('preloading stuff')
        this.load.image('base_tiles','assets/maps/Tileset.png')
        this.load.tilemapTiledJSON('level1','assets/maps/level1.json')
        this.backgroundPaths.forEach(loadAsset)
    }

    public update() : void {
    }

}
