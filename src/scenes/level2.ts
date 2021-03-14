import { Spike } from '../classes/Spike';
import { Level } from './level';
const levelNumber = 2;
export class Level2 extends Level {
    private spikes : Spike[] = [];
    constructor() {
        super(levelNumber);
    }
    preload() {
        super.preload();
    }
    loadMap() {
        super.loadMap();
        const spikeLayer = this.map.createLayer('Spikes', 'standard_tiles');
        Spike.generateAnims(this)
        spikeLayer.forEachTile((tile) => {
            if (tile.index !== -1) {
                const x = tile.getLeft();
                const y = tile.getBottom();
                const spike = new Spike(this);
                spike.spawn(x, y);
                this.spikes.push(spike)
                spikeLayer.removeTileAt(tile.x, tile.y);
            }
        });
    }
    loadPlayer(){
        super.loadPlayer()
        this.spikes.forEach(spike => {
            spike.handleOverlapPlayer(this.player)
        }) 
    }
}
