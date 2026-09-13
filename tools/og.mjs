// Renders public/og.png (1200x630) in the game's pixel style. Run: node tools/og.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
const W=1200,H=630; const px=new Uint8Array(W*H*3);
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const PAL={k:'#0a0512',h:'#2a1a4a',H:'#3c2769',f:'#b7e08a',F:'#8fbf62',n:'#7bd63a',R:'#6a2f98',c:'#3a3a48',C:'#20202c',g:'#7bd63a',G:'#c9ff8a',w:'#f3e9d2',o:'#ff8c2a',y:'#ffd23f',s:'#8a5a2b'};
function rect(x,y,w,h,col,a=1){ const [r,g,b]=hex(col); for(let j=Math.max(0,y);j<Math.min(H,y+h);j++) for(let i=Math.max(0,x);i<Math.min(W,x+w);i++){ const o=(j*W+i)*3; px[o]=px[o]*(1-a)+r*a; px[o+1]=px[o+1]*(1-a)+g*a; px[o+2]=px[o+2]*(1-a)+b*a; } }
function sprite(rows,x,y,s){ rows.forEach((row,r)=>[...row].forEach((ch,c)=>{ if(ch!=='.') rect(x+c*s,y+r*s,s,s,PAL[ch]||'#f0f'); })); }
const WITCH=["...........k........","..........kkk.......","..........khk.......",".........khhhk......",".........khhhk......","........khhhhhk.....","........khhhhhk.....",".......khhhhhhhk....",".......khhHhhhhk....","......khhhHhhhhhk...",".....kkkkkkkkkkkkk..","...kkkkkkkkkkkkkkkkk","........kffffk......","........fkffkf......","........ffffff......",".........ffff.......","........kRRRRk......",".......kRRRRRRk.....","......fkRRRRRRkf....",".....ffkRRRRRRkff...",".......kRRRRRRk.s...",".......kRRRRRRk.s...","......kRRRRRRRRks...","......kRRRRRRRRks...",".....kRRRRRRRRRks...",".....kRRRRRRRRRRks..","....kkkkkkkkkkkkk...","....kk.........kk..."];
const CAULD=["..........................","..ccccccccccccccccccccc...",".cCCCCCCCCCCCCCCCCCCCCCc..",".cCggggggggggggggggggggCc.",".cCGgGggGgggGgGggGgggGgCc.","..cccccccccccccccccccccc..","..cCCCCCCCCCCCCCCCCCCCCc..","..cCCCCCCCCCCCCCCCCCCCCc..","ccccCCCCCCCCCCCCCCCCCCcccc","c..cCCCCCCCCCCCCCCCCCCc..c","...cCCCCCCCCCCCCCCCCCCc...","...cCCCCCCCCCCCCCCCCCCc...","....cCCCCCCCCCCCCCCCCc....",".....cCCCCCCCCCCCCCCc.....","......cccccccccccccc......",".......cc........cc.......","......cccc......cccc......"];
// 5x7 pixel font
const F={
A:["01110","10001","10001","11111","10001","10001","10001"],C:["01110","10001","10000","10000","10000","10001","01110"],D:["11110","10001","10001","10001","10001","10001","11110"],
E:["11111","10000","10000","11110","10000","10000","11111"],G:["01110","10001","10000","10111","10001","10001","01111"],H:["10001","10001","10001","11111","10001","10001","10001"],
I:["11111","00100","00100","00100","00100","00100","11111"],K:["10001","10010","10100","11000","10100","10010","10001"],N:["10001","11001","10101","10011","10001","10001","10001"],
O:["01110","10001","10001","10001","10001","10001","01110"],R:["11110","10001","10001","11110","10100","10010","10001"],S:["01111","10000","10000","01110","00001","00001","11110"],
T:["11111","00100","00100","00100","00100","00100","00100"],U:["10001","10001","10001","10001","10001","10001","01110"],W:["10001","10001","10001","10101","10101","10101","01010"],
Y:["10001","10001","01010","00100","00100","00100","00100"],L:["10000","10000","10000","10000","10000","10000","11111"],V:["10001","10001","10001","10001","10001","01010","00100"],
"?":["01110","10001","00001","00010","00100","00000","00100"],".":["00000","00000","00000","00000","00000","00000","00100"],",":["00000","00000","00000","00000","00000","00100","01000"]," ":["00000","00000","00000","00000","00000","00000","00000"]};
function text(str,x,y,s,col,shadow){ let cx=x; for(const ch of str){ const g=F[ch]||F[" "]; if(shadow) g.forEach((row,r)=>[...row].forEach((b,c)=>{ if(b==='1') rect(cx+c*s+s,y+r*s+s,s,s,shadow); })); g.forEach((row,r)=>[...row].forEach((b,c)=>{ if(b==='1') rect(cx+c*s,y+r*s,s,s,col); })); cx+=6*s; } }
const tw=(str,s)=>str.length*6*s-s;

