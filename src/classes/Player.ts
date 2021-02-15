class Player {
  private sprite : Phaser.GameObjects.Sprite
  private scene : Phaser.Scene
  constructor(scene : Phaser.Scene){
    this.scene = scene 
  }

  spawn(x : number,y : number){
    this.sprite = this.scene.add.sprite(x, y,"character")
  }

  public getSprite() : Phaser.GameObjects.Sprite {
    return this.sprite
  }
}
