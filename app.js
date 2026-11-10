/* ===== AI-generated slide animation engine =====
   Cursors: 0 gold=title, 1 green=text, 2 brick=card/frame, 3 blue=illustration, 4 purple=decoration, 5 pink=aux text */
(()=>{
const COL=['#E0A500','#3FA34D','#B8452E','#3B8BE0','#8A4FD6','#E55A9A'];
const ROLE={t:0,x:1,b:2,i:3,d:4,a:5};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const R=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const raf=()=>new Promise(r=>requestAnimationFrame(r));
const stage=$('#stage'),ov=$('#ov'),cl=$('#cur'),stat=$('#stat'),dotsEl=$('#dots');
let W=0,H=0,tok=0,cur=-1,CUR=[];
const S=$$('.slide').map(el=>({el,jobs:[],obs:[],gather:null,sl:[],prep:false}));
for(const k in IMG)$$('img[data-a="'+k+'"]').forEach(i=>i.src=IMG[k]);
const gSeg=window.Intl&&Intl.Segmenter?new Intl.Segmenter('th',{granularity:'grapheme'}):null;
const wSeg=window.Intl&&Intl.Segmenter?new Intl.Segmenter('th',{granularity:'word'}):null;
const graphemes=s=>gSeg?[...gSeg.segment(s)].map(x=>x.segment):[...s];
const words=s=>wSeg?[...wSeg.segment(s)].filter(x=>x.isWordLike).map(x=>[x.index,x.index+x.segment.length]):[];

function fit(){const vw=innerWidth,vh=innerHeight;W=Math.min(vw,vh*16/9);H=W*9/16;
  stage.style.width=W+'px';stage.style.height=H+'px';stage.style.setProperty('--u',W/100+'px');}
const sr=()=>stage.getBoundingClientRect();
const rel=(r,s)=>{s=s||sr();return{x:r.left-s.left,y:r.top-s.top,w:r.width,h:r.height}};
const div=(cls,css)=>{const d=document.createElement('div');d.className=cls;if(css)d.style.cssText=css;ov.append(d);return d};
const pos=c=>({x:gsap.getProperty(c.e,'x'),y:gsap.getProperty(c.e,'y')});

/* generic progress tween bound to the current slide token (dies on page change) */
function anim(dur,upd,o={}){return new Promise(res=>{const my=tok,p={t:0};
  const tw=gsap.to(p,{t:1,duration:dur,delay:o.delay||0,ease:o.ease||'sine.inOut',
    onStart:()=>{if(o.start)o.start()},
    onUpdate:()=>{if(my!==tok){tw.kill();return}upd(p.t)},
    onComplete:()=>{if(my===tok)res()}})})}

/* human-like move: quadratic bezier from the cursor's real position (read in onStart) */
function mv(c,tx,ty,o={}){
  const g=pos(c),d=Math.hypot(tx-g.x,ty-g.y);
  let dur=o.dur||(.42+Math.min(d/(W*1.1),1)*1.0);if(c.slow){dur*=1.6;c.slow=false}
  let x0,y0,cx,cy;
  return anim(dur,t=>{const a=(1-t)*(1-t),b=2*(1-t)*t,e=t*t;
      gsap.set(c.e,{x:a*x0+b*cx+e*tx,y:a*y0+b*cy+e*ty})},
    {delay:o.delay==null?R(.04,.16):o.delay,ease:d>W*.2?'power3.inOut':'power2.out',
     start:()=>{const q=pos(c);x0=q.x;y0=q.y;const dx=tx-x0,dy=ty-y0,L=Math.hypot(dx,dy)||1,k=R(.04,.14)*L*(Math.random()<.5?-1:1);
       cx=(x0+tx)/2-dy/L*k;cy=(y0+ty)/2+dx/L*k}});
}
async function click(c){
  gsap.fromTo(c.e.firstChild,{scale:1},{scale:.78,duration:.07,yoyo:true,repeat:1,transformOrigin:'0 0'});
  const p=pos(c),r=div('rip','left:'+p.x+'px;top:'+p.y+'px;border-color:'+c.c);
  gsap.set(r,{xPercent:-50,yPercent:-50});
  gsap.fromTo(r,{scale:.2,opacity:.8},{scale:1.7,opacity:0,duration:.55,ease:'power2.out',onComplete:()=>r.remove()});
  await sleep(150);
}
function mkFrame(c,rad){const f=div('frame','border-color:'+c.c+';border-radius:'+(rad||0)+'px');
  for(const p of ['tl','tr','bl','br']){const h=document.createElement('i');h.className='hd '+p;h.style.borderColor=c.c;f.append(h)}return f}
const setBox=(f,x,y,w,h)=>{f.style.left=x+'px';f.style.top=y+'px';f.style.width=w+'px';f.style.height=h+'px'};
const fade=(els,d,delay)=>gsap.to(els,{opacity:0,duration:d,delay:delay||0,onComplete:()=>els.forEach&&els.forEach(e=>e.remove())});

/* ---------- job executors ---------- */
const EX={};
/* typing: t(title) x(text) a(aux) */
EX.t=EX.x=EX.a=async(c,j,my)=>{
  const nodes=j.nodes.filter(o=>o.s.length);if(!nodes.length)return;
  const total=nodes.reduce((a,o)=>a+o.s.length,0),cps=total>300?R(300,360):R(200,240);
  const o0=nodes[0],i0=Math.max(0,o0.s.search(/\S/));
  o0.n.nodeValue=o0.s;const rg=document.createRange();rg.setStart(o0.n,i0);rg.setEnd(o0.n,i0+1);
  const q=rel(rg.getBoundingClientRect());o0.n.nodeValue='';
  await mv(c,q.x,q.y+q.h*.7);await click(c);
  const caret=document.createElement('span');caret.className='caret';caret.style.setProperty('--c',c.c);o0.n.after(caret);
  for(let k=0;k<2;k++){caret.style.opacity=1;await sleep(80);caret.style.opacity=0;await sleep(70)}
  caret.style.opacity=1;
  const uls=[0,1,2].map(()=>div('ul','display:none'));
  let sp=1,sched=performance.now();
  const follow=()=>{const cr=caret.getBoundingClientRect(),s0=sr(),el=j.el;
    if(el.scrollHeight>el.clientHeight+2){const er=el.getBoundingClientRect();if(cr.bottom>er.bottom-8)el.scrollTop+=cr.bottom-er.bottom+cr.height*1.3}
    const c2=caret.getBoundingClientRect();c.qx(c2.left-s0.left+4);c.qy(c2.bottom-s0.top+3)};
  const ul=(o,a,len)=>{if(a==null){uls.forEach(u=>u.style.display='none');return}
    const r2=document.createRange();r2.setStart(o.n,a);r2.setEnd(o.n,len);
    const rs=[...r2.getClientRects()].filter(z=>z.width>1),s0=sr();
    uls.forEach((u,i)=>{const z=rs[i];if(!z){u.style.display='none';return}
      u.style.cssText='display:block;left:'+(z.left-s0.left)+'px;top:'+(z.bottom-s0.top-1)+'px;width:'+z.width+'px;background:'+c.c})};
  for(const o of nodes){
    const p=o.n.parentElement.closest('p,.row'),bu=p&&p.querySelector('.bu');if(bu)bu.style.opacity=1;
    o.n.after(caret);
    const gs=graphemes(o.s),ws=words(o.s);let len=0,gi=0;
    while(gi<gs.length){
      if(my!==tok)return;
      const now=performance.now();
      while(gi<gs.length&&sched<=now){const g=gs[gi++];len+=g.length;sp=clamp(sp+R(-.07,.07),.7,1.45);
        let d=1000/cps/sp;if(/[\s,.;:!?”“)(]/.test(g))d+=R(35,110);if(Math.random()<.012)d+=R(250,650);sched+=d}
      o.n.nodeValue=o.s.slice(0,len);
      const w=ws.find(z=>z[0]<len&&len<=z[1]);ul(o,w?w[0]:null,len);
      follow();await raf();
    }
    ul(o,null);
  }
  for(let k=0;k<2;k++){caret.style.opacity=0;await sleep(110);caret.style.opacity=1;await sleep(110)}
  caret.remove();uls.forEach(u=>u.remove());
};
/* card / frame: guides -> drag-to-size with clip-path reveal */
EX.b=async(c,j,my)=>{
  const r=j.r,rad=parseFloat(getComputedStyle(j.el).borderTopLeftRadius)||0;
  await mv(c,r.x,r.y);
  const gv=div('gd','left:'+r.x+'px;top:0;width:1px;height:100%;background:'+c.c),gh=div('gd','left:0;top:'+r.y+'px;height:1px;width:100%;background:'+c.c);
  gsap.fromTo([gv,gh],{opacity:0},{opacity:.7,duration:.15});
  await sleep(140);await click(c);
  const f=mkFrame(c,rad),lb=div('lb','background:'+c.c);setBox(f,r.x,r.y,0,0);
  await anim(.7+(r.w+r.h)/W*.7,t=>{const w=r.w*t,h=r.h*Math.pow(t,.92);
    setBox(f,r.x,r.y,w,h);j.el.style.clipPath='inset(0 '+(r.w-w)+'px '+(r.h-h)+'px 0 round '+rad+'px)';
    gsap.set(c.e,{x:r.x+w,y:r.y+h});lb.textContent=Math.round(w)+' × '+Math.round(h);lb.style.left=(r.x+w+14)+'px';lb.style.top=(r.y+h+16)+'px'},{ease:'power3.inOut'});
  j.el.style.clipPath='none';lb.remove();
  fade([gv,gh],.25);fade([f],.35,.7);
};
/* illustration: drag in from outside the screen, then resize from the corner handle */
EX.i=async(c,j,my)=>{
  const r=j.r,el=j.el,cx=r.x+r.w/2,cy=r.y+r.h/2,m=Math.min(cx,W-cx,cy,H-cy);
  let dx=0,dy=0;if(m===cx)dx=-(r.x+r.w+24);else if(m===W-cx)dx=W-r.x+24;else if(m===cy)dy=-(r.y+r.h+24);else dy=H-r.y+24;
  gsap.set(el,{x:dx,y:dy,opacity:1,scale:.84,transformOrigin:'0 0'});
  const f=mkFrame(c,0),lb=div('lb','background:'+c.c);
  const sync=(tx,ty,s)=>{setBox(f,r.x+tx,r.y+ty,r.w*s,r.h*s);const bx=r.x+tx+r.w*s,by=r.y+ty+r.h*s;lb.textContent=Math.round(r.w*s)+' × '+Math.round(r.h*s);lb.style.left=(bx+14)+'px';lb.style.top=(by+16)+'px'};
  sync(dx,dy,.84);
  await mv(c,cx+dx,cy+dy);await click(c);
  const mx=(dx)/2+R(-1,1)*Math.abs(dy+dx)*.1,my2=dy/2+R(-.12,.12)*Math.abs(dx+dy);
  await anim(.9+Math.hypot(dx,dy)/W*.9,t=>{const a=(1-t)*(1-t),b=2*(1-t)*t,tx=a*dx+b*mx,ty=a*dy+b*my2;
    gsap.set(el,{x:tx,y:ty});gsap.set(c.e,{x:cx+tx,y:cy+ty});sync(tx,ty,.84)},{ease:'power3.inOut'});
  await click(c);
  await mv(c,r.x+r.w*.84,r.y+r.h*.84,{dur:.3});
  await anim(.5,t=>{const s=.84+.16*t;gsap.set(el,{scale:s});sync(0,0,s);gsap.set(c.e,{x:r.x+r.w*s,y:r.y+r.h*s})},{ease:'power2.out'});
  gsap.set(el,{clearProps:'transform'});lb.remove();fade([f],.35,.5);
};
/* decoration: brush-sweep reveal left -> right */
EX.d=async(c,j,my)=>{
  const r=j.r,x0=clamp(r.x,0,W),x1=clamp(r.x+r.w,0,W),y=clamp(r.y+r.h*.5,6,H-6);
  if(x1-x0<4){j.el.style.clipPath='none';return}
  j.el.style.clipPath='inset(0 100% 0 0)';
  await mv(c,x0+4,y);await click(c);
  const full=r.w;await anim(.3+(x1-x0)/W*.9,t=>{const px=x0+(x1-x0)*t;
    j.el.style.clipPath='inset(0 '+Math.max(0,100-((px-r.x)/full)*100)+'% 0 0)';gsap.set(c.e,{x:px,y:y+Math.sin(t*9)*r.h*.04})},{ease:'sine.inOut'});
  j.el.style.clipPath='none';
};

/* ---------- preparing a slide (measure at FINAL positions, then hide) ---------- */
function restore(s){
  s.jobs.forEach(j=>{if(j.nodes)j.nodes.forEach(o=>o.n.nodeValue=o.s)});
  $$('p,.row',s.el).forEach(p=>p.style.minHeight='');$$('.bu',s.el).forEach(b=>b.style.opacity='');
  $$('.tx',s.el).forEach(e=>e.scrollTop=0);
  $$('[data-g]',s.el).forEach(e=>{e.style.clipPath='';gsap.killTweensOf(e);gsap.set(e,{clearProps:'opacity,transform'})});
  $$('.caret').forEach(x=>x.remove());
}
function mkShape(cx,cy,size){const n=[0,3,4,5,6][Math.floor(Math.random()*5)],r=size/2,rot=R(0,6.28);
  if(!n)return{pt:t=>({x:cx+r*Math.cos(rot+6.283*t),y:cy+r*Math.sin(rot+6.283*t)})};
  const v=[...Array(n)].map((_,k)=>({x:cx+r*Math.cos(rot+6.283*k/n),y:cy+r*Math.sin(rot+6.283*k/n)}));
  return{pt:t=>{const f=t*n,k=Math.floor(f)%n,u=f-Math.floor(f),a=v[k],b=v[(k+1)%n];return{x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u}}}}
/* free-area search over real text-line boxes + illustration boxes */
function findFree(obs){const u=W/1600;let best=null,bo=1e18;
  for(const sz of [230,180,140,110,90]){const s=sz*u,p=16*u,tail=34*u;
    for(let k=0;k<90;k++){const cx=R(s/2+p,Math.max(s/2+p+1,W-s/2-p-tail)),cy=R(s/2+p,Math.max(s/2+p+1,H-s/2-p-tail));
      const a={x:cx-s/2-p,y:cy-s/2-p,w:s+2*p+tail,h:s+2*p+tail};let o=0;
      for(const b of obs){const ix=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),iy=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);if(ix>0&&iy>0)o+=ix*iy}
      if(!o)return mkShape(cx,cy,s);if(o<bo){bo=o;best=[cx,cy,s]}}}
  return mkShape(best[0],best[1],best[2])}
