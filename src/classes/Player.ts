import {charMapping} from "../data/charFrames"
import {charAnims} from "../data/charAnims"
import {animsCount} from "../data/animsCount"
import {log} from "../helpers"

const getFrame = (path,index=1) => {
  const paddedInt = index.toLocaleString("en-US",{minimumIntegerDigits : 3,useGrouping : false})
  return `${path}/${paddedInt}.png`
}

export class Player {
  private sprite : Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  private scene : Phaser.Scene
  constructor(scene : Phaser.Scene){
    this.scene = scene 
  }

  spawn(x : number,y : number){
    const idlePath = getFrame(charMapping.idle)
    console.log(idlePath)
    this.sprite = this.scene.physics.add.sprite(x, y, "character",getFrame(charMapping.idle))
    this.sprite.setCollideWorldBounds(true)
  }

  addPlatforms(platforms : Phaser.Tilemaps.TilemapLayer){
    this.scene.physics.add.collider(this.sprite, platforms)
  }

  public static generatePlayerAnims(scene : Phaser.Scene){
    const range = n => new Array(n).fill(0).map((_,i) => i)
    const generateFrames = (animName : string,animCount : number,key="character") => {
      return range(animCount + 1).map(i => ({key,frame : getFrame(animName,i)}))
    }
    Object.keys(charAnims).forEach(animName => {
      const fullAnimName = charMapping[animName]
      const animCount = animsCount[fullAnimName]
      const frames = generateFrames(fullAnimName,animCount)
      scene.anims.create({frames : frames, frameRate : 10, repeat : -1, key : animName})
      log(`frames are of ${JSON.stringify(frames)}`)
    })

  }

  public getSprite() : Phaser.GameObjects.Sprite {
    return this.sprite
  }

  public playAnim(anim : string){
    this.sprite.play(anim)
  }
}
