/* ================= CHAPTER 1: CHECKPOINT SEVEN =================
   Story data and scripted scenes. This file is inlined into game.html by build.py,
   so it can use the engine helpers (G, makeActor, walk, play, say, camTo ...).
   Lines: {who, en, th}. A line with only th is narration. {P} = player name, {S} = sister. */

const L=(who,en,th)=>({who,en,th});
const N=th=>({th});                         // narration
const run=fn=>({run:fn});
const wait=s=>({wait:s});
const cm=(c,t)=>({cam:c,t});

// infection timeline used everywhere: bite -> 2-6h fever 38+ -> 6-12h red eyes, shaking -> 24h turns
const STORY={
  endingCount:4,
  dateOf:d=>`${11+d} Oct 2031`,
  cast:{
    me:{n:'{P}'},
    carter:{n:'จ่าคาร์เตอร์',pitch:.75,rate:.92,vi:1,look:{model:'Soldier_Male',skin:'brown',h:1.86}},
    min:{n:'มิน',f:true,pitch:1.2,rate:1.02,vi:0,look:{model:'Casual3_Female',skin:'light',h:1.62}},
    diaz:{n:'สิบตรีดิอาซ',f:true,pitch:1.0,vi:1,look:{model:'Soldier_Female',skin:'tan',h:1.7}},
    rossi:{n:'รอสซี่',pitch:.95,rate:1.08,vi:2},
    sunhee:{n:'ซันฮี',f:true,pitch:1.1,vi:2},
    jae:{n:'แจ',pitch:1.6,rate:1.05,vi:0},
    maria:{n:'มาเรีย',f:true,pitch:1.05,vi:1},
    elena:{n:'ดร.เอเลน่า',f:true,pitch:.95,vi:3},
    radio:{n:'วิทยุ',pitch:.9},
  },
  // words in context; checked before the general word list
  gloss:{
    "i'm":'ฉัน... (I am)',"you're":'คุณ... (you are)',"it's":'มัน... (it is)',"that's":'นั่น... (that is)',"don't":'อย่า, ไม่',"can't":'ไม่ได้',"won't":'จะไม่',
    "didn't":'ไม่ได้ (อดีต)',"isn't":'ไม่ใช่',"wasn't":'ไม่ได้เป็น',"i'll":'ฉันจะ',"i've":'ฉันได้...แล้ว',"he's":'เขา... (he is)',"she's":'เธอ... (she is)',
    "we're":'พวกเรา... (we are)',"they're":'พวกเขา... (they are)',"what's":'อะไร... (what is)',"let's":'ไปกันเถอะ, มา...กัน',"there's":'มี...',"you'll":'คุณจะ',"we'll":'เราจะ',
    "i'd":'ฉันจะ...',"haven't":'ยังไม่ได้',"doesn't":'ไม่',"aren't":'ไม่ใช่',"couldn't":'ไม่สามารถ',"he'll":'เขาจะ',"she'll":'เธอจะ',"they'll":'พวกเขาจะ',"you've":'คุณได้...แล้ว',
    checkpoint:'ด่านตรวจ',volunteer:'อาสาสมัคร',sergeant:'จ่า (ยศทหาร)',sarge:'จ่า (เรียกสั้น)',rookie:'มือใหม่',card:'บัตร',photo:'รูปถ่าย',match:'ตรงกัน',rule:'กฎ',rules:'กฎ',
    entry:'การเข้า',enter:'เข้า',bite:'กัด, รอยกัด',bitten:'ถูกกัด',scratch:'รอยข่วน',sleeve:'แขนเสื้อ',sleeves:'แขนเสื้อ',fence:'รั้ว',fever:'ไข้',
    permit:'ใบอนุญาต, ใบผ่าน',expired:'หมดอายุ',valid:'ใช้ได้',quarantine:'กักตัว',tent:'เต็นท์',bandage:'ผ้าพันแผล',shelter:'ศูนย์พักพิง',airport:'สนามบิน',
    horde:'ฝูง (ซอมบี้)',runner:'ตัวที่วิ่ง',gate:'ประตู',command:'กองบัญชาการ',turned:'กลายร่าง',turn:'กลายร่าง',infected:'ติดเชื้อ',research:'การวิจัย',
    subject:'ผู้ถูกทดลอง',transferred:'ถูกย้ายไป',antibiotics:'ยาปฏิชีวนะ',associate:'ผู้ร่วมงาน',ma:'คุณผู้หญิง',ma_am:'คุณผู้หญิง',okay:'โอเค',ok:'โอเค',
    unit:'หน่วย (ทหาร)',beans:'ถั่ว',bracelet:'สร้อยข้อมือ',elephant:'ช้าง',drones:'โดรน',kilometers:'กิโลเมตร',sunset:'พระอาทิตย์ตก',rations:'อาหารปันส่วน',
    freezing:'หนาวมาก',associate_:'',swear:'สาบาน',lying:'โกหก',hurry:'รีบ',nobody:'ไม่มีใคร',someone:'ใครบางคน',everyone:'ทุกคน',anyone:'ใครก็ได้',
    dear:'ที่รัก (เรียกอย่างสุภาพ)',gonna:'จะ (going to)',wanna:'อยาก (want to)',yeah:'ใช่',nope:'ไม่',hey:'เฮ้',huh:'หือ',mom:'แม่',dad:'พ่อ',
  },
  Q:{
    name:{en:"What's your name?",th:'คุณชื่ออะไร'},
    from:{en:'Where are you from?',th:'มาจากไหน'},
    why:{en:'Why do you want to come in?',th:'ทำไมถึงอยากเข้าเมือง'},
    card:{en:'Is this your card?',th:'นี่บัตรของคุณใช่ไหม'},
    photo:{en:"This photo doesn't look like you.",th:'รูปนี้ไม่เหมือนคุณเลย'},
    alone:{en:'Are you alone?',th:'มาคนเดียวไหม'},
    arm:{en:'Can you roll up your sleeves?',th:'พับแขนเสื้อขึ้นได้ไหม'},
    hurt:{en:'Are you hurt?',th:'บาดเจ็บไหม'},
    bite:{en:'Were you bitten?',th:'โดนกัดหรือเปล่า'},
    armwhat:{en:'What happened to your arm?',th:'แขนไปโดนอะไรมา'},
    neck:{en:"What's that on your neck?",th:'ที่คอคุณเป็นอะไร'},
    bandage:{en:'Take off the bandage, please.',th:'แกะผ้าพันแผลออกหน่อย'},
    sick:{en:'Do you feel sick?',th:'รู้สึกไม่สบายไหม'},
    fever:{en:'How long have you had a fever?',th:'เป็นไข้มานานแค่ไหนแล้ว'},
    bag:{en:"What's in your bag?",th:'ในกระเป๋ามีอะไร'},
    permit:{en:'Do you have an entry permit?',th:'มีใบผ่านไหม'},
    expired:{en:'This permit has expired.',th:'ใบผ่านนี้หมดอายุแล้ว'},
    family:{en:'Do you have family here?',th:'มีครอบครัวอยู่ที่นี่ไหม'},
    girl:{en:'Have you seen a Thai girl? Her name is {S}.',th:'เคยเห็นเด็กผู้หญิงไทยไหม ชื่อ{S}'},
    work:{en:'What do you do?',th:'คุณทำงานอะไร'},
  },
  days:[],people:{},
};
const S=STORY;
const F=()=>P.F;
// default answers to the question about the sister
const NO_GIRL=[
  ['No. I\'m sorry.','ไม่เคยเห็นเลย ขอโทษนะ'],
  ["I haven't seen anyone like that. Sorry.",'ไม่เคยเห็นใครแบบนั้นเลย ขอโทษด้วย'],
  ['There were so many people... I really don\'t know.','คนเยอะมาก... ฉันไม่รู้จริง ๆ'],
  ['No. I hope you find her.','ไม่เคยเห็น หวังว่าจะเจอเธอนะ'],
  ['A Thai girl? No... no, I don\'t think so.','เด็กผู้หญิงไทยเหรอ ไม่... ไม่น่าจะเคยเห็น'],
];
function person(o){
  o.voice=o.voice||{};
  const nm=o.name;
  const girl=o.girl||NO_GIRL[[...nm].reduce((a,c)=>a+c.charCodeAt(0),0)%NO_GIRL.length];
  if(!(o.qs||[]).some(q=>q.q==='girl'))(o.qs=o.qs||[]).push({q:'girl',a:Array.isArray(girl[0])?girl.map(g=>L(nm,g[0],g[1])):[L(nm,girl[0],girl[1])]});
  return o;
}
const say1=(who,en,th)=>G.say(L(who,en,th));
const sayW=(who,en,th)=>G.say(L(who,en,th),{wait:true});
// someone already inside the checkpoint, standing by the gate
function bystander(look,x,z,ry=1.2){const a=makeActor(look);if(!a)return null;a.obj.position.set(x,0,z);a.obj.rotation.y=ry;(G.D.extra||(G.D.extra=[])).push(a);return a;}
function zombie(x,z,model='Zombie_Basic'){const a=makeActor({zombie:true,model,h:rnd(1.7,1.85)});if(!a)return null;a.obj.position.set(x,0,z);(G.D?(G.D.extra||(G.D.extra=[])):[]).push(a);return a;}
// a zombie runs at a person, bites, the person goes down screaming
async function maul(z,v,{fatal=true}={}){
  await G.walk(z,[[v.obj.position.x+.4,v.obj.position.z-.5]],{run:true});
  G.play(z,'Punch',{once:true});G.play(v,'RecieveHit',{once:true});G.SFX.scream();await G.sleep(350);
  G.bloodBurst(G.chestOf(v),22,1.3);G.SFX.flesh();await G.sleep(450);G.bloodBurst(G.chestOf(v),16);
  if(fatal){G.die(v);}
}
const GUARD=()=>G.STAFF.diaz&&G.STAFF.diaz.obj.visible?G.STAFF.diaz:G.STAFF.carter;
async function shootDown(z,from){const f=from||GUARD();if(!z||z.dead)return;G.play(f,'Shoot_OneHanded',{once:true});
  const p=G.V(f.obj.position.x,1.45,f.obj.position.z);for(let i=0;i<3;i++){G.muzzle(p);G.SFX.shot();await G.sleep(140);}
  G.bloodBurst(G.chestOf(z),18,1.2);G.die(z);}