function prep(s){
  restore(s);
  /* shrink font until each text block fits its box (no inner scrolling) */
  $$('.tx',s.el).forEach(e=>{let k=1;e.style.setProperty('--k',1);while(e.scrollHeight>e.clientHeight+1&&k>.5){k-=.03;e.style.setProperty('--k',k.toFixed(2))}});
  const s0=sr();
  s.jobs=$$('[data-g]',s.el).map(el=>({el,k:el.dataset.g[0],taken:false,done:false,par:null,r:rel(el.getBoundingClientRect(),s0)}));
  s.obs=[];const boxes=s.jobs.filter(j=>j.k==='b');
  s.jobs.forEach(j=>{
    if(j.k==='b'||j.k==='i')s.obs.push(j.r);
    if(j.k==='b'||j.k==='d')return;
    const cx=j.r.x+j.r.w/2,cy=j.r.y+j.r.h/2;let pb=null;
    boxes.forEach(b=>{if(cx>b.r.x&&cx<b.r.x+b.r.w&&cy>b.r.y&&cy<b.r.y+b.r.h&&(!pb||b.r.w*b.r.h<pb.r.w*pb.r.h))pb=b});j.par=pb;
    if(j.k==='i')return;
    /* text: lock heights so layout never shifts while typing, record every real line box */
    $$('p,.row',j.el).forEach(p=>p.style.minHeight=p.getBoundingClientRect().height+'px');
    j.nodes=[];const tw=document.createTreeWalker(j.el,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode.closest('.bu')||!n.nodeValue.length?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    while(tw.nextNode())j.nodes.push({n:tw.currentNode,s:tw.currentNode.nodeValue});
    j.nodes.forEach(o=>{const rg=document.createRange();rg.selectNodeContents(o.n);[...rg.getClientRects()].filter(q=>q.width>1).forEach(q=>s.obs.push(rel(q,s0)))});
  });
  s.gather=findFree(s.obs);s.sl=CUR.map((_,i)=>i/6);
  s.jobs.forEach(j=>{
    if(j.nodes){j.nodes.forEach(o=>o.n.nodeValue='');$$('.bu',j.el).forEach(b=>b.style.opacity=0)}
    else if(j.k==='b')j.el.style.clipPath='inset(0 100% 100% 0)';
    else if(j.k==='d')j.el.style.clipPath='inset(0 100% 0 0)';
    else if(j.k==='i')gsap.set(j.el,{opacity:0});
  });
  s.prep=true;
}

/* ---------- scheduler with work stealing ---------- */
async function run(s,my){
  const q=CUR.map(()=>[]);s.jobs.forEach(j=>q[ROLE[j.k]].push(j));
  const ready=j=>!j.taken&&(!j.par||j.par.done);
  const pick=c=>{const j=q[c.i].find(ready);if(j)return j;
    const blocked=q[c.i].some(x=>!x.taken);let best=null,n=0;
    q.forEach((l,i)=>{if(i===c.i)return;const m=l.filter(x=>!x.taken).length;if(m>n){n=m;best=i}});
    if(best!=null){const l=q[best].filter(ready);if(l.length)return l[l.length-1]}
    return blocked?'w':null};
  await Promise.all(CUR.map(async c=>{try{
    await sleep(c.i*70);
    for(;;){if(my!==tok)return;const j=pick(c);if(j==='w'){await sleep(60);continue}if(!j)break;
      j.taken=true;await EX[j.k](c,j,my);if(my!==tok)return;j.done=true;await sleep(R(50,150))}
    const p=s.gather.pt(s.sl[c.i]);await mv(c,p.x,p.y);
  }catch(e){}}));
  if(my!==tok)return;
  stat.textContent='slide '+(cur+1)+' ready';
  /* all done: orbit around the free-area shape */
  const dirs=CUR.map(()=>Math.random()<.5?-1:1),spd=CUR.map(()=>R(.06,.14));let last=performance.now();const t0=last;
  const f=()=>{if(my!==tok){gsap.ticker.remove(f);return}const n=performance.now(),k=Math.min(1,(n-t0)/1800),ramp=k*k*(3-2*k),dt=(n-last)/1000*ramp;last=n;
    CUR.forEach((c,i)=>{s.sl[i]=(s.sl[i]+dirs[i]*spd[i]*dt+1)%1;const p=s.gather.pt(s.sl[i]);gsap.set(c.e,{x:p.x,y:p.y})})};
  gsap.ticker.add(f);
}

/* ---------- navigation ---------- */
function go(n){
  if(n<0||n>=S.length||n===cur)return;
  if(cur>=0&&S[cur].prep){restore(S[cur]);S[cur].prep=false}   /* unfinished text is shown in full */
  tok++;const my=tok;
  CUR.forEach(c=>{gsap.killTweensOf(c.e);gsap.killTweensOf(c.e.firstChild);gsap.set(c.e,{opacity:0,scale:0})});
  ov.innerHTML='';
  S.forEach((s,i)=>s.el.classList.toggle('on',i===n));cur=n;
  const s=S[n];prep(s);
  gsap.fromTo(s.el,{opacity:0,y:28,scale:.985,transformOrigin:'50% 50%'},{opacity:1,y:0,scale:1,duration:.55,ease:'power3.out',clearProps:'transform'});
  stat.textContent='generating slide '+(n+1)+'/'+S.length+'…';
  $$('button',dotsEl).forEach((b,i)=>b.classList.toggle('act',i===n));
  btnPrev.disabled=n<=0;btnNext.disabled=n>=S.length-1;
  setTimeout(()=>{if(my!==tok)return;
    CUR.forEach((c,i)=>{c.slow=true;gsap.to(c.e,{opacity:1,scale:1,duration:.45,delay:i*.08,ease:'back.out(2.2)',overwrite:'auto'})});
    run(s,my)},700);
}
/* ---------- presentation controls: start / fullscreen / prev / next ---------- */
const btnPrev=$('#prev'),btnNext=$('#next'),btnStart=$('#start'),btnFs=$('#fs'),toast=$('#toast');
let presenting=false,usedFs=false,idleT=0,toastT=0,relT=0,want=null;
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
const say=m=>{toast.textContent=m;toast.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>toast.classList.remove('show'),3200)};
async function enterFs(){const e=document.documentElement;
  try{if(e.requestFullscreen)await e.requestFullscreen({navigationUI:'hide'});
    else if(e.webkitRequestFullscreen)e.webkitRequestFullscreen();
    else return false;return true}catch(err){return false}}
