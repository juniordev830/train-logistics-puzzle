import test from 'node:test';
import assert from 'node:assert/strict';
import {ports,rotate,traceRoute} from '../dist/rules.js';

const WIDTH=7,HEIGHT=5;
const start={x:0,y:2},goal={x:6,y:2};
function puzzle(){
  const cells=Array.from({length:WIDTH*HEIGHT},()=>({kind:'empty',rotation:0}));
  for(const [x,y,kind,rotation] of [
    [0,2,'start',0],[1,2,'straight',1],[2,2,'corner',3],
    [2,1,'corner',1],[3,1,'straight',1],[4,1,'corner',2],
    [4,2,'corner',0],[5,2,'straight',1],[6,2,'end',0]
  ]) cells[y*WIDTH+x]={kind,rotation};
  return cells;
}
test('rotating corners changes connections',()=>{
  assert.deepEqual(ports({kind:'corner',rotation:0}),['N','E']);
  assert.deepEqual(ports(rotate({kind:'corner',rotation:0})),['E','S']);
  assert.deepEqual(ports(rotate({kind:'straight',rotation:0})),['E','W']);
});
test('complete connected route reaches destination',()=>{
  const path=traceRoute(puzzle(),WIDTH,HEIGHT,start,goal);
  assert.equal(path.length,9);
  assert.deepEqual(path[0],start);
  assert.deepEqual(path.at(-1),goal);
});
test('broken route does not arrive',()=>{
  const cells=puzzle();cells[2*WIDTH+1]=rotate(cells[2*WIDTH+1]);
  assert.deepEqual(traceRoute(cells,WIDTH,HEIGHT,start,goal),[]);
});
test('invalid board and out-of-bounds are rejected',()=>{
  assert.deepEqual(traceRoute([],WIDTH,HEIGHT,start,goal),[]);
  const cells=puzzle();cells[2*WIDTH+0]={kind:'empty',rotation:0};
  assert.deepEqual(traceRoute(cells,WIDTH,HEIGHT,start,goal),[]);
});
test('fixed stations cannot be rotated',()=>{
  const fixed={kind:'start',rotation:0};
  assert.equal(rotate(fixed),fixed);
});
