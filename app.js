const SUPABASE_URL = window.EWE_CONFIG?.url || "";
const SUPABASE_ANON_KEY = window.EWE_CONFIG?.anonKey || "";
const db = (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const fallback = [
 {id:1,title:"Grand Floral Stage",category:"Weddings",location:"Nellore",image:"assets/event-2.jpeg",photos:["assets/event-2.jpeg","assets/event-1.jpeg"]},
 {id:2,title:"Traditional Floral Setting",category:"Weddings",location:"Nellore",image:"assets/event-1.jpeg",photos:["assets/event-1.jpeg","assets/event-4.jpeg"]},
 {id:3,title:"Elegant White",category:"Weddings",location:"Nellore",image:"assets/event-3.jpeg",photos:["assets/event-3.jpeg"]},
 {id:4,title:"A Celebration in Detail",category:"Traditional",location:"Nellore",image:"assets/event-4.jpeg",photos:["assets/event-4.jpeg"]},
 {id:5,title:"Nature-Inspired Stage",category:"Weddings",location:"Nellore",image:"assets/event-5.jpeg",photos:["assets/event-5.jpeg"]},
];

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("heroMedia").style.backgroundImage = `url("assets/event-2.jpeg")`;
document.getElementById("aboutImage").style.backgroundImage = `url("assets/event-5.jpeg")`;
document.querySelector(".menu").onclick = () => document.querySelector(".navlinks").classList.toggle("open");
window.addEventListener("scroll", () => document.getElementById("nav").classList.toggle("scrolled", scrollY > 20));

function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function publicUrl(path){
  if(!db || !path) return path;
  return db.storage.from("event-photos").getPublicUrl(path).data.publicUrl;
}

function openGallery(event){
  const photos = event.photos?.length ? event.photos : [event.image];
  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Close">×</button>
    <div class="lb-inner">
      <div class="lb-meta"><small>${esc(event.category)} · ${esc(event.location||"Nellore")}</small><h3>${esc(event.title)}</h3></div>
      <div class="lb-grid">${photos.map(p=>`<img src="${esc(p)}" alt="${esc(event.title)}" loading="lazy">`).join("")}</div>
    </div>`;
  document.body.appendChild(overlay);
  document.body.style.overflow="hidden";
  const close=()=>{overlay.remove();document.body.style.overflow=""};
  overlay.querySelector(".lb-close").onclick=close;
  overlay.addEventListener("click",e=>{if(e.target===overlay)close()});
}

function render(items){
  const cats = ["All", ...new Set(items.map(x=>x.category).filter(Boolean))];
  document.getElementById("filters").innerHTML = cats.map((c,i)=>
    `<button class="filter ${i===0?"active":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");

  const grid = document.getElementById("eventsGrid");
  const draw = list => {
    grid.innerHTML = list.map((x,i) => `
      <article class="event-card ${i===0?"feature":""}" data-id="${esc(x.id)}" tabindex="0" role="button">
        <img src="${esc(x.image_url||x.image)}" alt="${esc(x.title)}" loading="lazy">
        <div class="event-info">
          <small>${esc(x.category||"EVENT")} · ${esc(x.location||"Nellore")}</small>
          <h3>${esc(x.title)}</h3>
          <span class="view">View gallery ↗</span>
        </div>
      </article>`).join("");
    grid.querySelectorAll(".event-card").forEach(card=>{
      const item=list.find(x=>String(x.id)===card.dataset.id);
      const open=()=>openGallery(item);
      card.onclick=open;
      card.onkeydown=e=>{if(e.key==="Enter"||e.key===" ")open()};
    });
  };
  draw(items);

  document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{
    document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    draw(b.dataset.cat==="All" ? items : items.filter(x=>x.category===b.dataset.cat));
  });
}

async function load(){
  if(!db){render(fallback);return;}
  const {data:events,error}=await db.from("events").select("*").eq("published",true).order("event_date",{ascending:false});
  if(error || !events?.length){render(fallback);return;}
  const ids=events.map(e=>e.id);
  const {data:photos}=await db.from("event_photos").select("*").in("event_id",ids).order("sort_order");
  const grouped={};
  (photos||[]).forEach(p=>(grouped[p.event_id]??=[]).push(publicUrl(p.path)));
  const mapped=events.map(e=>{
    const gallery=grouped[e.id]||[];
    return {...e,image_url:gallery[0]||"assets/event-2.jpeg",photos:gallery};
  });
  render(mapped);
}
load();