async function exitFs(){try{if(document.exitFullscreen)await document.exitFullscreen();else if(document.webkitExitFullscreen)document.webkitExitFullscreen()}catch(e){}}
/* auto-hide the control bar while presenting; any pointer/key activity brings it back */
function wake(){document.body.classList.remove('idle');clearTimeout(idleT);if(presenting)idleT=setTimeout(()=>document.body.classList.add('idle'),2500)}
function updateUi(){
  btnStart.innerHTML=presenting?'&#9632; <span class="lbl">จบการนำเสนอ</span>':'&#9654; <span class="lbl">เริ่มการนำเสนอ</span>';
  btnStart.title=presenting?'จบการนำเสนอ (Esc)':'เริ่มการนำเสนอ (P)';
  btnFs.innerHTML='<span class="ico">&#x26F6;</span> <span class="lbl">'+(fsEl()?'ออกจากเต็มจอ':'เต็มหน้าจอ')+'</span>';
  btnFs.title=fsEl()?'ออกจากเต็มหน้าจอ (Esc)':'แสดงผลเต็มหน้าจอ (F)';}
function setPresenting(on){presenting=on;document.body.classList.toggle('presenting',on);if(!on)document.body.classList.remove('idle');wake();updateUi()}
/* after the window size changes (fullscreen on/off) re-measure and replay the slide so the animation matches the new size */
function relayout(n){want=n!=null?n:(want!=null?want:cur);clearTimeout(relT);
  relT=setTimeout(()=>{const t=Math.max(0,want);want=null;fit();cur=-1;go(t)},220)}
