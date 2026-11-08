import Phaser from 'phaser';
import { ports, rotate, traceRoute, type Position, type Tile, type Direction } from './rules.js';
import { createHistory, pushHistory, undoHistory, redoHistory, canUndo, canRedo, type History } from './history.js';

const WIDTH = 1040, HEIGHT = 690;
const COLS = 7, ROWS = 5, CELL = 88;
const ORIGIN = { x: 54, y: 142 };
const START: Position = { x: 0, y: 2 };
const GOAL: Position = { x: 6, y: 2 };
const VALID_TILES: Array<[number,number,Tile]> = [
  [0,2,{kind:'start',rotation:0}],
  [1,2,{kind:'straight',rotation:0}],
  [2,2,{kind:'corner',rotation:2}],
  [2,1,{kind:'corner',rotation:0}],
  [3,1,{kind:'straight',rotation:0}],
  [4,1,{kind:'corner',rotation:0}],
  [4,2,{kind:'corner',rotation:1}],
  [5,2,{kind:'straight',rotation:0}],
  [6,2,{kind:'end',rotation:0}]
];
const arrows: Readonly<Record<Direction,Position>> = {
  N:{x:0,y:-1},E:{x:1,y:0},S:{x:0,y:1},W:{x:-1,y:0}
};
const TEST_BUTTON = new Phaser.Geom.Rectangle(735, 455, 263, 67);

class RailwayScene extends Phaser.Scene {
  private tiles: Tile[] = [];
  private history!: History<readonly Tile[]>;
  private trackGraphics!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;
  private details!: Phaser.GameObjects.Text;
  private trainProgress = -1;
  private route: Position[] = [];
  private moves = 0;
  private solved = false;
  private labelsDrawn = false;

  constructor() { super('RailwayScene'); }