/* ======================= DAY 1 ======================= */
S.days.push({
  tools:['id','bag'],newTools:['id'],weather:'wind',tod0:.02,tod1:.62,crowd:7,
  rules:[{en:'Everyone needs an ID card.',th:'ทุกคนต้องมีบัตร'},{en:'The face must match the photo.',th:'หน้าต้องตรงกับรูป'}],
  words:['card','photo','face','match','rule','enter','lost','brother'],
  morning:F=>[
    {fade:'out',t:0},cm('high',0),
    {title:'บทที่ 1',sub:'ด่าน 7',t:3},
    {fade:'in'},
    N('สามสัปดาห์ก่อน เชื้อบางอย่างเริ่มระบาด คนที่โดนกัดจะกลายเป็นซอมบี้ภายในหนึ่งวัน'),
    cm('far',4),
    N('ทหารปิดเมือง Haven เอาไว้ ทางเข้าที่เหลืออยู่มีแค่สะพานแห่งนี้'),
    N('ส่วน{S}... หายไปตั้งแต่วันแรก ที่สนามบิน'),
    cm('outside',3),
    N('วันนี้คือวันแรกที่{P}มาเป็นอาสาที่ด่าน 7'),
    cm('gate',1.6),
    L('carter',"You're the new volunteer? {P}, right?",'เธอคืออาสาคนใหม่ใช่ไหม {P} ใช่หรือเปล่า'),
    L('carter',"I'm Sergeant Carter. This is Checkpoint Seven. The last way into Haven.",'ฉันจ่าคาร์เตอร์ ที่นี่คือด่านเจ็ด ทางสุดท้ายที่จะเข้าเมือง Haven ได้'),
    L('carter','Your job is simple. People come to that window. You check them. You decide.','งานเธอง่ายมาก คนจะมาที่หน้าต่างนั่น เธอตรวจ แล้วเธอเป็นคนตัดสิน'),
    L('carter','Today there is one rule. No card, no entry. And the face must match the photo.','วันนี้มีกฎข้อเดียว ไม่มีบัตร ไม่ให้เข้า และหน้าต้องตรงกับรูป'),
    L('carter',"Your English isn't great, huh? That's fine. Listen, look, learn fast.",'ภาษาอังกฤษเธอยังไม่ค่อยดีใช่ไหม ไม่เป็นไร ฟัง ดู แล้วเรียนให้ไว'),
    L('carter',"And {P}... if you let the wrong person in, people die. Don't forget that.",'แล้วก็ {P}... ถ้าเธอปล่อยคนผิดเข้าไป คนจะตาย อย่าลืมล่ะ'),
    cm('booth',1.4),
    run(()=>G.toast('แตะคำ = ดูคำแปล',3200)),
  ],
  people:['reyes','grace','marcus','lena','hassan'],
  evening:F=>[
    cm('radio',1.6),{run:()=>G.setTod(.9)},
    L('min',"Hey, you survived your first day! I'm Min. I run the radio.",'เฮ้ รอดวันแรกมาได้นะ ฉันชื่อมิน ดูแลวิทยุอยู่'),
    L('min',"Carter looks scary, but he's a good man. He lost his whole unit in the first week.",'จ่าดูน่ากลัวก็จริง แต่เป็นคนดีนะ เขาเสียลูกน้องไปทั้งหน่วยตั้งแต่สัปดาห์แรก'),
    L('min','So why did you volunteer? Most people only come for the food.','แล้วทำไมถึงมาเป็นอาสาล่ะ คนส่วนใหญ่มาเพราะอยากได้อาหาร'),
    N('{P}เล่าเรื่อง{S}ให้มินฟัง ว่าพลัดกันที่สนามบินในวันที่เชื้อระบาด'),
    L('min','Your sister... {S}. I listen to the radio every night. I\'ll listen for her name. I promise.','น้องสาวเธอ... {S} ฉันฟังวิทยุทุกคืนอยู่แล้ว จะคอยฟังชื่อเธอให้ สัญญา'),
    {if:F=>F.d_grace==='no',then:[cm('outside',2),
      L('carter','That old woman with no card. She\'s sleeping on the bridge tonight.','ยายที่ไม่มีบัตรคนนั้น คืนนี้แกนอนอยู่บนสะพาน'),
      L('carter','You did the right thing. It doesn\'t feel like it. It never does.','เธอทำถูกแล้ว ถึงจะไม่รู้สึกแบบนั้นก็ตาม มันไม่เคยรู้สึกดีหรอก')]},
    {fade:'out'},
  ],
});
S.people.reyes=person({name:'Daniel Reyes',look:{model:'Casual_Male',skin:'tan',h:1.78},voice:{pitch:.95,vi:0},
  id:{born:'4 May 1992',from:'Port Alder',no:'VL-204-1187'},
  hello:[L('Daniel Reyes','Morning. Here\'s my card.','อรุณสวัสดิ์ นี่บัตรผมครับ')],
  enter:async()=>{await sayW('carter','First one is easy. Look at the card. Then look at his face.','คนแรกง่าย ๆ ดูบัตร แล้วดูหน้าเขา');},
  qs:[{q:'name',a:[L('Daniel Reyes','Daniel. Daniel Reyes.','แดเนียลครับ แดเนียล เรเยส')]},
    {q:'from',a:[L('Daniel Reyes','Port Alder. It\'s gone now. The whole town.','พอร์ตอัลเดอร์ครับ ตอนนี้ไม่เหลือแล้ว ทั้งเมืองเลย')]},
    {q:'why',a:[L('Daniel Reyes','My parents are inside. In the old town. I hope.','พ่อแม่ผมอยู่ข้างในครับ ย่านเมืองเก่า... หวังว่านะ')]},
    {q:'bag',a:[L('Daniel Reyes','Clothes, water, a photo of my mom. That\'s all.','เสื้อผ้า น้ำ แล้วก็รูปแม่ผม แค่นั้นครับ')]}],
  bag:[{i:'👕',en:'clothes'},{i:'💧',en:'water'},{i:'🖼',en:'photo'}],
  why:'บัตรถูกต้อง หน้าตรงกับรูป',
  after:{yes:async()=>{await say1('carter',"Good. That's how it's done.",'ดี แบบนี้แหละ');await G.sleep(1500);},
    no:async()=>{await say1('carter','No? His card was fine, {P}. Be careful.','ไม่ให้เข้าเหรอ บัตรเขาไม่มีปัญหาเลยนะ {P} ระวังหน่อย');await G.sleep(1800);}},
});
S.people.grace=person({name:'Grace Okafor',look:{model:'OldClassy_Female',skin:'deep',h:1.6},voice:{f:true,pitch:.85,rate:.85,vi:1},
  id:null,
  hello:[L('Grace Okafor','Good morning, dear. I... I lost my card. When we ran from the city.','อรุณสวัสดิ์จ้ะหนู ยาย... ยายทำบัตรหาย ตอนที่วิ่งหนีออกจากเมือง')],
  enter:async()=>{await sayW('carter','Remember the rule, {P}.','จำกฎไว้นะ {P}');},
  qs:[{q:'name',a:[L('Grace Okafor','Grace. Grace Okafor. I was a teacher for forty years.','เกรซจ้ะ เกรซ โอคาฟอร์ ยายเป็นครูมาสี่สิบปี')]},
    {q:'card',a:[L('Grace Okafor','I had it in my coat. Then the coat was gone. Everything was gone.','ยายเก็บไว้ในเสื้อโค้ท แล้วเสื้อก็หาย ทุกอย่างหายไปหมด')]},
    {q:'family',a:[L('Grace Okafor','My daughter lives inside. Please, dear. I just want to see her.','ลูกสาวยายอยู่ข้างใน ได้โปรดเถอะหนู ยายแค่อยากเจอเขา')]}],
  right:'no',why:'ไม่มีบัตร',
  bye:{no:L('Grace Okafor','I understand. Rules are rules. I\'ll find a way, dear.','ยายเข้าใจจ้ะ กฎก็คือกฎ เดี๋ยวยายหาทางเอง')},
  after:{yes:async()=>{F().graceIn=true;await say1('carter','{P}. No card means no entry. I\'ll let it go. Once.','{P} ไม่มีบัตรแปลว่าห้ามเข้า ครั้งนี้ฉันปล่อยไป ครั้งเดียว');await G.sleep(2200);}},
});
S.people.marcus=person({name:'Marcus Bell',look:{model:'Casual2_Male',skin:'brown',h:1.8},voice:{pitch:.9,rate:1.08,vi:2},
  id:{name:'Jonah Bell',born:'19 Feb 1988',from:'Kesh',no:'VL-551-0932',photo:{model:'Casual_Bald',skin:'dark',h:1.8}},
  hello:[L('Marcus Bell',"Hey. Can we make this quick? I've been walking all night.",'เฮ้ ขอเร็ว ๆ หน่อยได้ไหม ผมเดินมาทั้งคืนแล้ว')],
  qs:[{q:'name',a:[L('Marcus Bell','Marcus. Marcus Bell.','มาร์คัส มาร์คัส เบลล์')]},
    {q:'card',a:[L('Marcus Bell','Yeah. Of course it\'s mine.','ใช่ แน่นอนสิว่าของผม')]},
    {q:'photo',a:[L('Marcus Bell','...','...'),L('Marcus Bell','It\'s my brother\'s card. Jonah. He didn\'t make it. Mine burned with our house.','มันเป็นบัตรของพี่ชายผม โจนาห์ เขาไม่รอด ส่วนบัตรผมไหม้ไปพร้อมบ้าน')]},
    {q:'why',a:[L('Marcus Bell','There\'s nothing left out there, man. Nothing.','ข้างนอกนั่นไม่เหลืออะไรแล้ว ไม่เหลือเลย')]}],
  right:'no',why:'ชื่อในบัตรไม่ตรง รูปเป็นคนอื่น',
  bye:{no:L('Marcus Bell','Come on... Please. Where am I supposed to go?','ไม่เอาน่า... ได้โปรด แล้วจะให้ผมไปไหน')},
});
S.people.lena=person({name:'Lena Novak',look:{model:'Casual_Female',skin:'pale',h:1.68},voice:{f:true,pitch:1.1,vi:0},
  id:{born:'30 Nov 1999',from:'Velmora City',no:'VL-118-7741'},
  hello:[L('Lena Novak','Hi. I came from the airport. They said the shelter there is full.','สวัสดี ฉันมาจากสนามบิน เขาบอกว่าศูนย์พักพิงที่นั่นเต็มแล้ว')],
  qs:[{q:'from',a:[L('Lena Novak','The capital. But I was at the airport when it started.','จากเมืองหลวง แต่ตอนที่มันเริ่ม ฉันอยู่ที่สนามบิน')]},
    {q:'why',a:[L('Lena Novak','The airport isn\'t safe anymore. Doctors come every day and take people away.','สนามบินไม่ปลอดภัยแล้ว มีหมอมาทุกวันแล้วก็พาคนไป')]},
    {q:'bag',a:[L('Lena Novak','Just my phone. It doesn\'t work. And a toothbrush.','แค่โทรศัพท์ ใช้ไม่ได้แล้วล่ะ แล้วก็แปรงสีฟัน')]}],
  bag:[{i:'📱',en:'phone'},{i:'🪥',en:'toothbrush'}],
  girl:[['A Thai girl? There were hundreds of people at the airport shelter...','เด็กผู้หญิงไทยเหรอ ที่ศูนย์พักพิงสนามบินมีคนเป็นร้อย...'],['Maybe I saw her. Maybe not. I\'m sorry.','อาจจะเคยเห็น หรืออาจจะไม่ ขอโทษนะ']],
  why:'บัตรถูกต้อง หน้าตรงกับรูป',
});
S.people.hassan=person({name:'Hassan Ali',look:{model:'Worker_Male',skin:'tan',h:1.76},voice:{pitch:.85,vi:1},
  id:{born:'2 Jan 1979',from:'Mirr',no:'VL-330-2290'},
  hello:[L('Hassan Ali','Hello. I can fix things. Fences, trucks, anything. Let me help.','สวัสดีครับ ผมซ่อมของได้ รั้ว รถบรรทุก อะไรก็ได้ ให้ผมช่วยเถอะ')],
  qs:[{q:'work',a:[L('Hassan Ali','I was a mechanic for twenty years. Give me a tool and I\'ll show you.','ผมเป็นช่างมายี่สิบปี เอาเครื่องมือมา เดี๋ยวผมทำให้ดู')]},
    {q:'bag',a:[L('Hassan Ali','My tools. A hammer, nails, some wire. Don\'t worry, they\'re only tools.','เครื่องมือผมครับ ค้อน ตะปู ลวดนิดหน่อย ไม่ต้องห่วง แค่เครื่องมือ')]},
    {q:'alone',a:[L('Hassan Ali','Now I am. My wife was sick before all this. She\'s at peace now.','ตอนนี้ใช่ครับ ภรรยาผมป่วยตั้งแต่ก่อนเรื่องทั้งหมดนี้ ตอนนี้เธอสงบแล้ว')]}],
  bag:[{i:'🔨',en:'hammer'},{i:'📌',en:'nails'},{i:'🧵',en:'wire'}],
  why:'บัตรถูกต้อง หน้าตรงกับรูป',
});

