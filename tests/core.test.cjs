const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('../dist/core.js');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/data.js'),'utf8'),context);const D=context.window.XH_DATA;
test('damaged saved data recovers without propagating invalid values',()=>{
 const s=C.normalize({completed:['yudu','yudu',null],favorites:'bad',note:42,bestScore:Infinity,quizRuns:-2});
 assert.deepEqual(s.completed,['yudu']);assert.deepEqual(s.favorites,[]);assert.equal(s.note,'');assert.equal(s.bestScore,0);assert.equal(s.quizRuns,0);
});
test('a replay cannot award the same chapter twice',()=>{const s=C.award(C.award(C.initial(),'yudu'),'yudu');assert.equal(s.completed.length,1);});
test('packing enforces budget and all four needs',()=>{
 assert.equal(C.packing([3,2,3,2]),true);assert.equal(C.packing([4,2,3,3]),true);
 for(const v of [[6,2,3,2],[2,2,3,2],[3,1,3,2],[3,2,2,2],[3,2,3,1],[3.5,2,3,2],[-3,2,3,2]])assert.equal(C.packing(v),false);
});
test('the route puzzle has a valid path and rejects obstacles and row wrap',()=>{
 const queue=[[0]],seen=new Set([0]);let result;
 while(queue.length){const p=queue.shift();if(p.at(-1)===24){result=p;break;}for(let n=0;n<25;n++)if(!seen.has(n)&&C.canStep(p,n)){seen.add(n);queue.push([...p,n]);}}
 assert.ok(result,'exit must be reachable');assert.ok(result.length>=9);assert.equal(C.canStep([0,1],2),false);assert.equal(C.canStep([4],5),false);assert.equal(C.canStep([0,5],0),false);
});
test('every historical card and quiz answer refers to a valid source',()=>{
 for(const item of [...D.chapters,...D.stories,...D.questions])assert.ok(D.sources[item.source]?.url.startsWith('https://'));
 assert.equal(new Set(D.chapters.map(x=>x.id)).size,9);assert.equal(new Set(D.stories.map(x=>x.id)).size,6);
 for(const q of D.questions)assert.ok(Number.isInteger(q.answer)&&q.options[q.answer]);
});

test('graph IDs, references, types and provenance are consistent',()=>{
 const G=D.graph,ids=new Set(),edges=new Set();
 for(const n of G.nodes){
  assert.ok(!ids.has(n.id),`duplicate node ${n.id}`);ids.add(n.id);
  assert.ok(['place','event','person','story','spirit'].includes(n.type));
  assert.equal(G.index[n.id],n);
  assert.ok(D.sources[n.source]?.title&&D.sources[n.source]?.publisher);
  assert.match(D.sources[n.source].url,/^https:\/\//);
  if(n.storyId)assert.ok(D.stories.some(s=>s.id===n.storyId));
  if(n.personId)assert.ok(D.people.some(p=>p.id===n.personId));
  if(n.spiritId)assert.ok(D.spirits.some(s=>s.id===n.spiritId));
 }
 for(const r of G.relations){
  assert.ok(ids.has(r.from),`invalid from: ${r.from}`);assert.ok(ids.has(r.to),`invalid to: ${r.to}`);
  assert.notEqual(r.from,r.to);assert.ok(r.relation);
  const key=`${r.from}|${r.to}|${r.relation}`;assert.ok(!edges.has(key),`duplicate edge ${key}`);edges.add(key);
  assert.ok(D.sources[r.source]?.url);
 }
 assert.equal(G.nodes.filter(n=>n.type==='place').length,9);
 assert.equal(G.nodes.filter(n=>n.type==='event').length,9);
 assert.equal(G.relations.filter(r=>r.relation==='时间先后').length,8);
});
test('all nine archives have substantive details and valid challenge/story links',()=>{
 for(const c of D.chapters){
  for(const field of ['event','date'])assert.ok(c.detail[field]?.length,`${c.id}: ${field}`);
  for(const field of ['background','process','significance'])assert.ok(c.detail[field]?.length>20,`${c.id}: ${field}`);
  assert.ok(c.detail.sources.length);
  for(const source of c.detail.sources)assert.ok(D.sources[source]?.url);
  for(const id of c.detail.people)assert.ok(D.people.some(p=>p.id===id));
  assert.ok(c.type&&c.mission&&c.intro);
  assert.ok(D.graph.relations.some(r=>r.from===c.id&&r.to===`event:${c.id}`));
 }
 for(const p of D.people)if(p.storyId)assert.ok(D.stories.some(s=>s.id===p.storyId));
 const linked=(from,to)=>D.graph.relations.some(r=>r.from===from&&r.to===to);
 for(const [chapter,story] of [['xiangjiang','chen'],['zunyi','meeting'],['luding','bridge'],['snow','mountain'],['grass','mountain'],['huining','victory']])assert.ok(linked(`event:${chapter}`,`story:${story}`));
 assert.ok(linked('event:xiangjiang','person:chen-shuxiang'));
 assert.ok(linked('person:chen-shuxiang','story:chen'));
 assert.ok(D.graph.extensions.includes('story:quilt'));
 assert.ok(!D.graph.relations.some(r=>r.from==='story:quilt'||r.to==='story:quilt'));
});
test('Wuqi and the 1936 meeting places are distinct and corrected everywhere',()=>{
 assert.equal(D.chapters.find(c=>c.id==='wuqi').title,'到达吴起镇');
 const h=D.chapters.find(c=>c.id==='huining');assert.match(h.place,/宁夏/);assert.match(h.place,/西吉/);
 for(const file of ['dist/data.js','dist/app.js','README.md']){
  const text=fs.readFileSync(require('node:path').join(__dirname,'..',file),'utf8');
  assert.ok(!text.includes('吴起会师'));assert.ok(!text.includes('静宁将台堡'));
 }
});
