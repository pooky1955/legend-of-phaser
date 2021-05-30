import { levels } from './level';
import { MainMenuScene } from './menu-scene';
import { WinScene } from './win-scene';
import { BootScene } from './boot-scene';
import {LevelSelectionScene} from './level-selection';
export default [BootScene,MainMenuScene,...levels,WinScene,LevelSelectionScene];
// export default [BootScene, TestScene];