/* ======================= DAY 2 ======================= */
S.days.push({
  tools:['id','bag','body'],newTools:['body'],weather:'wind',tod0:.06,tod1:.7,crowd:7,
  rules:[{en:'Everyone needs an ID card.',th:'ทุกคนต้องมีบัตร'},{en:'The face must match the photo.',th:'หน้าต้องตรงกับรูป'},{en:'Check arms and neck for bites.',th:'ตรวจแขนกับคอหารอยกัด',new:true}],
  words:['bite','arm','neck','sleeve','hide','cold','scratch','fence'],
  morning:F=>[
    cm('radio',0),{fade:'in'},
    L('min','Bad news. Last night Checkpoint Four let in a man with a bite.','ข่าวร้าย เมื่อคืนด่านสี่ปล่อยผู้ชายที่โดนกัดเข้าไป'),
    L('min','He turned in a shelter. Twelve people are dead.','เขากลายร่างในศูนย์พักพิง ตายไปสิบสองคน'),
    {if:F=>F.d_marcus==='yes',then:[L('min','Oh, and that man with his brother\'s card? Marcus? He\'s fine. He\'s working in the kitchen now.','อ้อ ผู้ชายที่ใช้บัตรพี่ชายน่ะ มาร์คัส เขาไม่เป็นไรนะ ตอนนี้ช่วยงานในครัวอยู่')]},
    cm('gate',1.4),
    L('carter','New rule. Everyone shows their arms and neck. A bite takes one day to turn you. One day.','กฎใหม่ ทุกคนต้องให้ดูแขนกับคอ คนโดนกัดใช้เวลาแค่วันเดียวก็กลายร่าง วันเดียว'),
    L('carter',"People will hide it. They'll lie to your face. Don't let them.",'คนจะพยายามซ่อน จะโกหกต่อหน้าเธอ อย่ายอมให้หลอก'),
    cm('booth',1.2),
  ],
  people:['tom','victor','ruth','sunhee','priya'],
  between:{4:async(F,D)=>{await gateEvent(F,D);}},
  evening:F=>[
    {if:F=>F.gate==='late',then:[cm('gate',1.5),{run:()=>{G.setTod(.92);const d=G.STAFF.diaz;if(d){d.obj.visible=true;d.obj.position.set(-2.8,0,-.6);G.play(d,'SitDown',{once:true});}}},
      L('diaz','Sarge... you know what to do. Don\'t let me become one of them.','จ่า... จ่ารู้ว่าต้องทำยังไง อย่าปล่อยให้ฉันกลายเป็นพวกมัน'),
      L('carter','...I know, Diaz. I know.','...ฉันรู้ ดิอาซ ฉันรู้'),
      {fade:'out'},wait(1),{run:()=>{G.SFX.shot();}},wait(2),
      {run:()=>{F.diazDead=true;if(G.STAFF.diaz)G.STAFF.diaz.obj.visible=false;}},
      cm('radio',0),{fade:'in'},
      L('min','She was my friend. Diaz was my friend.','เธอเป็นเพื่อนฉัน ดิอาซเป็นเพื่อนฉัน')]},
    {if:F=>F.d_victor==='no',then:[cm('bridge',1.6),{run:()=>G.setTod(.9)},
      N('ตอนพลบค่ำ มีเสียงกรีดร้องดังมาจากกลางสะพาน'),
      run(async()=>{const z=zombie(1.2,-17,'Zombie_Arm');const v=G.D.crowd[0];if(z&&v){await maul(z,v);await G.sleep(500);await shootDown(z);}}),
      L('carter','The man with the long sleeves. Victor. You were right about him.','ผู้ชายแขนยาวคนนั้น วิกเตอร์ เธอคิดถูก'),
      L('carter','He would have done that inside. To children.','ถ้าเขาเข้าไป เขาจะทำแบบนี้ข้างใน กับเด็ก ๆ')]},
    {if:F=>F.clue1,then:[cm('radio',1.6),
      L('min','An old woman saw {S} at the airport shelter? That\'s great news!','ยายคนนั้นเคยเห็น{S}ที่ศูนย์พักพิงสนามบินเหรอ ข่าวดีมากเลย!'),
      L('min','I\'ll try to reach the airport tonight. No promises. The signal is bad.','คืนนี้ฉันจะลองติดต่อสนามบินดู สัญญาไม่ได้นะ สัญญาณแย่มาก')]},
    {fade:'out'},
  ],
});
async function gateEvent(F,D){
  // two people from the line make a run for it; a runner comes up the bridge behind them
  await camTo('bridge',1.2);G.ambience('tense');G.SFX.alarm();G.heart(true);
  const pri=makeActor(getDef('priya').look),iv=makeActor({model:'OldClassy_Male',skin:'pale',h:1.7});
  (D.extra||(D.extra=[])).push(pri,iv);pri.obj.position.set(.6,0,-12);iv.obj.position.set(-1,0,-13);
  const z=zombie(.2,-42,'Zombie_Basic');
  await say(L('diaz','Runner! Runner on the bridge!','ตัววิ่ง! มีตัววิ่งมาบนสะพาน!'));
  G.gateTo(true,.01);
  walk(pri,[[.4,-1.6]],{run:true,speed:1.25});walk(iv,[[-.6,-1.8]],{run:true,speed:1.05});walk(z,[[.2,-3.4]],{run:true,speed:2.9});
  await say(L('carter','Close the gate when they\'re through! Not before!','ปิดประตูตอนพวกเขาผ่านเข้ามาแล้ว! ห้ามปิดก่อน!'));
  const zOf=a=>a.obj.position.z,pct=zz=>(zz+30)/29*100;
  const t=await G.qte({label:'ปิดประตู!',dur:6,gateAt:pct(-3.2),marks:[{c:'#fff',at:()=>pct(zOf(pri))},{c:'#ccc',at:()=>pct(zOf(iv))},{c:'#ff3a2a',at:()=>pct(zOf(z))}]});
  const inside=a=>zOf(a)>-3.2;
  let res='ok';if(t===null||zOf(z)>-5.2)res='late';else if(!inside(pri)||!inside(iv))res='early';
  G.gateTo(false,.4);G.SFX.gate();hideSay();
  if(res==='early'){
    const out=[pri,iv].filter(a=>!inside(a));for(const a of out){a.path=null;G.play(a,'Idle');}
    await camTo({p:[.6,1.7,-1],l:[.2,1.1,-6]},.6);
    for(const a of out){await maul(z,a);await G.sleep(300);}
    await shootDown(z);
    for(const a of out){if(a===pri)F.priyaDead=true;else F.ivanDead=true;}
    await sayW('carter','Damn it, {P}! They were right there!','บ้าเอ๊ย {P}! พวกเขาอยู่ตรงนั้นแล้วแท้ ๆ!');F.trust=(F.trust||0)-2;F.gate='early';
  }else if(res==='late'){
    const d=G.STAFF.diaz;z.path=null;
    await camTo({p:[1.2,1.7,-.6],l:[2.6,1.1,-4.2]},.5);
    if(d){await maul(z,d,{fatal:false});G.splatter(18);G.flashRed();}
    await shootDown(z,G.STAFF.carter);
    await sayW('diaz','It got me... Sarge, it got my arm.','มันกัดฉัน... จ่า มันกัดแขนฉัน');F.trust=(F.trust||0)-2;F.gate='late';F.diazBit=true;
  }else{
    G.play(z,'HitReact',{once:true});G.SFX.gate();await G.sleep(500);await shootDown(z);
    await sayW('carter','Good timing. Good.','จังหวะดีมาก ดี');F.trust=(F.trust||0)+2;F.gate='ok';
  }
  G.heart(false);G.ambience('wind');
  // whoever made it inside takes Priya's place in the line; the dead stay where they fell
  if(!F.ivanDead)removeActor(iv);
  const qi=D.queue.indexOf('priya');removeActor(D.queue['a'+qi]);delete D.queue['a'+qi];
  if(!F.priyaDead){D.extra.splice(D.extra.indexOf(pri),1);pri.path=null;D.queue['a'+qi]=pri;pri.obj.position.set(-.2,0,-2.6);G.play(pri,'Idle');}
  G.gateTo(true,1.2);await camTo('booth',1);
}
S.people.tom=person({name:'Tom Hughes',look:{model:'Casual3_Male',skin:'pale',h:1.8},voice:{pitch:1,vi:3},
  id:{born:'12 Aug 1995',from:'Norra',no:'VL-772-1046'},
  hello:[L('Tom Hughes','Morning. Long line today, huh?','อรุณสวัสดิ์ วันนี้คิวยาวเชียวนะ')],
  enter:async()=>{await sayW('carter','New rule, {P}. Check his arms and neck.','กฎใหม่นะ {P} ดูแขนกับคอเขา');},
  qs:[{q:'arm',a:[L('Tom Hughes','Sure. Here. Nothing on me, see?','ได้เลย นี่ ไม่มีอะไรเลย เห็นไหม')]},
    {q:'hurt',a:[L('Tom Hughes','Just tired. And hungry. Mostly hungry.','แค่เหนื่อย แล้วก็หิว หิวมากกว่า')]},
    {q:'from',a:[L('Tom Hughes','Norra. Up north. It took me nine days to get here.','นอร์รา ทางเหนือ ใช้เวลาเก้าวันกว่าจะมาถึง')]}],
  why:'บัตรถูกต้อง ไม่มีรอยกัด',
});
S.people.victor=person({name:'Victor Kane',look:{model:'Suit_Male',skin:'light',h:1.82},voice:{pitch:.85,rate:1.1,vi:0},
  id:{born:'7 Mar 1984',from:'Velmora City',no:'VL-090-3318'},
  wounds:[{at:'L',kind:'bite'}],
  hello:[L('Victor Kane','Here. My card. Let\'s be fast, okay?','นี่ บัตรผม เร็ว ๆ หน่อยนะ')],
  qs:[{q:'arm',a:[L('Victor Kane',"Why? It's freezing out here. I'm just cold.",'ทำไม ข้างนอกหนาวจะตาย ผมแค่หนาว')]},
    {q:'hurt',a:[L('Victor Kane',"No. I'm fine. Can I go now?",'ไม่ ผมสบายดี ไปได้หรือยัง')]},
    {q:'bite',a:[L('Victor Kane','...','...'),L('Victor Kane','No.','ไม่')]},
    {q:'armwhat',when:D=>D.seen.has('body'),a:[L('Victor Kane',"It's... it's from a dog. A dog bit me. It's not one of them, I swear!",'มัน... มันเป็นหมา หมากัดผม ไม่ใช่พวกมัน ผมสาบาน!')]}],
  right:'no',inf:true,why:'มีรอยกัดที่แขนซ้าย ใต้แขนเสื้อ',
  bye:{no:L('Victor Kane',"You're killing me! You know that?!",'คุณกำลังฆ่าผม! รู้ตัวไหม!')},
});
S.people.ruth=person({name:'Ruth Abara',look:{model:'OldClassy_Female',skin:'dark',h:1.58,tint:{Shirt:'#6a3a5a'}},voice:{f:true,pitch:.8,rate:.82,vi:2},
  id:{born:'21 Jun 1951',from:'Sell Bay',no:'VL-014-5520'},
  hello:[L('Ruth Abara','Oh, my knees... Good morning, young one.','โอ๊ย หัวเข่า... อรุณสวัสดิ์จ้ะพ่อหนุ่มแม่หนุ่ม')],
  qs:[{q:'arm',a:[L('Ruth Abara','At my age? Sure, dear. Look all you want.','อายุขนาดนี้แล้ว ได้สิจ๊ะ ดูให้เต็มที่เลย')]},
    {q:'from',a:[L('Ruth Abara','Sell Bay. But I was at the airport shelter for two weeks.','เซลเบย์จ้ะ แต่ยายอยู่ที่ศูนย์พักพิงสนามบินมาสองอาทิตย์')]}],
  girl:[["A Thai girl... yes! At the airport shelter, two days ago.",'เด็กผู้หญิงไทย... ใช่! ที่ศูนย์พักพิงสนามบิน เมื่อสองวันก่อน'],
    ['She was asking everyone about her family. She said her name was {S}.','เธอเดินถามทุกคนเรื่องครอบครัว บอกว่าชื่อ{S}'],
    ['She looked tired, but she was alive. She was alive, dear.','ดูเหนื่อย ๆ แต่ยังมีชีวิตอยู่ ยังมีชีวิตอยู่นะหนู']],
  why:'บัตรถูกต้อง ไม่มีรอยกัด',
});
S.people.ruth.qs.find(q=>q.q==='girl').then=()=>{F().clue1=true;};
S.people.sunhee=person({name:'Sun-hee Park',look:{model:'Casual2_Female',skin:'light',h:1.62},voice:{f:true,pitch:1.1,vi:2},
  id:{born:'9 Sep 1990',from:'Arlen',no:'VL-645-8801'},
  hello:[L('Sun-hee Park','Hello. This is my son, Jae. We\'ve been walking for four days.','สวัสดีค่ะ นี่แจ ลูกชายฉัน เราเดินกันมาสี่วันแล้ว')],
  enter:async(F,D)=>{const j=bystander({model:'Casual2_Male',skin:'light',h:1.12},1.6,-1.7,Math.PI+.3);D.jae=j;},
  qs:[{q:'arm',a:[L('Sun-hee Park','Of course. Jae, show them your arms too. Good boy.','ได้ค่ะ แจ ให้เขาดูแขนด้วยลูก เก่งมาก')]},
    {q:'family',a:[L('Sun-hee Park','My husband, Min-jun. He stayed behind to help an old man. He\'s one day behind us. Maybe two.','สามีฉัน มินจุน เขาอยู่ช่วยคุณตาคนหนึ่ง ตามหลังเรามาวันหนึ่ง หรืออาจจะสองวัน')]},
    {q:'why',a:[L('Sun-hee Park','For Jae. He needs a safe place to sleep.','เพื่อแจค่ะ เขาต้องการที่ปลอดภัยไว้นอน')]}],
  why:'บัตรถูกต้อง ไม่มีรอยกัด',
  after:{yes:async(F,D)=>{F.parkIn=true;await sayW('jae','Mom, will Dad find us?','แม่ พ่อจะหาเราเจอไหม');await say1('sunhee','He will, baby. He always does.','เจอสิลูก พ่อหาเราเจอเสมอ');
      if(D.jae)walk(D.jae,[[-.4,-1.7],[-1.7,-1.6],[-2.0,-.4],[-2.2,4]]);await G.sleep(1600);},
    no:async(F,D)=>{F.parkOut=true;await say1('sunhee','Please... he\'s just a child!','ได้โปรด... เขาเป็นแค่เด็กนะ!');if(D.jae)walk(D.jae,[[1.2,-3.4],[0.9,-9],[0.6,-16]]);await G.sleep(1800);}},
});
S.people.priya=()=>F().priyaDead?null:person({name:'Priya Nair',look:{model:'Casual2_Female',skin:'brown',h:1.64,tint:{Shirt:'#3a5a3a'}},voice:{f:true,pitch:1.15,rate:1.1,vi:3},
  id:{born:'15 Apr 1997',from:'Kesh',no:'VL-480-2231'},
  wounds:[{at:'R',kind:'scratch'}],
  hello:[L('Priya Nair','Thank you... thank you. That thing... it was so close.','ขอบคุณ... ขอบคุณ ตัวนั้น... มันเกือบถึงตัวแล้ว')],
  qs:[{q:'armwhat',a:[L('Priya Nair',"I cut it on the fence when I was running. It's not a bite, look!",'ฉันโดนรั้วบาดตอนวิ่ง ไม่ใช่รอยกัดนะ ดูสิ!')]},
    {q:'bite',a:[L('Priya Nair','No! It didn\'t touch me. I swear.','ไม่! มันไม่โดนตัวฉันเลย สาบาน')]}],
  why:'แค่รอยข่วนจากรั้ว ไม่ใช่รอยกัด',
  bye:{no:L('Priya Nair',"You can't send me back out there! Please!",'จะส่งฉันกลับออกไปข้างนอกไม่ได้นะ! ได้โปรด!')},
});

