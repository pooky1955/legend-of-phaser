import { getGameWidth, getGameHeight } from '../helpers';
import {Player} from "../classes/Player"
import { charAnims } from '../data/charAnims';
const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'main-scene',
};

export class MainScene extends Phaser.Scene {
  //private cursorKeys : Phaser.Types.Input.Keyboard.CursorKeys;
  private player : Player;
  private map : Phaser.Tilemaps.Tilemap;
  private mapWidth : number;
  private mapHeight : number;
  private backgroundPaths = ['CloudsBack','CloudsFront','BGBack','BGFront'];
  private platforms : Phaser.Tilemaps.TilemapLayer

  constructor(){
    super(sceneConfig)
  }
  
  loadBGs(mapWidth,mapHeight){
    this.backgroundPaths.forEach(imagePath => {
      for (let i = 0; i <= 1 ; i++){
        const img = this.add.image(0,0,imagePath)
        img.setOrigin(0,0)
        const scaleFactor = mapHeight / img.displayHeight
        img.setScale(scaleFactor,scaleFactor)
        img.setX(i * img.displayWidth)

      }
    })
    // this.backgroundPaths.forEach(imagePath => {
    //   const img = this.add.image(100000,getGameHeight(this),imagePath)
    //   img.setOrigin(0,1)
    //   img.setScale(3.1,3.1)
    // })
  }

  loadMap(){
    this.map = this.make.tilemap({key : 'level1'})
    const tileset = this.map.addTilesetImage('standard_tiles','base_tiles')
    const layer = this.map.createLayer("Ground",tileset)
    const [width,height] = [layer.layer.widthInPixels, layer.layer.heightInPixels]
    this.mapWidth = width
    this.mapHeight = height
    this.platforms = layer
    layer.setCollisionByExclusion([-1],true)
    layer.setOrigin(0,0)
    layer.setPosition(0,0)
    const WALL_TILES = []
    layer.depth = 500
    this.loadBGs(width,height)
  }

  loadPlayer(){
    this.player = new Player(this)
    const objectLayer = this.map.getObjectLayer("Spawn")
    const {x,y} = objectLayer.objects[0]
    Player.generatePlayerAnims(this)
    this.player.spawn(x,y)
    this.player.setWorldDims(this.mapWidth,this.mapHeight)
    this.player.addPlatforms(this.platforms)
    this.physics.world.setBounds(0,0,this.mapWidth,this.mapHeight)
    this.player.getSprite().setCollideWorldBounds(true)
    this.cameras.main.startFollow(this.player.getSprite())
    

  }


  public create() : void {
    this.loadMap()
    this.loadPlayer()
  }

  public preload() : void {
    const loadAsset = (file : string) => this.load.image(file,`assets/maps/${file}.png`)
    this.load.image('base_tiles','assets/maps/Tileset.png')
    this.load.tilemapTiledJSON('level1','assets/maps/level1.json')
    this.backgroundPaths.forEach(loadAsset)
    this.load.multiatlas('character','assets/sprites/character.json')


  }

  public update() : void {
    this.player.handleKeys()
  }

}