  create(): void {
    this.tiles = Array.from({length:COLS*ROWS},()=>({kind:'empty',rotation:0}));
    for (const [x,y,tile] of VALID_TILES) this.tiles[y * COLS + x] = { ...tile };
    this.history = createHistory([...this.tiles]);
    this.trackGraphics = this.add.graphics();
    this.details = this.add.text(752, 230, '', {fontFamily:'monospace',fontSize:'19px',color:'#eaf5d7',lineSpacing:11});
    this.label = this.add.text(746, 555, 'Clique nos trilhos para girar.', {
      fontFamily:'sans-serif',fontSize:'15px',color:'#f8e7bf',wordWrap:{width:246},lineSpacing:7
    });
    this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
      if (this.solved || this.trainProgress >= 0) return;
      const p = {x:pointer.worldX,y:pointer.worldY};
      if (TEST_BUTTON.contains(p.x,p.y)) { this.testRailway(); return; }
      const c = Math.floor((p.x-ORIGIN.x)/CELL);
      const r = Math.floor((p.y-ORIGIN.y)/CELL);
      if (c<0 || c>=COLS || r<0 || r>=ROWS) return;
      const i = r*COLS+c;
      const next = rotate(this.tiles[i]);
      if (next !== this.tiles[i]) {
        const updated = [...this.tiles];
        updated[i] = next;
        this.history = pushHistory(this.history, updated);
        this.tiles = [...this.history.present];
        this.moves++;
        this.label.setText('Trilho girado. Teste quando a rota estiver pronta.');
        this.renderScene();
      }
    });
    this.input.keyboard?.on('keydown-ENTER',()=>this.testRailway());
    this.input.keyboard?.on('keydown-R',()=>this.scene.restart());
    this.input.keyboard?.on('keydown-Z',()=>this.undoTurn());
    this.input.keyboard?.on('keydown-Y',()=>this.redoTurn());
    this.renderScene();
  }

  private undoTurn(): void {
    if (this.solved || this.trainProgress >= 0 || !canUndo(this.history)) return;
    this.history = undoHistory(this.history);
    this.tiles = [...this.history.present];
    this.label.setText('Jogada desfeita. Pressione Y para refazer.');
    this.renderScene();
  }

  private redoTurn(): void {
    if (this.solved || this.trainProgress >= 0 || !canRedo(this.history)) return;
    this.history = redoHistory(this.history);
    this.tiles = [...this.history.present];
    this.label.setText('Jogada refeita. Continue ajustando os trilhos.');
    this.renderScene();
  }

  private testRailway(): void {
    if (this.solved || this.trainProgress >= 0) return;
    const result = traceRoute(this.tiles,COLS,ROWS,START,GOAL);
    if (result.length === 0) {
      this.label.setText('Rota interrompida! Confira as conexões de cada trilho.');
      return;
    }
    this.route = result;
    this.trainProgress = 0;
    this.label.setText('Trem em movimento. Entrega iniciada!');
  }

  private center(p: Position): Position {
    return {x:ORIGIN.x + p.x*CELL + CELL/2,y:ORIGIN.y + p.y*CELL + CELL/2};
  }

  update(_time:number,delta:number):void {
    if (this.trainProgress < 0 || this.solved) return;
    this.trainProgress += Math.min(delta/1000,0.05)*1.6;
    if (this.trainProgress >= this.route.length-1) {
      this.trainProgress = -1;
      this.solved = true;
      this.label.setText('ENTREGA CONCLUÍDA! Pressione R para jogar novamente.');
    }
    this.renderScene();
  }

  private renderScene():void {
    const g=this.trackGraphics;
    g.clear();
    g.fillStyle(0x101d2a);
    g.fillRect(0,0,WIDTH,HEIGHT);
    g.fillStyle(0x1c3036);
    g.fillRoundedRect(35,103,675,493,18);
    g.fillStyle(0x233941);
    g.fillRoundedRect(731,103,282,493,18);
    for(let row=0;row<ROWS;row++) for(let col=0;col<COLS;col++){
      const tile=this.tiles[row*COLS+col];
      const x=ORIGIN.x+col*CELL,y=ORIGIN.y+row*CELL;
      g.fillStyle((row+col)%2===0?0x36504b:0x30483f);
      g.fillRoundedRect(x+3,y+3,CELL-6,CELL-6,10);
      if(tile.kind==='empty'){
        g.fillStyle(0x253e38);
        for(let a=0;a<4;a++)g.fillCircle(x+23+a*13,y+33+(a%2)*6,3);
        continue;
      }
      const cx=x+CELL/2,cy=y+CELL/2;
      g.lineStyle(12,0x503c31);
      for(const dir of ports(tile)){
        const d=arrows[dir];
        g.lineBetween(cx,cy,cx+d.x*CELL/2,cy+d.y*CELL/2);
      }
      g.lineStyle(6,0xe4c992);
      for(const dir of ports(tile)){
        const d=arrows[dir];
        g.lineBetween(cx,cy,cx+d.x*CELL/2,cy+d.y*CELL/2);
      }
      g.fillStyle(tile.kind==='start'?0x7ee6a9:tile.kind==='end'?0xffc56c:0xefdda5);
      g.fillCircle(cx,cy,tile.kind==='start'||tile.kind==='end'?16:11);
      if(tile.kind==='start'||tile.kind==='end'){
        g.lineStyle(2,0x0c2837);
        g.strokeCircle(cx,cy,23);
      }
    }
    if(this.trainProgress>=0 && this.route.length>=2){
      const segment=Math.min(this.route.length-2,Math.floor(this.trainProgress));
      const fraction=this.trainProgress-segment;
      const from=this.center(this.route[segment]),to=this.center(this.route[segment+1]);
      const pos={x:from.x+(to.x-from.x)*fraction,y:from.y+(to.y-from.y)*fraction};
      g.fillStyle(0xffbf52);
      g.fillRoundedRect(pos.x-17,pos.y-13,34,26,7);
      g.fillStyle(0x1b3c51);
      g.fillRect(pos.x-8,pos.y-7,15,10);
      g.fillStyle(0xfcf8dd);
      g.fillCircle(pos.x+11,pos.y+7,3);
    }
    g.fillStyle(0xffd080);
    g.fillRoundedRect(TEST_BUTTON.x,TEST_BUTTON.y,TEST_BUTTON.width,TEST_BUTTON.height,12);
    this.addOrUpdateTexts();
  }

  private addOrUpdateTexts():void {
    this.details.setText([
      'CENTRAL FERROVIÁRIA',
      '',
      'Rotas:  01',
      `Movimentos: ${String(this.moves).padStart(2,'0')}`,
      'Origem: VERDE',
      'Destino: DOURADO',
      '',
      'Z: desfazer',
      'Y: refazer'
    ]);
    if(!this.labelsDrawn){
      this.add.text(754,468,'TESTAR ROTA',{fontFamily:'sans-serif',fontSize:'23px',fontStyle:'bold',color:'#1d2632'});
      this.add.text(57,42,'TRAIN LOGISTICS / MVP',{fontFamily:'sans-serif',fontSize:'29px',fontStyle:'bold',color:'#f8edda'});
      this.add.text(58,77,'Conecte os trilhos e envie o trem até o destino.',{fontFamily:'sans-serif',fontSize:'15px',color:'#b9d5c6'});
      this.labelsDrawn = true;
    }
  }
}

new Phaser.Game({
  type:Phaser.AUTO,
  parent:'game',
  backgroundColor:'#101d2a',
  width:WIDTH,
  height:HEIGHT,
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  scene:RailwayScene
});