async function toggleFs(){if(fsEl()){await exitFs()}else if(!(await enterFs()))say('อุปกรณ์นี้ไม่รองรับการแสดงผลเต็มหน้าจอ')}
async function togglePresent(){
  if(presenting){setPresenting(false);if(fsEl())await exitFs();return}
  setPresenting(true);
  usedFs=await enterFs();
  if(!usedFs)say('อุปกรณ์นี้ไม่รองรับเต็มจอ — เริ่มการนำเสนอจากสไลด์แรกแล้ว');
  relayout(0)}

function init(){
  fit();
  CUR=COL.map((c,i)=>{const e=document.createElement('div');e.className='cur';
    e.innerHTML='<svg viewBox="0 0 24 30"><path d="M2 2 L2 24 L8 18.5 L12.5 28 L16 26.4 L11.6 17 L19.5 17 Z" fill="'+c+'" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    cl.append(e);gsap.set(e,{x:W*(.34+i*.065),y:H*.5,opacity:0,scale:0});
    const o={i,e,c,slow:true};o.qx=gsap.quickTo(e,'x',{duration:.2,ease:'power3.out'});o.qy=gsap.quickTo(e,'y',{duration:.2,ease:'power3.out'});return o});
  S.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','slide '+(i+1));b.onclick=()=>go(i);dotsEl.append(b)});
  addEventListener('resize',fit);
  btnPrev.onclick=()=>{go(cur-1);btnPrev.blur()};
  btnNext.onclick=()=>{go(cur+1);btnNext.blur()};
  btnStart.onclick=()=>{btnStart.blur();togglePresent()};
  btnFs.onclick=()=>{btnFs.blur();toggleFs()};
  const onFs=()=>{updateUi();if(!fsEl()&&presenting&&usedFs)setPresenting(false);relayout()};
  document.addEventListener('fullscreenchange',onFs);document.addEventListener('webkitfullscreenchange',onFs);
  ['pointermove','pointerdown','touchstart'].forEach(t=>addEventListener(t,wake,{passive:true}));
  updateUi();
  addEventListener('keydown',e=>{wake();
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(['ArrowRight',' ','PageDown'].includes(e.key)){e.preventDefault();go(cur+1)}
    else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(cur-1)}
    else if(e.key==='p'||e.key==='P'){e.preventDefault();togglePresent()}
    else if(e.key==='f'||e.key==='F'){e.preventDefault();toggleFs()}
    else if(e.key==='Escape'&&presenting&&!fsEl()){setPresenting(false)}});
  let tx=null;addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
  addEventListener('touchend',e=>{if(tx==null)return;const d=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(d)>50)go(cur+(d<0?1:-1))});
  go(0);
}
const fl=document.fonts?Promise.race([Promise.all([document.fonts.load('400 20px "Noto Serif Thai"'),document.fonts.load('600 20px "Noto Serif Thai"')]),sleep(2500)]):Promise.resolve();
fl.then(()=>document.fonts?document.fonts.ready:0).then(init);
})();
