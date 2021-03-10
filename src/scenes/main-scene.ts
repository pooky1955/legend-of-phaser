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
  private player : Player = new Player(this);
  private map : Phaser.Tilemaps.Tilemap;
  private backgroundPaths = ['CloudsBack','CloudsFront','BGBack','BGFront'];
  private platforms : Phaser.Tilemaps.TilemapLayer

  constructor(){
    super(sceneConfig)
  }
  
  loadBGs(){
    this.backgroundPaths.forEach(imagePath => {
      const img = this.add.image(0,0,imagePath)
      img.setScale(4,4)
    })
  }

  loadMap(){
    this.map = this.make.tilemap({key : 'level1'})
    const tileset = this.map.addTilesetImage('standard_tiles','base_tiles')
    const layer = this.map.createLayer("Ground",tileset)
    this.platforms = layer
    layer.setCollisionByExclusion([-1],true)
    layer.setOrigin(0,0)
    layer.setPosition(0,0)
  }

  loadPlayer(){
    const objectLayer = this.map.getObjectLayer("Spawn")
    const {x,y} = objectLayer.objects[0]
    Player.generatePlayerAnims(this)
    this.player.spawn(x,y)
    this.player.addPlatforms(this.platforms)
    console.log(objectLayer)
    console.log({x,y})

  }

  public create() : void {
    this.loadBGs()
    this.loadMap()
    this.loadPlayer()
  }

  public preload() : void {
    const loadAsset = (file : string) => this.load.image(file,`assets/maps/${file}.png`)
    console.log('preloading stuff')
    this.load.image('base_tiles','assets/maps/Tileset.png')
    this.load.tilemapTiledJSON('level1','assets/maps/level1.json')
    this.backgroundPaths.forEach(loadAsset)
    this.load.multiatlas('character','assets/sprites/character.json')


  }

  public update() : void {
  }

}
