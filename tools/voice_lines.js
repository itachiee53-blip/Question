// Lists every spoken English line in the story with its speaker, as JSON on stdout.
// Usage: node tools/voice_lines.js > lines.json
// The story file is evaluated with stub engine helpers to read the people (their hello lines,
// answers and goodbyes); lines inside scripted scenes are found by scanning the source for L(...) calls.
const fs=require('fs'),path=require('path'),vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'../src/story1.js'),'utf8');
const ctx={P:{F:{}},G:{},rnd:Math.random,pick:a=>a[0],console};
vm.createContext(ctx);vm.runInContext(src+';this.STORY=STORY;',ctx);
const S=ctx.STORY,out=new Map();
const add=(who,en)=>{if(!en||!/[A-Za-z]/.test(en))return;const k=who+'|'+en;if(!out.has(k))out.set(k,{who,en});};
const lines=arr=>{for(const l of arr||[])if(l&&l.en)add(l.who||'',l.en);};
// people, including the ones defined as functions of the flags
const flagSets=[{},{d_grace:'no'},{bribes:1},{benOut:true}];
for(const [id,x] of Object.entries(S.people))for(const fl of flagSets){ctx.P.F=fl;const d=typeof x==='function'?x():x;if(!d)continue;
  lines(d.hello);for(const k in d.bye||{})if(d.bye[k])add(d.bye[k].who,d.bye[k].en);
  for(const q of d.qs||[]){if(Array.isArray(q.a))lines(q.a);const Q=S.Q[q.q]||q;if(Q.en)add('me',Q.en);}}
for(const k in S.Q)add('me',S.Q[k].en);
// scripted scenes: L('who', 'english', ...), say1/sayW('who','english',...)
const str=`'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)"`;
const re=new RegExp(`\\b(?:L|say1|sayW)\\(\\s*(?:${str})\\s*,\\s*(?:${str})`,'g');let m;
while((m=re.exec(src))){const who=(m[1]??m[2]??'').replace(/\\'/g,"'"),en=(m[3]??m[4]??'').replace(/\\'/g,"'").replace(/\\"/g,'"');add(who,en);}
process.stdout.write(JSON.stringify([...out.values()],null,1));
