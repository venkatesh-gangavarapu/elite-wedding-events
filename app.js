const SUPABASE_URL = window.EWE_CONFIG?.url || "";
const SUPABASE_ANON_KEY = window.EWE_CONFIG?.anonKey || "";
const db = (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const fallback = [
 {id:1,title:"Grand Floral Stage",category:"Weddings",location:"Nellore",image:"assets/event-2.jpeg",photos:["assets/event-2.jpeg","assets/event-1.jpeg"]},
 {id:2,title:"Traditional Floral Setting",category:"Weddings",location:"Nellore",image:"assets/event-1.jpeg",photos:["assets/event-1.jpeg","assets/event-4.jpeg"]},
 {id:3,title:"Elegant White",category:"Weddings",location:"Nellore",image:"assets/event-3.jpeg",photos:["assets/event-3.jpeg"]},
 {id:4,title:"A Celebration in Detail",category:"Traditional",location:"Nellore",image:"assets/event-4.jpeg",photos:["assets/event-4.jpeg"]},
 {id:5,title:"Nature-Inspired Stage",category:"Weddings",location:"Nellore",image:"assets/event-5.jpeg",photos:["assets/event-5.jpeg"]}
];

const $ = id => document.getElementById(id);
$("year").textContent = new Date().getFullYear();
document.querySelector(".menu").onclick = () => document.querySelector(".navlinks").classList.toggle("open");
window.addEventListener("scroll", () => $("nav").classList.toggle("scrolled", scrollY > 20));

function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function publicUrl(path){return db&&path?db.storage.from("event-photos").getPublicUrl(path).data.publicUrl:path;}

let allItems = [...fallback];

let aboutIndex = 0, aboutTimer;
function setAboutGallery(items){
  const photos = [];
  const seen = new Set();
  items.forEach(x => (x.photos?.length ? x.photos : [x.image]).forEach(p => {
    if(p && !seen.has(p)){ seen.add(p); photos.push(p); }
  }));
  const usable = photos.length ? photos : fallback.map(x=>x.image);
  const track = $("aboutGalleryTrack");
  if(!track) return;
  track.innerHTML = usable.map((p,i)=>`<div class="about-slide ${i===0?"active":""}" style="background-image:url('${esc(p)}')"></div>`).join("");
  aboutIndex = 0;
  clearInterval(aboutTimer);
  if(usable.length > 1){
    aboutTimer = setInterval(()=>{
      const slides = track.querySelectorAll(".about-slide");
      slides.forEach((s,i)=>s.classList.toggle("active", i === aboutIndex));
      aboutIndex = (aboutIndex + 1) % usable.length;
    }, 6500);
  }
}
let heroItems = fallback.flatMap(x=>x.photos.map((photo,i)=>({photo,category:x.category,title:x.title,index:i})));
let heroIndex = 0, heroTimer;

async function setHeroItems(items){
  const unique=[];
  const seen=new Set();
  items.forEach(x=>x.photos?.forEach(photo=>{
    if(!seen.has(photo)){seen.add(photo);unique.push({photo,category:x.category,title:x.title});}
  }));
  heroItems = unique.length ? unique : fallback.map(x=>({photo:x.image,category:x.category,title:x.title}));
  $("heroTotal").textContent=String(heroItems.length).padStart(2,"0");
  const slides=heroItems.map((x,i)=>`<div class="hero-slide ${i===0?"active":""}" style="background-image:url('${esc(x.photo)}')" aria-label="${esc(x.title)}"></div>`).join("");
  $("heroSlides").innerHTML=slides;
  $("heroDots").innerHTML=heroItems.map((_,i)=>`<button class="hero-dot ${i===0?"active":""}" data-index="${i}" aria-label="Go to image ${i+1}"></button>`).join("");
  document.querySelectorAll(".hero-dot").forEach(b=>b.onclick=()=>goHero(Number(b.dataset.index),true));
  heroIndex=0;
  // Start autoplay immediately when the page opens.
  // Images are also preloaded in the background so later transitions remain smooth.
  updateHeroUI();
  startHero();
  Promise.all(heroItems.map(x=>new Promise(resolve=>{
    const img=new Image(); img.onload=img.onerror=resolve; img.src=x.photo;
  })));
}

function updateHeroUI(){
  document.querySelectorAll(".hero-slide").forEach((s,i)=>s.classList.toggle("active",i===heroIndex));
  document.querySelectorAll(".hero-dot").forEach((d,i)=>d.classList.toggle("active",i===heroIndex));
  $("heroCurrent").textContent=String(heroIndex+1).padStart(2,"0");
    const tags=["Weddings","Decorations","Celebrations","Corporate Events"];
  $("heroTags").innerHTML = tags.map((tag,i)=>`<span class="hero-tag ${i===0?"featured":""}">${esc(tag)}</span>`).join("");
}
function goHero(i,manual=false){
  if(!heroItems.length)return;
  heroIndex=(i+heroItems.length)%heroItems.length; updateHeroUI();
  if(manual) startHero();
}
function startHero(){clearInterval(heroTimer);heroTimer=setInterval(()=>goHero(heroIndex+1),5000);}
$("heroPrev").onclick=()=>goHero(heroIndex-1,true);
$("heroNext").onclick=()=>goHero(heroIndex+1,true);

function openGallery(event, start=0){
  const photos = event.photos?.length ? event.photos : [event.image];
  let current=Math.max(0,Math.min(start,photos.length-1));
  const overlay=document.createElement("div");
  overlay.className="lightbox";
  overlay.innerHTML=`
    <button class="lb-close" aria-label="Close">×</button>
    <div class="lb-inner">
      <div class="lb-meta"><div><small>${esc(event.category)} · ${esc(event.location||"Nellore")}</small><h3>${esc(event.title)}</h3></div><div class="lb-caption"><span id="lbCount"></span></div></div>
      <div class="lb-stage"><button class="lb-nav lb-prev" aria-label="Previous image">←</button><img class="lb-main" alt="${esc(event.title)}"><button class="lb-nav lb-next" aria-label="Next image">→</button></div>
      <div class="lb-thumbs">${photos.map((p,i)=>`<img class="lb-thumb ${i===current?"active":""}" src="${esc(p)}" alt="Photo ${i+1}" data-index="${i}">`).join("")}</div>
    </div>`;
  document.body.appendChild(overlay);document.body.style.overflow="hidden";
  const main=overlay.querySelector(".lb-main"), count=overlay.querySelector("#lbCount");
  const thumbs=[...overlay.querySelectorAll(".lb-thumb")];
  const paint=()=>{
    main.src=photos[current];count.textContent=`${current+1} / ${photos.length}`;
    thumbs.forEach((t,i)=>t.classList.toggle("active",i===current));
    thumbs[current]?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
  };
  const move=d=>{current=(current+d+photos.length)%photos.length;paint()};
  overlay.querySelector(".lb-prev").onclick=()=>move(-1);
  overlay.querySelector(".lb-next").onclick=()=>move(1);
  thumbs.forEach(t=>t.onclick=()=>{current=Number(t.dataset.index);paint()});
  const close=()=>{overlay.remove();document.body.style.overflow=""};
  overlay.querySelector(".lb-close").onclick=close;
  overlay.addEventListener("click",e=>{if(e.target===overlay)close()});
  overlay.onkeydown=e=>{if(e.key==="Escape")close();if(e.key==="ArrowLeft")move(-1);if(e.key==="ArrowRight")move(1)};
  overlay.tabIndex=0;overlay.focus();paint();
}

function render(items){
  const cats=["All",...new Set(items.map(x=>x.category).filter(Boolean))];
  $("filters").innerHTML=cats.map((c,i)=>`<button class="filter ${i===0?"active":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  const grid=$("eventsGrid");
  const draw=list=>{
    grid.innerHTML=list.length?list.map((x,i)=>`
      <article class="event-card ${i===0?"feature":""}" data-id="${esc(x.id)}" tabindex="0" role="button" aria-label="Open ${esc(x.title)}">
        <img src="${esc(x.image_url||x.image)}" alt="${esc(x.title)}" loading="lazy">
        <div class="event-info"><small>${esc(x.category||"EVENT")} · ${esc(x.location||"Nellore")}</small><h3>${esc(x.title)}</h3><span class="view">View full gallery ↗</span></div>
      </article>`).join(""):"<p style='color:#888'>No projects in this category yet.</p>";
    grid.querySelectorAll(".event-card").forEach(card=>{
      const item=list.find(x=>String(x.id)===card.dataset.id);
      const open=()=>openGallery(item,0);
      card.onclick=open;card.onkeydown=e=>{if(e.key==="Enter"||e.key===" ")open()};
    });
  };
  draw(items);
  document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{
    document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    draw(b.dataset.cat==="All"?items:items.filter(x=>x.category===b.dataset.cat));
  });
}

async function load(){
  if(!db){render(fallback);setHeroItems(fallback);setAboutGallery(fallback);return;}
  const {data:events,error}=await db.from("events").select("*").eq("published",true).order("event_date",{ascending:false});
  if(error||!events?.length){render(fallback);setHeroItems(fallback);setAboutGallery(fallback);return;}
  const ids=events.map(e=>e.id);
  const {data:photos}=await db.from("event_photos").select("*").in("event_id",ids).order("sort_order");
  const grouped={};(photos||[]).forEach(p=>(grouped[p.event_id]??=[]).push(publicUrl(p.path)));
  const mapped=events.map(e=>{const gallery=grouped[e.id]||[];return {...e,image_url:gallery[0]||"assets/event-2.jpeg",photos:gallery}});
  allItems=mapped;render(mapped);setHeroItems(mapped);setAboutGallery(mapped);
}
load();