// background gradient
for(let j=0;j<H;j++){ const t=j/H; const c=[0x14+(0x2c-0x14)*(1-t),0x0b+(0x1a-0x0b)*(1-t),0x24+(0x4d-0x24)*(1-t)]; for(let i=0;i<W;i++){ const o=(j*W+i)*3; px[o]=c[0];px[o+1]=c[1];px[o+2]=c[2]; } }
// stars
let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
for(let i=0;i<120;i++) rect(Math.floor(rnd()*W/4)*4, Math.floor(rnd()*H*0.6/4)*4, 4,4,'#f3e9d2', .3+rnd()*.6);
// moon (pixel crescent)
{ const M=["..####..",".######.","########","########","########","########",".######.","..####.."], m=10, mx=1030, my=50;
  M.forEach((row,r)=>[...row].forEach((ch,c)=>{ if(ch==='#') rect(mx+c*m,my+r*m,m,m,'#f3e9d2'); }));
  M.forEach((row,r)=>[...row].forEach((ch,c)=>{ if(ch==='#') rect(mx+c*m+25,my+r*m-12,m,m,'#2c1a4d'); })); }
// ground
rect(0,H-40,W,40,'#0e071c');
// cauldron (big) and witch (smaller)
const CS=13, S=7;
const cx=W-26*CS-90, cy=H-40-17*CS+6;
// flames
for(let i=0;i<40;i++){ const fx=cx+(5+rnd()*16)*CS, fy=H-40-rnd()*60; rect(Math.floor(fx/S)*S, Math.floor(fy/S)*S, S*(1+Math.floor(rnd()*2)), S*(1+Math.floor(rnd()*2)), rnd()<.5?'#ffd23f':'#ff8c2a'); }
sprite(CAULD,cx,cy,CS);
// smoke wisps
for(let i=0;i<70;i++){ const t=rnd(); const sx=cx+13*CS+(rnd()-.5)*(60+t*260), sy=cy+3*CS-t*300; const r=S*(1+Math.floor(t*3)); rect(Math.floor(sx/S)*S, Math.floor(sy/S)*S, r, r, rnd()<.6?'#c9ff8a':'#f3e9d2', .12+ (1-t)*.4); }
// brew bubbles
for(let i=0;i<8;i++) rect(cx+(4+Math.floor(rnd()*18))*CS, cy+3*CS-Math.floor(rnd()*2)*CS, CS, CS, rnd()<.5?'#c9ff8a':'#f3e9d2');
sprite(WITCH, 90, H-40-28*S, S);
rect(90+16*S, H-40-28*S+18*S, S, S, '#ffd23f');
// title
const T='WHO SAID?'; const ts=14; text(T, 90, 96, ts, '#7bd63a', '#0a0512');
text('THE WITCH ASKS.', 90, 96+8*ts+30, 6, '#f3e9d2', '#0a0512');
text('EVERYONE ANSWERS.', 90, 96+8*ts+30+60, 6, '#f3e9d2', '#0a0512');
text('GUESS WHO SAID WHAT.', 90, 96+8*ts+30+120, 6, '#ff8c2a', '#0a0512');

// PNG encode
const crcT=new Int32Array(256); for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; crcT[n]=c; }
const crc=b=>{ let c=-1; for(const x of b) c=crcT[(c^x)&255]^(c>>>8); return (c^-1)>>>0; };
const chunk=(type,data)=>{ const len=Buffer.alloc(4); len.writeUInt32BE(data.length); const td=Buffer.concat([Buffer.from(type),data]); const cr=Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([len,td,cr]); };
const raw=Buffer.alloc((W*3+1)*H); for(let j=0;j<H;j++){ raw[j*(W*3+1)]=0; px.subarray(j*W*3,(j+1)*W*3).forEach((v,i)=>raw[j*(W*3+1)+1+i]=v); }
const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(W,0); ihdr.writeUInt32BE(H,4); ihdr[8]=8; ihdr[9]=2; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
writeFileSync('public/og.png', Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR',ihdr), chunk('IDAT',deflateSync(raw,{level:9})), chunk('IEND',Buffer.alloc(0))]));
console.log('wrote public/og.png');
