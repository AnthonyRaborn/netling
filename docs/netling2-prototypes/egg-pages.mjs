// Egg page drop pace by placement. Reads 1.0's lineage baseline (runs a life in each region), so it needs no simulator:
//   node egg-pages.mjs [path to tools/baseline/lineages.json]   (default: ../../tools/baseline/lineages.json)
// Model: each run in a region rolls p for the egg's next unknown page placed there (in order, no repeats, no per-life cap).
// 'any' = role pages roll on every non-Deep run; 'home' = the drafts' placement (Program: Public Net 2, Corp Grid 2; Iron: Ruins 4;
// Wetware: Bazaar 4); the hidden page rolls only on Deep runs. Runs a life are the baseline's means for lives 1 to 4 (Poisson), life 4's after.
// Not modeled: 2.0 rules, a different run mix, the Source pages, other eggs' pages.
import fs from 'fs';
const path = process.argv[2] ?? new URL('../../tools/baseline/lineages.json', import.meta.url).pathname;
const L=JSON.parse(fs.readFileSync(path,'utf8')).archetypes;
let seed=12345;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const pois=(m)=>{let l=Math.exp(-m),k=0,p=1;do{k++;p*=rnd()}while(p>l);return k-1};
const prof=(a)=>[0,1,2,3].map(i=>L[a].lives[i].netruns.byRegion);
// layouts: pages per region in drop order, per egg
const LAYOUT={
  program:{public:2,corp:2,deep:1}, iron:{ruins:4,deep:1}, wetware:{bazaar:4,deep:1},
};
const NON_DEEP=['public','bazaar','corp','ruins'];
function life(byLife,li){return byLife[Math.min(li,3)]}
function sim(a,egg,model,p,lineages=20000,maxLives=12){
  const prof_=prof(a);const role=[],all=[];
  for(let n=0;n<lineages;n++){
    let found={}; let roleDone=null,allDone=null;
    const left={...(model==='home'?LAYOUT[egg]:{any:4,deep:1})};
    for(let li=0;li<maxLives;li++){
      const br=life(prof_,li);
      // runs in sequence within life: ruins etc order not important; sample counts
      for(const r of ['public','bazaar','corp','ruins','deep']){
        const key=model==='home'?r:(r==='deep'?'deep':'any');
        const runs=pois(br[r]);
        for(let k=0;k<runs;k++){ if((left[key]??0)>0 && rnd()<p) left[key]--; }
      }
      const roleLeft=model==='home'?Object.entries(left).filter(([k])=>k!=='deep').reduce((s,[,v])=>s+v,0):left.any;
      if(roleDone===null&&roleLeft===0) roleDone=li+1;
      if(allDone===null&&roleLeft===0&&left.deep===0) allDone=li+1;
    }
    role.push(roleDone??99);all.push(allDone??99);
  }
  const cdf=(x,n)=>Math.round(100*x.filter(v=>v<=n).length/x.length);
  const med=(x)=>{const s=[...x].sort((a,b)=>a-b);return s[Math.floor(s.length/2)]};
  return {role:[1,2,3,4,6].map(n=>cdf(role,n)).join('/'),roleMed:med(role),all:[2,3,4,6,8].map(n=>cdf(all,n)).join('/'),allMed:med(all)}
}
for(const a of ['attentive','casual']){
  console.log('\n##',a,'expected runs/life',JSON.stringify(prof(a)[0]));
  console.log('model egg  | role pages done by life 1/2/3/4/6 (%) median | all 5 by life 2/3/4/6/8 (%) median');
  for(const p of [0.10]){
    console.log('any  all  p',p, JSON.stringify(sim(a,'iron','any',p)));
    for(const egg of ['program','iron','wetware']) console.log('home',egg.padEnd(7),'p',p, JSON.stringify(sim(a,egg,'home',p)));
  }
}
console.log('\n#### hidden page by Deep rate (any model, role pages p 0.10)');
function simDeep(a,pDeep,lineages=20000){
  const pr=prof(a);const done=[];
  for(let n=0;n<lineages;n++){let got=null;
    for(let li=0;li<12&&got===null;li++){const runs=pois(life(pr,li).deep);for(let k=0;k<runs;k++){if(rnd()<pDeep){got=li+1;break}}}
    done.push(got??99)}
  const cdf=n=>Math.round(100*done.filter(v=>v<=n).length/done.length);
  return [2,3,4,6].map(cdf).join('/');
}
for(const a of ['attentive','casual','daredevil']) console.log(a,'hidden page by life 2/3/4/6 (%):',[0.10,0.20,0.25,0.30].map(p=>'p'+p+' '+simDeep(a,p)).join('  |  '));