/* ======================= DAY 3 ======================= */
S.days.push({
  tools:['id','bag','body','temp','eyes'],newTools:['temp','eyes'],weather:'rain',tod0:.08,tod1:.74,crowd:6,
  rules:[{en:'Everyone needs an ID card.',th:'ทุกคนต้องมีบัตร'},{en:'The face must match the photo.',th:'หน้าต้องตรงกับรูป'},{en:'Check arms and neck for bites.',th:'ตรวจแขนกับคอหารอยกัด'},{en:'Fever of 38°C or more: no entry.',th:'ไข้ 38 องศาขึ้นไป ห้ามเข้า',new:true}],
  words:['fever','temperature','cough','sick','eyes','flu','research','order'],
  morning:F=>[
    cm('radio',0),{fade:'in'},
    {if:F=>F.d_victor==='yes',then:[
      L('min','The man with the long sleeves... Victor? He turned at three in the morning. In the shelter.','ผู้ชายแขนยาวคนนั้น... วิกเตอร์ เขากลายร่างตอนตีสาม ในศูนย์พักพิง'),
      L('min','Three people died before the soldiers stopped him. One of them was a little girl.','ตายไปสามคนก่อนทหารจะหยุดเขาได้ หนึ่งในนั้นเป็นเด็กผู้หญิงตัวเล็ก ๆ'),
      L('carter','That\'s on us, {P}. On you.','นั่นเป็นความผิดของพวกเรา {P} ความผิดของเธอ')]},
    {if:F=>F.gate==='early',then:[L('min','They buried the two people from the gate this morning.','เช้านี้เขาฝังสองคนที่หน้าประตูไปแล้ว')]},
    cm('gate',1.4),
    L('carter','Command sent us thermometers. A bite gives you a fever before it turns you.','กองบัญชาการส่งเครื่องวัดไข้มาให้ คนโดนกัดจะมีไข้ก่อนกลายร่าง'),
    L('carter','Thirty-eight or higher, they stay out.','สามสิบแปดองศาขึ้นไป ห้ามเข้า'),
    L('carter','And look at their eyes. Red eyes, shaking hands. That means it\'s close. Very close.','แล้วดูตาด้วย ตาแดง มือสั่น แปลว่าใกล้แล้ว ใกล้มาก'),
    cm('booth',1.2),
  ],
  people:['grace2','sofia','rossi','leo','elena','nadia'],
  evening:F=>[
    cm('radio',1.6),{run:()=>G.setTod(.94)},
    {if:F=>F.vanSeen,then:[
      L('min','A list with {S}\'s name on it? "Transferred"... to the research center?','รายชื่อที่มีชื่อ{S}เหรอ "ถูกย้ายไป"... ศูนย์วิจัยงั้นเหรอ'),
      L('min','The Haven Research Center is inside the walls, on the north side. If she\'s there, she\'s inside, {P}. Inside!','ศูนย์วิจัย Haven อยู่ในกำแพงเมือง ฝั่งเหนือ ถ้าเธออยู่ที่นั่น แปลว่าเธออยู่ข้างในแล้วนะ {P} ข้างใน!'),
      L('min','But why was she in a van with... those people?','แต่ทำไมเธอถึงอยู่ในรถตู้กับ... คนพวกนั้นล่ะ')],
     else:[
      L('min','That van today... I\'ve seen it before. Every two days. Always from the airport.','รถตู้วันนี้... ฉันเคยเห็นมาก่อน ทุกสองวัน มาจากสนามบินทุกครั้ง'),
      L('min','Nobody checks it. Nobody asks. I don\'t like it, {P}.','ไม่มีใครตรวจ ไม่มีใครถาม ฉันไม่ชอบเลย {P}')]},
    {if:F=>F.bribes>0,then:[cm('gate',1.4),N('คืนนั้น{P}ซ่อนยาของรอสซี่ไว้ใต้โต๊ะ จ่าคาร์เตอร์ไอทั้งคืน')]},
    {fade:'out'},
  ],
});
S.people.grace2=()=>F().d_grace==='no'?person({name:'Grace Okafor',look:{model:'OldClassy_Female',skin:'deep',h:1.6},voice:{f:true,pitch:.85,rate:.85,vi:1},
  id:{born:'3 Dec 1956',from:'Velmora City',no:'VL-002-7713'},temp:36.6,
  hello:[L('Grace Okafor','I\'m back, dear! A man in the camp found my card in the mud. Can you believe it?','ยายกลับมาแล้วจ้ะ! มีคนในค่ายเจอบัตรยายในโคลน เชื่อไหมล่ะ')],
  qs:[{q:'sick',a:[L('Grace Okafor','Only wet. Two nights in the rain will do that.','แค่เปียกจ้ะ นอนตากฝนมาสองคืนก็เป็นแบบนี้แหละ')]},
    {q:'arm',a:[L('Grace Okafor','Here you go. Old and wrinkly, but no bites.','นี่จ้ะ แก่แล้วก็เหี่ยว แต่ไม่มีรอยกัดนะ')]}],
  why:'มีบัตรแล้ว ไม่มีไข้ ไม่มีรอยกัด',
  after:{yes:async(F)=>{F.graceBack=true;await say1('Grace Okafor','Thank you, dear. You were right to send me away. And right to let me in.','ขอบใจนะหนู ที่ไล่ยายไปตอนนั้นก็ถูกแล้ว ที่ให้ยายเข้าวันนี้ก็ถูกแล้ว');await G.sleep(2400);}},
}):person({name:'Father Michael',look:{model:'OldClassy_Male',skin:'pale',h:1.74,tint:{Shirt:'#1a1a1a'}},voice:{pitch:.8,rate:.86,vi:1},
  id:{name:'Michael Dunne',born:'11 Nov 1960',from:'Norra',no:'VL-007-1290'},temp:36.5,
  hello:[L('Father Michael','Bless you for standing here. I\'m Father Michael. I\'ve come to help, not to be helped.','ขอพระเจ้าคุ้มครองที่คุณยืนเฝ้าที่นี่ พ่อคือบาทหลวงไมเคิล พ่อมาเพื่อช่วย ไม่ได้มาขอความช่วยเหลือ')],
  qs:[{q:'name',a:[L('Father Michael','Michael Dunne. But everyone calls me Father Michael.','ไมเคิล ดันน์ แต่ใคร ๆ ก็เรียกว่าบาทหลวงไมเคิล')]},
    {q:'sick',a:[L('Father Michael','Tired in the soul, my child. But the body is well.','เหนื่อยที่ใจน่ะลูก แต่ร่างกายยังดีอยู่')]}],
  why:'บัตรถูกต้อง ไม่มีไข้ ไม่มีรอยกัด',
});
S.people.sofia=person({name:'Sofia Marin',look:{model:'Casual3_Female',skin:'light',h:1.66,tint:{Shirt:'#5a2a2a'}},voice:{f:true,pitch:1.05,vi:1},
  id:{born:'28 Jan 2001',from:'Port Alder',no:'VL-614-0072'},temp:38.4,
  wounds:[{at:'neck',kind:'bite'}],
  hello:[L('Sofia Marin','*cough* Sorry. It\'s just the flu. I\'ve had it for days.','*ไอ* ขอโทษนะ แค่ไข้หวัดน่ะ เป็นมาหลายวันแล้ว')],
  qs:[{q:'sick',a:[L('Sofia Marin','Just a cold. Really. I\'m fine.','แค่หวัดจริง ๆ ฉันไม่เป็นไร')]},
    {q:'fever',a:[L('Sofia Marin','Since yesterday. Or... the day before. I don\'t remember.','ตั้งแต่เมื่อวาน หรือ... วันก่อนนั้น จำไม่ได้')]},
    {q:'bite',a:[L('Sofia Marin','No! God, no.','ไม่! ไม่เด็ดขาด')]},
    {q:'neck',when:D=>D.seen.has('body'),a:[L('Sofia Marin','...It was dark. Something grabbed me. I thought it was a person.','...ตอนนั้นมันมืด มีอะไรบางอย่างคว้าตัวฉัน ฉันนึกว่าเป็นคน'),L('Sofia Marin','I\'m not sick. I\'m not!','ฉันไม่ได้ป่วย ไม่ได้ป่วย!')]}],
  right:'no',inf:true,why:'ไข้ 38.4 และมีรอยกัดที่คอ',
  bye:{no:L('Sofia Marin','I just wanted a bed... one night in a real bed.','ฉันแค่อยากได้เตียง... นอนบนเตียงจริง ๆ สักคืน')},
});
S.people.rossi=person({name:'Antonio Rossi',look:{model:'Suit_Male',skin:'tan',h:1.75,tint:{Shirt:'#3a2a1a'}},voice:{pitch:.95,rate:1.08,vi:2},
  id:{born:'14 Jul 1975',from:'Velmora City',no:'VL-301-6644'},temp:36.8,
  hello:[L('Antonio Rossi','Good morning, my friend! Terrible weather, no? Antonio Rossi. Businessman.','อรุณสวัสดิ์ เพื่อนรัก! อากาศแย่จริง ๆ ว่าไหม อันโตนิโอ รอสซี่ นักธุรกิจ')],
  qs:[{q:'why',a:[L('Antonio Rossi','Business, of course. People inside need things. I bring things.','ธุรกิจสิ คนข้างในต้องการของ ผมก็เอาของมาให้')]},
    {q:'bag',a:[L('Antonio Rossi','Watches, cigarettes, and medicine. Good medicine. The best.','นาฬิกา บุหรี่ แล้วก็ยา ยาดี ๆ ดีที่สุด')]}],
  bag:[{i:'⌚',en:'watches'},{i:'🚬',en:'cigarettes'},{i:'💊',en:'antibiotics'}],
  why:'บัตรถูกต้อง ไม่มีไข้ ไม่มีรอยกัด',
  after:{yes:async()=>{await say1('Antonio Rossi','My associate is next. Be nice to him, eh?','คนถัดไปเป็นคนของผมเอง ทำดีกับเขาหน่อยนะ');await G.sleep(1800);}},
});
S.people.leo=person({name:'Leo',look:{model:'Casual_Bald',skin:'pale',h:1.83},voice:{pitch:.7,rate:.9,vi:3},
  id:null,temp:36.9,
  hello:[L('Leo','...','...'),L('rossi','Leo is with me. He lost his card. It happens, yes?','ลีโอมากับผม เขาทำบัตรหาย มันเกิดขึ้นได้ ใช่ไหม'),
    L('rossi','Listen. I have antibiotics. Real ones. You let Leo in, the medicine is yours.','ฟังนะ ผมมียาปฏิชีวนะ ของแท้ด้วย คุณให้ลีโอเข้าไป ยาเป็นของคุณ'),
    L('rossi','Your sergeant has a bad cough. He needs it more than me.','จ่าของคุณไอหนักนะ เขาต้องการมันมากกว่าผมอีก')],
  qs:[{q:'name',a:[L('Leo','Leo.','ลีโอ')]},{q:'card',a:[L('Leo','Don\'t have one.','ไม่มี')]},
    {q:'arm',a:[L('Leo','Fine. Look.','ก็ได้ ดูสิ')]}],
  special:[{k:'bribe',n:'รับยา ให้ผ่าน',c:'alt'},{k:'yes',n:'ให้เข้า',c:'yes'},{k:'no',n:'ไม่ให้เข้า',c:'no'}],inKeys:['bribe'],
  right:'no',why:'ไม่มีบัตร',
  after:{bribe:async(F)=>{F.bribes=(F.bribes||0)+1;F.medicine=true;await say1('rossi','Pleasure doing business with you.','ยินดีที่ได้ทำธุรกิจด้วยนะ');await G.sleep(1800);},
    no:async()=>{await say1('rossi','Shame. You\'ll remember this, kid.','น่าเสียดาย แล้วจะจำไว้นะ เจ้าหนู');await G.sleep(1800);}},
});
S.people.elena=person({name:'Dr. Elena Ward',look:{model:'Doctor_Female_Young',skin:'pale',h:1.7},voice:{f:true,pitch:.95,rate:.95,vi:3},
  id:{born:'2 Feb 1986',from:'Haven',no:'VL-000-0451'},temp:36.6,
  enter:async(F,D)=>{const v=place('Vehicle_Truck',2.6,0,-8.5,0,1);if(v)(D.props||(D.props=[])).push(v);},
  hello:[L('Dr. Elena Ward','Dr. Elena Ward. Velmora Health Research.','ดร.เอเลน่า วอร์ด ฝ่ายวิจัยสุขภาพแห่งเวลโมร่า'),
    L('Dr. Elena Ward','I have orders from Command. My vehicle is not to be searched.','ฉันมีคำสั่งจากกองบัญชาการ ห้ามตรวจรถของฉัน')],
  qs:[{en:"What's in the van?",th:'ในรถมีอะไร',a:[L('Dr. Elena Ward','Medical supplies. That\'s all you need to know.','เวชภัณฑ์ คุณรู้แค่นั้นก็พอ')]},
    {q:'from',a:[L('Dr. Elena Ward','The airport. We run a clinic there.','สนามบิน เราเปิดคลินิกอยู่ที่นั่น')]},
    {q:'girl',a:[L('Dr. Elena Ward','...','...'),L('Dr. Elena Ward',"I don't know anyone by that name.",'ฉันไม่รู้จักใครชื่อนั้น')]}],
  bag:[{i:'📄',en:'Command order: do not search'}],
  special:[{k:'inspect',n:'ตรวจรถ',c:'alt'},{k:'pass',n:'ปล่อยผ่าน',c:'yes'}],inKeys:['pass','inspect'],
  right:['inspect','pass'],why:'เลือกเองว่าจะเชื่อคำสั่ง หรือเชื่อตัวเอง',
  after:{inspect:async(F)=>{
      if((F.trust||0)>=3){
        await sayW('carter','Open it, Doctor. My checkpoint, my rules.','เปิดรถ คุณหมอ ด่านของผม กฎของผม');
        await camTo({p:[1.0,1.8,-4.6],l:[1.6,1.1,-8.6]},1.2);
        await sayW('','','ในรถมีคนถูกมัดอยู่สามคน ทุกคนมีรอยกัด ตาแดงก่ำ หายใจหอบ');
        await sayW('','Subject 14: {S}. Female, 17. Airport Shelter. Status: transferred.','ผู้ถูกทดลองหมายเลข 14: {S} หญิง อายุ 17 ศูนย์พักพิงสนามบิน สถานะ: ถูกย้ายแล้ว');
        await sayW('Dr. Elena Ward',"You don't understand what we're doing. We're trying to find a cure.",'คุณไม่เข้าใจหรอกว่าเรากำลังทำอะไร เรากำลังหายารักษา');
        F.vanSeen=true;await camTo('booth',1);
      }else{
        await sayW('carter','No. Let her through, {P}. That\'s an order.','ไม่ ปล่อยเธอไป {P} นี่คือคำสั่ง');F.vanTried=true;
      }},
    pass:async()=>{await G.sleep(800);}},
  leave:D=>{for(const o of D.props||[]){scene.remove(o);unsolid(o);}D.props=[];},
});
S.people.nadia=person({name:'Nadia Hassan',look:{model:'Worker_Female',skin:'brown',h:1.66},voice:{f:true,pitch:1,vi:0},
  id:{born:'5 May 1993',from:'Mirr',no:'VL-422-9010'},temp:37.6,
  hello:[L('Nadia Hassan','Hello. I work at the power plant. They called all the workers back.','สวัสดีค่ะ ฉันทำงานที่โรงไฟฟ้า เขาเรียกคนงานทุกคนกลับเข้าไป')],
  qs:[{q:'sick',a:[L('Nadia Hassan','I\'m tired, that\'s all. Thirty hours on my feet.','แค่เหนื่อยค่ะ ยืนมาสามสิบชั่วโมงแล้ว')]},
    {q:'arm',a:[L('Nadia Hassan','Go ahead. Only burns from work.','ดูเลยค่ะ มีแต่รอยไหม้จากงาน')]},
    {q:'work',a:[L('Nadia Hassan','I keep the lights on. Without us, this whole city goes dark.','ฉันทำให้ไฟไม่ดับ ถ้าไม่มีพวกเรา ทั้งเมืองจะมืดหมด')]}],
  why:'ไข้ 37.6 ยังไม่ถึง 38 ไม่มีรอยกัด',
});

/* ======================= DAY 4 ======================= */
S.days.push({
  tools:['id','permit','bag','body','temp','eyes'],newTools:['permit'],weather:'wind',tod0:.1,tod1:.78,crowd:8,quarantine:1,
  rules:[{en:'Everyone needs an ID card.',th:'ทุกคนต้องมีบัตร'},{en:'The face must match the photo.',th:'หน้าต้องตรงกับรูป'},{en:'Check arms and neck for bites.',th:'ตรวจแขนกับคอหารอยกัด'},{en:'Fever of 38°C or more: no entry.',th:'ไข้ 38 องศาขึ้นไป ห้ามเข้า'},
    {en:'Everyone needs an entry permit.',th:'ทุกคนต้องมีใบผ่าน',new:true},{en:'The permit must be valid today.',th:'ใบผ่านต้องยังไม่หมดอายุ',new:true},{en:'Quarantine tent: one person per day.',th:'เต็นท์กักตัว วันละหนึ่งคน',new:true}],
  words:['permit','valid','expired','baby','wife','son','bandage','quarantine'],
  morning:F=>[
    cm('radio',0),{fade:'in'},
    {if:F=>(F.infIn||0)>0,then:[
      L('min','Last night... the camp inside. Someone you let in turned.','เมื่อคืน... ค่ายข้างใน มีคนที่เธอปล่อยเข้าไปกลายร่าง'),
      L('min','Command is furious. From today, everyone needs a permit.','กองบัญชาการโกรธมาก ตั้งแต่วันนี้ทุกคนต้องมีใบผ่าน')],
     else:[L('min','The city is full. Command says from today, everyone needs an entry permit.','ในเมืองคนเต็มแล้ว กองบัญชาการบอกว่าตั้งแต่วันนี้ทุกคนต้องมีใบผ่าน')]},
    {if:F=>F.bribes>0,then:[L('min','Oh, and Rossi was asking about you. He called you his "friend". Be careful with him.','อ้อ รอสซี่มาถามถึงเธอด้วย เขาเรียกเธอว่า "เพื่อน" ระวังเขาไว้นะ')]},
    cm('gate',1.4),
    L('carter','Check the date on every permit. Old permits are worth nothing.','ดูวันที่ในใบผ่านทุกใบ ใบที่หมดอายุแล้วไม่มีค่าอะไรเลย'),
    L('carter','We also have one quarantine tent. One person per day. Use it well.','เรามีเต็นท์กักตัวหนึ่งหลัง วันละคนเดียว ใช้ให้ดี'),
    L('carter','Whoever goes in there... we watch them for a day. If they turn, we deal with it.','ใครเข้าไปในนั้น... เราจะเฝ้าดูหนึ่งวัน ถ้ากลายร่าง เราจัดการเอง'),
    cm('booth',1.2),
  ],
  people:['omar','hana','minjun','paul','rossi2'],
  evening:F=>[
    {if:F=>F.parkFather==='in',then:[cm('outside',1.6),{run:()=>{G.setTod(1);G.ambience('tense');}},
      N('เที่ยงคืน มีเสียงกรีดร้องดังมาจากเต็นท์ครอบครัว'),
      {run:()=>{G.SFX.scream();G.flashRed();}},wait(.6),{run:()=>{G.SFX.shot();}},wait(.3),{run:()=>{G.SFX.shot();}},
      cm('radio',0),
      L('min','Shots in the family tents! Oh God... it\'s the Parks. It\'s the Parks!','มีเสียงปืนที่เต็นท์ครอบครัว! พระเจ้า... ครอบครัวปาร์ค ครอบครัวปาร์ค!'),
      {run:()=>{F.parkTragedy=true;}}]},
    {if:F=>F.parkFather==='quar',then:[cm('gate',1.6),{run:()=>G.setTod(1)},
      N('ดึกคืนนั้น มีเสียงปืนนัดเดียวดังมาจากเต็นท์กักตัว'),{run:()=>G.SFX.shot()},
      L('carter','He turned. Alone. Nobody else got hurt.','เขากลายร่าง อยู่คนเดียว ไม่มีใครเจ็บเพิ่ม'),
      L('carter','I\'ll tell his wife in the morning. That\'s my job, not yours.','พรุ่งนี้เช้าฉันจะบอกเมียเขาเอง นั่นเป็นงานฉัน ไม่ใช่ของเธอ')]},
    {if:F=>F.parkFather==='out',then:[cm('bridge',1.6),{run:()=>G.setTod(1)},
      N('มินจุนนั่งพิงรั้วสะพานอยู่ข้างนอกประตูทั้งคืน'),
      N('ก่อนรุ่งสาง เขาลุกขึ้นยืน... แต่ไม่ใช่มินจุนอีกต่อไปแล้ว'),{run:()=>{G.SFX.groan(.3);}},wait(.8),{run:()=>{G.SFX.shot();}},
      {if:F=>F.parkIn,then:[L('sunhee','You killed him! You left him out there!','คุณฆ่าเขา! คุณทิ้งเขาไว้ข้างนอก!')]}]},
    {if:F=>F.d_hana==='no',then:[cm('bridge',1.2),N('ผู้หญิงกับลูกน้อยนั่งตัวสั่นอยู่ใต้ผ้าห่มบาง ๆ กลางสายลม')]},
    {fade:'out'},
  ],
});
S.people.omar=person({name:'Omar Farouk',look:{model:'Casual2_Male',skin:'brown',h:1.77,tint:{Shirt:'#2a3a5a'}},voice:{pitch:.9,vi:1},
  id:{born:'20 Oct 1989',from:'Kesh',no:'VL-209-5531'},permit:{until:'18 Oct 2031'},temp:36.7,
  hello:[L('Omar Farouk','Good morning. ID and permit. I waited two days in the camp for this paper.','อรุณสวัสดิ์ครับ บัตรกับใบผ่าน ผมรอในค่ายสองวันกว่าจะได้กระดาษแผ่นนี้')],
  enter:async()=>{await sayW('carter','Permit first. Check the name, the number, and the date.','ดูใบผ่านก่อน เช็กชื่อ เลขบัตร แล้วก็วันที่');},
  qs:[{q:'permit',a:[L('Omar Farouk','Yes, here. Valid until the eighteenth.','มีครับ นี่ ใช้ได้ถึงวันที่สิบแปด')]},
    {q:'arm',a:[L('Omar Farouk','Of course. Nothing there.','ได้ครับ ไม่มีอะไร')]}],
  why:'เอกสารครบ ไม่มีไข้ ไม่มีรอยกัด',
});
S.people.hana=person({name:'Hana Kowalski',look:{model:'Casual_Female',skin:'light',h:1.64,bundle:true,tint:{Shirt:'#6a5a7a'}},voice:{f:true,pitch:1.15,vi:1},
  id:{born:'8 Mar 1998',from:'Arlen',no:'VL-873-1102'},permit:null,temp:36.9,
  hello:[L('Hana Kowalski','Please. My baby has a fever. She needs a doctor.','ได้โปรด ลูกฉันเป็นไข้ เขาต้องหาหมอ'),
    L('Hana Kowalski','They told me to get a permit in the camp, but the line is three days long.','เขาบอกให้ไปทำใบผ่านในค่าย แต่คิวยาวสามวัน')],
  qs:[{q:'permit',a:[L('Hana Kowalski','No. Not yet. I tried, I really tried.','ไม่มีค่ะ ยังไม่มี ฉันพยายามแล้ว พยายามจริง ๆ')]},
    {en:'How old is your baby?',th:'ลูกอายุเท่าไหร่',a:[L('Hana Kowalski','Six months. Her name is Lily.','หกเดือนค่ะ ชื่อลิลลี่')]},
    {en:'Was the baby bitten?',th:'ลูกโดนกัดหรือเปล่า',a:[L('Hana Kowalski','No! No, it\'s a normal fever. She\'s been sick since before all this. Please.','ไม่! ไม่ใช่ ไข้ธรรมดา เขาป่วยตั้งแต่ก่อนเรื่องพวกนี้แล้ว ได้โปรด')]}],
  right:['no','quar'],why:'ไม่มีใบผ่าน',
  after:{yes:async(F)=>{F.hanaIn=true;await say1('Hana Kowalski','Thank you! Thank you! God bless you!','ขอบคุณ! ขอบคุณ! ขอพระเจ้าคุ้มครองคุณ!');await G.sleep(1800);},
    no:async(F)=>{F.hanaOut=true;await say1('Hana Kowalski','She won\'t last three days out here...','ลูกฉันไม่รอดถึงสามวันข้างนอกนี่หรอก...');await G.sleep(2200);},
    quar:async(F)=>{F.hanaQ=true;await say1('Hana Kowalski','A tent? With a doctor? Oh, thank you...','เต็นท์เหรอ มีหมอด้วยใช่ไหม ขอบคุณ...');await G.sleep(1800);}},
});
S.people.minjun=person({name:'Min-jun Park',look:{model:'Casual3_Male',skin:'light',h:1.76,bandage:'L',blood:true},voice:{pitch:.92,rate:.9,vi:2},
  id:{born:'1 Apr 1987',from:'Arlen',no:'VL-645-8802'},permit:{until:'17 Oct 2031'},temp:38.3,
  wounds:[{at:'L',kind:'bite',cover:true}],
  enter:async(F,D)=>{if(F.parkIn){const s=bystander({model:'Casual2_Female',skin:'light',h:1.62},-2.5,-.9,-2.5);const j=bystander({model:'Casual2_Male',skin:'light',h:1.12},-2.0,-.6,-2.6);D.sun=s;
      await sayW('sunhee','Min-jun! Min-jun, you made it!','มินจุน! มินจุน คุณมาถึงแล้ว!');await sayW('jae','Dad! Dad!','พ่อ! พ่อ!');}},
  hello:[L('Min-jun Park','Please. I walked for three days to get here.','ได้โปรด ผมเดินมาสามวันกว่าจะถึงที่นี่'),
    L('Min-jun Park','My wife and my boy... Sun-hee and Jae Park. Are they here?','เมียกับลูกผม... ซันฮีกับแจ ปาร์ค พวกเขาอยู่ที่นี่ไหม')],
  qs:[{q:'armwhat',a:[L('Min-jun Park',"It's nothing. I cut it on a fence. Look, it's not a bite.",'ไม่มีอะไรหรอก โดนรั้วบาดน่ะ ดูสิ มันไม่ใช่รอยกัด')]},
    {q:'fever',a:[L('Min-jun Park','It\'s the walk. Three days. Anyone would be hot.','เพราะเดินมาสามวันน่ะ ใครเดินขนาดนั้นก็ตัวร้อนทั้งนั้น')]},
    {q:'bandage',when:D=>D.seen.has('body'),reveal:true,a:[L('Min-jun Park','...Please. Don\'t make me. Not in front of my son.','...ได้โปรด อย่าบังคับผมเลย ไม่ใช่ต่อหน้าลูกผม'),
      N('มินจุนค่อย ๆ แกะผ้าพันแผลออก ใต้ผ้าเป็นรอยฟันครบทั้งแถว'),
      L('Min-jun Park','It happened last night. In the dark. I just wanted to see them one more time.','มันเกิดเมื่อคืน ในความมืด ผมแค่อยากเห็นหน้าพวกเขาอีกสักครั้ง')]}],
  right:['no','quar'],inf:true,why:'ไข้ 38.3 แผลใต้ผ้าเป็นรอยกัด',
  after:{yes:async(F)=>{F.parkFather='in';await say1('Min-jun Park','Thank you... thank you.','ขอบคุณ... ขอบคุณครับ');await G.sleep(1800);},
    no:async(F,D)=>{F.parkFather='out';if(F.parkIn){await sayW('sunhee','No! No, please! He\'s my husband!','ไม่! ไม่นะ ได้โปรด! เขาเป็นสามีฉัน!');}
      await say1('Min-jun Park','It\'s okay. It\'s okay, Sun-hee. Take care of Jae.','ไม่เป็นไร ไม่เป็นไรนะซันฮี ดูแลแจด้วย');await G.sleep(2400);},
    quar:async(F)=>{F.parkFather='quar';if(F.parkIn)await sayW('sunhee','Quarantine? He\'ll be okay? He\'ll be okay, right?','กักตัวเหรอ เขาจะไม่เป็นไรใช่ไหม เขาจะไม่เป็นไรใช่ไหม');
      await say1('carter','...We\'ll see.','...ต้องดูกันไป');await G.sleep(1800);}},
});
S.people.paul=person({name:'Paul Grant',look:{model:'OldClassy_Male',skin:'pale',h:1.76,tint:{Shirt:'#4a4a3a'}},voice:{pitch:.88,rate:.9,vi:0},
  id:{born:'30 Jun 1958',from:'Velmora City',no:'VL-126-4410'},permit:{until:'14 Oct 2031'},temp:36.4,
  hello:[L('Paul Grant','Paul Grant. Here are my papers. They\'re all in order, I assure you.','พอล แกรนต์ นี่เอกสารของผม ครบถ้วนทุกอย่าง รับรองได้')],
  qs:[{q:'expired',a:[L('Paul Grant','Expired? That\'s impossible. They gave it to me yesterday!','หมดอายุเหรอ เป็นไปไม่ได้ เขาเพิ่งให้ผมมาเมื่อวานนี้เอง!')]},
    {q:'why',a:[L('Paul Grant','I have an apartment inside. I simply want to go home.','ผมมีอพาร์ตเมนต์อยู่ข้างใน ผมแค่อยากกลับบ้าน')]}],
  right:'no',why:'ใบผ่านหมดอายุ 14 ต.ค.',
  bye:{no:L('Paul Grant','This is ridiculous. I\'ll be back with a new one.','ไร้สาระสิ้นดี เดี๋ยวผมจะกลับมาพร้อมใบใหม่')},
});
S.people.rossi2=()=>person({name:'Antonio Rossi',look:{model:'Suit_Male',skin:'tan',h:1.75,tint:{Shirt:'#3a2a1a'}},voice:{pitch:.95,rate:1.08,vi:2},
  id:{born:'14 Jul 1975',from:'Velmora City',no:'VL-301-6644'},permit:{until:'20 Oct 2031',seal:false},temp:36.8,
  hello:F().bribes?[L('Antonio Rossi','My friend! We do business again, yes?','เพื่อนรัก! เราทำธุรกิจกันอีกรอบดีไหม'),L('Antonio Rossi','Food for your friends inside. Cigarettes for the sergeant. You just stamp, I just walk.','อาหารให้เพื่อน ๆ คุณข้างใน บุหรี่ให้จ่า คุณแค่ประทับตรา ผมก็แค่เดินเข้าไป')]
    :[L('Antonio Rossi','Hello again. See? A permit. All official.','สวัสดีอีกครั้ง เห็นไหม ใบผ่าน ถูกต้องทุกอย่าง')],
  qs:[{q:'permit',a:[L('Antonio Rossi','Right there. Valid until the twentieth.','อยู่นี่ ใช้ได้ถึงวันที่ยี่สิบ')]},
    {en:'There is no stamp on this permit.',th:'ใบผ่านนี้ไม่มีตราประทับ',when:D=>D.seen.has('permit'),a:[L('Antonio Rossi','Stamp, no stamp... it\'s paper, my friend. Paper is paper.','มีตรา ไม่มีตรา... มันก็แค่กระดาษเพื่อนรัก กระดาษก็คือกระดาษ')]}],
  special:[{k:'bribe',n:'รับของ ให้ผ่าน',c:'alt'},{k:'yes',n:'ให้เข้า',c:'yes'},{k:'no',n:'ไม่ให้เข้า',c:'no'}],inKeys:['bribe'],
  right:'no',why:'ใบผ่านไม่มีตราประทับ',
  after:{bribe:async(F)=>{F.bribes=(F.bribes||0)+1;await say1('Antonio Rossi','I knew you were smart.','รู้อยู่แล้วว่าคุณฉลาด');await G.sleep(1600);},
    no:async()=>{await say1('Antonio Rossi','You\'re making a big mistake, kid. Big.','คุณกำลังทำพลาดครั้งใหญ่ เจ้าหนู ใหญ่มาก');await G.sleep(1800);}},
});

/* ======================= DAY 5 ======================= */
S.days.push({
  tools:['id','permit','bag','body','temp','eyes'],weather:'smoke',tod0:.55,tod1:.92,crowd:12,quarantine:1,timer:240,last:true,quiz:false,
  rules:[{en:'Everyone needs an ID card.',th:'ทุกคนต้องมีบัตร'},{en:'The face must match the photo.',th:'หน้าต้องตรงกับรูป'},{en:'Check arms and neck for bites.',th:'ตรวจแขนกับคอหารอยกัด'},{en:'Fever of 38°C or more: no entry.',th:'ไข้ 38 องศาขึ้นไป ห้ามเข้า'},
    {en:'Everyone needs an entry permit.',th:'ทุกคนต้องมีใบผ่าน'},{en:'The permit must be valid today.',th:'ใบผ่านต้องยังไม่หมดอายุ'},{en:'The gate closes at sunset.',th:'ประตูปิดตอนพระอาทิตย์ตก',new:true}],
  words:['horde','hurry','bracelet','sunset','gate'],
  morning:F=>[
    cm('radio',0),{fade:'in'},
    {if:F=>F.parkTragedy,then:[L('min','Min-jun turned at midnight. He bit Sun-hee before the soldiers came.','มินจุนกลายร่างตอนเที่ยงคืน เขากัดซันฮีก่อนทหารจะมาถึง'),
      L('min','Jae is alive. He saw everything. He hasn\'t said a word since.','แจยังรอด เขาเห็นทุกอย่าง ตั้งแต่นั้นเขาก็ไม่พูดอะไรอีกเลย')]},
    {if:F=>F.parkFather==='quar'&&F.parkIn,then:[L('min','Carter told Sun-hee about her husband. She just held Jae and didn\'t let go.','จ่าบอกซันฮีเรื่องสามีแล้ว เธอแค่กอดแจไว้แน่น ไม่ยอมปล่อย')]},
    {if:F=>F.hanaOut,then:[L('min','They found a woman and a baby on the bridge this morning. They... didn\'t make it.','เช้านี้เขาเจอผู้หญิงกับเด็กอ่อนบนสะพาน พวกเขา... ไม่รอด')]},
    {if:F=>F.hanaIn||F.hanaQ,then:[L('min','Good news, at least. Hana\'s baby is getting better. The doctor says it was just an ear infection.','อย่างน้อยก็มีข่าวดี ลูกของฮาน่าอาการดีขึ้น หมอบอกว่าแค่หูอักเสบ')]},
    L('min','And... drones saw a horde. Thousands of them. Ten kilometers away.','แล้วก็... โดรนเห็นฝูงซอมบี้ เป็นพัน ๆ ตัว ห่างไปสิบกิโลเมตร'),
    L('min','They\'ll hit the bridge before sunset.','มันจะถึงสะพานก่อนพระอาทิตย์ตก'),
    cm('gate',1.4),{run:()=>{G.ambience('tense');}},
    L('carter','We take who we can. When I say close, we close. For good.','เรารับคนได้เท่าไหร่ก็เท่านั้น พอฉันสั่งปิด เราปิด ปิดถาวร'),
    L('carter','Work fast, {P}. But don\'t work stupid.','ทำงานให้ไว {P} แต่อย่าทำแบบโง่ ๆ'),
    cm('booth',1.2),{run:()=>G.heart(true)},
  ],
  people:['jack','ben','maria','sam'],
  between:{},
  onTimeUp:(F,D)=>{G.toast('หมดเวลา!',2000);},
  evening:F=>hordeScene(F),
});
S.people.jack=person({name:'Jack Doyle',look:{model:'Worker_Male',skin:'pale',h:1.79,tint:{Shirt:'#5a4a2a'}},voice:{pitch:1,rate:1.15,vi:3},
  id:{born:'17 Sep 1991',from:'Sell Bay',no:'VL-588-3307'},permit:{until:'19 Oct 2031'},temp:36.9,
  hello:[L('Jack Doyle','Let\'s go, let\'s go. You hear that? They\'re coming.','เร็วเข้า เร็วเข้า ได้ยินไหม พวกมันกำลังมา')],
  bag:[{i:'🔫',en:'pistol (empty)'},{i:'🥫',en:'beans'},{i:'📿',en:'silver bracelet with an elephant',flag:'braceletSeen'}],
  qs:[{q:'bag',a:[L('Jack Doyle','Stuff. Food. A gun, but it\'s empty, I swear.','ของจิปาถะ อาหาร มีปืนด้วยแต่ไม่มีลูก สาบานเลย')]},
    {en:'Where did you get this bracelet?',th:'ได้สร้อยข้อมือนี้มาจากไหน',when:D=>P.F.braceletSeen,a:[L('Jack Doyle','That? Traded it at the airport. A Thai girl. She gave it to me for a can of beans.','อันนั้นน่ะเหรอ แลกมาที่สนามบิน เด็กผู้หญิงไทย เธอเอามาแลกถั่วกระป๋องเดียว'),
      N('สร้อยข้อมือรูปช้างตัวเล็ก... อันที่{P}ซื้อให้{S}ในวันเกิดปีที่แล้ว')],then:()=>{P.F.braceletClue=true;}},
    {en:'Was she okay? Where did she go?',th:'เธอปลอดภัยไหม ไปไหนต่อ',when:D=>P.F.braceletClue,a:[L('Jack Doyle','She looked scared. Some doctors came in a van and took a group of kids. She went with them.','ดูกลัว ๆ มีหมอกลุ่มหนึ่งมากับรถตู้ แล้วพาเด็กกลุ่มหนึ่งไป เธอไปกับพวกนั้น'),
      L('Jack Doyle','Look, I\'m sorry. Can I go now? Please?','ขอโทษนะ ผมไปได้หรือยัง ได้โปรด')]}],
  why:'เอกสารครบ ไม่มีไข้ ไม่มีรอยกัด',
});
S.people.ben=person({name:'Ben Torres',look:{model:'Casual2_Male',skin:'tan',h:1.62,eyes:'red',shake:true,tint:{Shirt:'#2a2a2a'}},voice:{pitch:1.2,rate:.85,vi:0},
  id:{born:'3 Mar 2015',from:'Kesh',no:'VL-912-6650'},permit:{until:'19 Oct 2031'},temp:39.1,eyesRed:true,
  wounds:[{at:'neck',kind:'bite'}],
  enter:async(F,D)=>{const m=bystander({model:'Casual2_Female',skin:'tan',h:1.64,tint:{Shirt:'#7a3a2a'}},-.3,-2.4,.6);D.maria=m;
    await sayW('maria','Please, he\'s just tired! He\'s only sixteen!','ได้โปรด เขาแค่เหนื่อย! เขาเพิ่งสิบหกเอง!');},
  hello:[L('Ben Torres','Mom... I don\'t feel good.','แม่... ผมรู้สึกไม่ค่อยดี')],
  qs:[{q:'sick',a:[L('Ben Torres','Everything is... loud. And hot. So hot.','ทุกอย่างมัน... ดัง แล้วก็ร้อน ร้อนมาก')]},
    {q:'neck',when:D=>D.seen.has('body'),a:[L('Ben Torres','A man grabbed me this morning. At the camp. I pushed him off. I\'m fine...','ผู้ชายคนหนึ่งคว้าตัวผมเมื่อเช้า ที่ค่าย ผมผลักเขาออกไป ผมไม่เป็นไร...'),L('maria','It\'s nothing! It\'s nothing!','ไม่มีอะไร! ไม่มีอะไรหรอก!')]}],
  right:['no','quar'],inf:true,why:'ไข้ 39.1 ตาแดง มือสั่น รอยกัดที่คอ',
  after:{no:async(F,D)=>{await sayW('maria','Then I stay with him. I\'m not leaving my son.','งั้นฉันจะอยู่กับเขา ฉันไม่ทิ้งลูก');F.benOut=true;if(D.maria)walk(D.maria,[[1.0,-3.4],[0.8,-9],[0.5,-16]]);await G.sleep(1200);},
    quar:async(F,D)=>{F.benQ=true;await sayW('maria','A tent? I can see him? Okay... okay.','เต็นท์เหรอ ฉันไปหาเขาได้ใช่ไหม โอเค... โอเค');},
    yes:async(F,D)=>{
      // he turns right there, inside the checkpoint
      const b=D.cur.actor;await walk(b,[[-.4,-1.6],[-1.6,-1.1]]);G.play(b,'Death',{once:true});await say1('maria','Ben? Ben!','เบน? เบน!');await G.sleep(1500);
      const z=makeActor({zombie:true,model:'Zombie_Arm',h:1.62});z.obj.position.copy(b.obj.position);removeActor(b);D.cur.gone=true;(D.extra||(D.extra=[])).push(z);
      G.SFX.groan(.4);await camTo({p:[.4,1.6,-.2],l:[-1.6,1.1,-1.5]},.4);
      if(D.maria)await maul(z,D.maria);G.splatter(24);G.flashRed();
      await shootDown(z,G.STAFF.carter);F.benTurned=true;
      await sayW('carter','{P}! He had a fever of thirty-nine! What were you thinking?!','{P}! เขาไข้สามสิบเก้าองศา! เธอคิดอะไรอยู่!');await camTo('booth',.8);}},
});
S.people.maria=()=>(F().benOut||F().benTurned)?null:person({name:'Maria Torres',look:{model:'Casual2_Female',skin:'tan',h:1.64,tint:{Shirt:'#7a3a2a'}},voice:{f:true,pitch:1.05,vi:1},
  id:{born:'22 Aug 1985',from:'Kesh',no:'VL-912-6649'},permit:{until:'19 Oct 2031'},temp:36.8,
  enter:async(F,D)=>{if(D.maria){removeActor(D.maria);D.maria=null;}},
  hello:[L('Maria Torres','Please. Just tell me he\'ll be safe in there.','ได้โปรด บอกฉันทีว่าเขาจะปลอดภัยในนั้น')],
  qs:[{q:'arm',a:[L('Maria Torres','Look. Look! I\'m clean. Just let me be near my son.','ดูสิ ดูสิ! ฉันไม่มีแผล ขอแค่ให้ฉันได้อยู่ใกล้ลูก')]}],
  why:'เอกสารครบ ไม่มีไข้ ไม่มีรอยกัด',
});
S.people.sam=person({name:'Samuel Okoye',look:{model:'Casual_Male',skin:'dark',h:1.82,tint:{Shirt:'#7a6a2a'}},voice:{pitch:.85,vi:2},
  id:{born:'9 Jan 1994',from:'Port Alder',no:'VL-402-7718'},permit:{until:'21 Oct 2031'},temp:37.1,
  hello:[L('Samuel Okoye','I ran the last two kilometers. They\'re right behind the hill. Please!','ผมวิ่งมาสองกิโลสุดท้าย พวกมันอยู่หลังเนินนั่นเอง ได้โปรด!')],
  qs:[{q:'arm',a:[L('Samuel Okoye','Here! Nothing! Look fast!','นี่! ไม่มีอะไร! ดูเร็ว ๆ!')]}],
  why:'เอกสารครบ ไม่มีไข้ ไม่มีรอยกัด',
});

/* ======================= THE HORDE AND THE ENDINGS ======================= */
function hordeScene(F){return [
  {run:()=>{G.heart(true);G.setTod(.95);G.ambience('tense');}},
  cm('far',1.4),
  N('ฝุ่นตลบขึ้นที่ปลายสะพาน แล้วเสียงคำรามนับพันก็ดังตามมา'),
  run(async()=>{const D=G.D;const zs=[];for(let i=0;i<16;i++){const z=zombie(rnd(-3.4,3.4),rnd(-58,-70),pick(['Zombie_Basic','Zombie_Chubby','Zombie_Ribcage','Zombie_Arm']));if(z){zs.push(z);walk(z,[[rnd(-3,3),-12]],{run:true,speed:rnd(.9,1.3)});}}D.horde=zs;}),
  cm('bridge',1.2),
  L('carter','CLOSE THE GATE! NOW!','ปิดประตู! เดี๋ยวนี้!'),
  run(async()=>{G.gateTo(false,.6);G.SFX.gate();const D=G.D;
    for(const c of D.crowd.slice(0,10)){walk(c,[[rnd(-3,3),-3.5]],{run:true,speed:rnd(.9,1.2)});}
    await G.sleep(2200);G.SFX.scream();
    const zs=D.horde||[];for(let i=0;i<Math.min(zs.length,D.crowd.length,8);i++){maul(zs[i],D.crowd[i]);await G.sleep(260);}
    await G.sleep(1600);}),
  N('คนที่ยังต่อคิวอยู่ข้างนอกไม่มีใครรอดเลยสักคน'),
  run(async()=>{const C=G.STAFF.carter;for(let i=0;i<6;i++){const zs=(G.D.horde||[]).filter(z=>!z.dead);if(!zs.length)break;await shootDown(zs[0],i%2&&G.STAFF.diaz&&G.STAFF.diaz.obj.visible?G.STAFF.diaz:C);}}),
];}
STORY.ending=F=>{
  const sold=(F.bribes||0)>=2,outbreak=(F.infIn||0)>=2,broken=(F.innDenied||0)>=4;
  const id=sold?'sold':outbreak?'outbreak':broken?'broken':'holds';
  const clue=F.vanSeen||F.braceletClue;
  const radio=[cm('radio',1.6),{run:()=>{G.setTod(1);G.heart(false);G.SFX.radio();}},
    N('คืนนั้น วิทยุดังขึ้นท่ามกลางเสียงซ่า'),
    L('radio','This is Airport Shelter... anyone... can anyone hear...','ที่นี่ศูนย์พักพิงสนามบิน... ใครก็ได้... มีใครได้ยินไหม...'),
    {run:()=>G.SFX.radio()},
    clue?N('"...พี่{P}... ถ้าได้ยิน... เขาจะพาหนูไปที่ศูนย์วิจัย... ช่วยด้วย..."'):N('"...พี่{P}..."'),
    N(clue?'เสียงของ{S} ชัดเจน ไม่ผิดแน่':'เสียงขาดหายไป แต่{P}จำเสียงนั้นได้... เสียงของ{S}'),
    {fade:'out'},{title:'จบบทที่ 1',sub:'ด่าน 7',t:3}];
  const E={
    holds:{n:'ด่านยังยืน',d:'ด่าน 7 รอดคืนนั้นมาได้ ทุกคนเชื่อใจ{P}',steps:[
      cm('gate',1.4),N('ประตูเหล็กรับแรงกระแทกได้ทั้งคืน จ่าคาร์เตอร์ถูกกัดเฉียดขา แต่ยังรอด'),
      L('carter','You did good, {P}. Better than good.','เธอทำได้ดี {P} ดีกว่าดีอีก'),
      L('carter','Min found the airport channel. Take it. Go find your sister.','มินหาคลื่นวิทยุของสนามบินเจอแล้ว เอาไป ไปตามหาน้องสาวเธอ'),...radio]},
    outbreak:{n:'เชื้อในค่าย',d:'คนติดเชื้อที่{P}ปล่อยเข้าไป ทำให้ค่ายแตกจากข้างใน',steps:[
      cm('radio',1),{run:()=>{G.SFX.scream();G.flashRed();}},
      N('ขณะที่ทุกคนจ้องไปที่ฝูงข้างนอก เสียงกรีดร้องกลับดังมาจากข้างในค่าย'),
      L('min','{P}! They\'re inside! They\'re— ','{P}! พวกมันอยู่ข้างใน! พวกมัน— '),
      {run:()=>{G.splatter(30);G.SFX.scream();}},wait(1),
      N('มินไม่ทันได้พูดจบ'),
      L('carter','Take the radio and GO! Back door! GO!','เอาวิทยุไป แล้วหนี! ประตูหลัง! ไป!'),...radio]},
    broken:{n:'ประตูแตก',d:'คนที่ถูกไล่ไปทนไม่ไหว พังประตูเข้ามาพร้อมฝูงซอมบี้',steps:[
      cm('gate',1),N('คนนับร้อยที่ถูกปฏิเสธมาทั้งสัปดาห์ ดันประตูพร้อมกันด้วยความกลัว'),{run:()=>{G.SFX.gate();G.SFX.scream();}},
      N('บานพับหลุด ฝูงซอมบี้ไหลเข้ามาตามหลังพวกเขา'),
      L('carter','I\'ll hold them! Get Min out of here!','ฉันจะยันพวกมันไว้! พามินออกไป!'),{run:()=>{G.splatter(26);G.flashRed();}},
      N('เสียงปืนของจ่าคาร์เตอร์ดังอยู่อีกนาน... แล้วก็เงียบไป'),...radio]},
    sold:{n:'ด่านที่ขายได้',d:'จ่าคาร์เตอร์รู้เรื่องสินบน และไล่{P}ออกจากด่าน',steps:[
      cm('gate',1.2),L('carter','Rossi told everyone. "The volunteer at Seven takes good payment."','รอสซี่เล่าให้ทุกคนฟัง "อาสาที่ด่านเจ็ดรับของดีนะ"'),
      L('carter','You sold my gate, {P}. Get out. You\'re done here.','เธอขายประตูของฉัน {P} ออกไป เธอไม่ต้องอยู่ที่นี่อีกแล้ว'),
      N('{P}ถูกโยนออกไปที่ค่ายนอกเมือง ก่อนฝูงซอมบี้จะมาถึงไม่กี่นาที'),
      N('{P}มุดเข้าไปซ่อนใต้รถบรรทุกพัง ฟังเสียงกรีดร้องอยู่ทั้งคืน ในกระเป๋ามีวิทยุเครื่องเล็กของมิน'),...radio]},
  };
  return Object.assign({id},E[id]);
};
STORY.epilogue=F=>{
  const t=[];
  if(F.parkFather==='in')t.push(F.parkIn?'มินจุนกลายร่างในเต็นท์ครอบครัว แจรอดคนเดียว':'มินจุนกลายร่างในค่าย');
  if(F.parkFather==='quar')t.push(F.parkIn?'มินจุนตายในเต็นท์กักตัว ซันฮีกับแจปลอดภัย':'มินจุนตายในเต็นท์กักตัว ไม่มีใครเจ็บเพิ่ม');
  if(F.parkFather==='out')t.push(F.parkIn?'มินจุนกลายร่างนอกประตู ต่อหน้าครอบครัว':'มินจุนกลายร่างบนสะพาน');
  if(F.parkOut)t.push('ซันฮีกับแจต้องนอนข้างนอกด่าน');
  if(F.hanaOut)t.push('ฮาน่ากับลูกไม่รอดบนสะพาน');
  if(F.hanaIn||F.hanaQ)t.push('ลูกของฮาน่าหายป่วย');
  if(F.gate==='late')t.push('ดิอาซถูกกัดที่ประตู และไม่ได้กลับมาอีก');
  if(F.gate==='early')t.push('สองคนตายหน้าประตูที่ปิดเร็วเกินไป');
  if(F.gate==='ok')t.push('ปิดประตูทันเวลา ทุกคนรอด');
  if(F.d_victor==='yes')t.push('วิกเตอร์กลายร่างในศูนย์พักพิง');
  if(F.d_sofia==='yes')t.push('โซเฟียกลายร่างในค่าย');
  if(F.benTurned)t.push('เบนกลายร่างในด่าน ต่อหน้าแม่ของเขา');
  if(F.graceIn||F.graceBack)t.push('ยายเกรซได้เจอลูกสาว');
  if(F.vanSeen)t.push('รู้แล้วว่า{S}ถูกย้ายไปศูนย์วิจัย');
  else if(F.vanTried)t.push('จ่าไม่ยอมให้ตรวจรถตู้');
  if(F.braceletClue)t.push('ได้สร้อยข้อมือของ{S}คืนมา');
  if(F.bribes)t.push(`รับสินบนจากรอสซี่ ${F.bribes} ครั้ง`);
  return t;
};
