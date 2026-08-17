const U=window.EWE_CONFIG?.url||"",K=window.EWE_CONFIG?.anonKey||"",client=(window.supabase&&U&&K)?window.supabase.createClient(U,K):null;
const $=id=>document.getElementById(id);let session=null,selectedFiles=[];
function msg(t){$("loginMsg").textContent=t}
async function start(){
 if(!client){msg("Add Supabase URL and anon key to config.js first.");return}
 const {data}=await client.auth.getSession();session=data.session;if(session)show();
 client.auth.onAuthStateChange((event,s)=>{session=s;if(event==="SIGNED_IN"&&s)show();if(event==="SIGNED_OUT"){session=null;$("dashboard").classList.add("hidden");$("login").classList.remove("hidden");$("logout").classList.add("hidden");}});
}
function show(){$("login").classList.add("hidden");$("dashboard").classList.remove("hidden");$("logout").classList.remove("hidden");loadEvents()}
$("loginBtn").onclick=async()=>{if(!client)return msg("Supabase is not configured.");msg("Signing in…");const {error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});msg(error?error.message:"Signed in.")};
$("logout").onclick=async()=>client?.auth.signOut();

function addFiles(fileList){
 const incoming=[...fileList].filter(f=>/^image\/(jpeg|png|webp)$/.test(f.type));
 const existing=new Set(selectedFiles.map(f=>`${f.name}-${f.size}-${f.lastModified}`));
 incoming.forEach(f=>{const key=`${f.name}-${f.size}-${f.lastModified}`;if(!existing.has(key)){selectedFiles.push(f);existing.add(key)}});
 renderPreviews();
}
function renderPreviews(){
 $("photoCount").textContent=selectedFiles.length;
 $("photoPreview").innerHTML=selectedFiles.map((f,i)=>`<div class="preview-card"><img src="${URL.createObjectURL(f)}" alt="${f.name}"><button type="button" class="remove-photo" data-i="${i}" aria-label="Remove ${f.name}">×</button></div>`).join("");
 document.querySelectorAll(".remove-photo").forEach(b=>b.onclick=()=>{selectedFiles.splice(Number(b.dataset.i),1);renderPreviews()});
}
$("photos").onchange=e=>{addFiles(e.target.files);e.target.value=""};
$("addMore").onclick=()=>$("photos").click();

async function loadEvents(){
 const {data,error}=await client.from("events").select("*").order("created_at",{ascending:false});
 if(error){$("events").textContent=error.message;return}
 $("count").textContent=data.length;
 $("events").innerHTML=data.map(e=>`<div class="event-row"><div><b>${e.title}</b><span>${e.category} · ${e.location||""} · ${e.published?"Published":"Draft"}</span></div><button class="delete" onclick="delEvent('${e.id}')">Delete</button></div>`).join("")||"<p>No events yet.</p>";
}
async function delEvent(id){
 if(!confirm("Delete this event and its photos?"))return;
 const {data:photos}=await client.from("event_photos").select("path").eq("event_id",id);
 if(photos?.length)await client.storage.from("event-photos").remove(photos.map(x=>x.path));
 await client.from("event_photos").delete().eq("event_id",id);await client.from("events").delete().eq("id",id);loadEvents();
}

// Client-side image optimization: keeps originals untouched on the user's device,
// but uploads a high-quality, web-friendly version to Supabase.
// This avoids adding another paid image-processing service.
async function optimizeImage(file){
  const MAX_EDGE = 2400;
  const QUALITY = 0.88;

  // SVG/GIF and already-small non-raster files are not altered.
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", {alpha:false});
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", QUALITY));
  if(!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.webp`, {
    type: "image/webp",
    lastModified: file.lastModified
  });
}

async function prepareUpload(file, index, total){
  $("formMsg").textContent = `Optimizing photo ${index+1} of ${total}…`;
  const optimized = await optimizeImage(file);
  return optimized;
}

$("eventForm").onsubmit=async e=>{
 e.preventDefault();
 if(!selectedFiles.length){$("formMsg").textContent="Please select at least one photo.";return}
 $("formMsg").textContent=`Uploading ${selectedFiles.length} photo${selectedFiles.length>1?"s":""}…`;
 try{
  const {data:event,error}=await client.from("events").insert({title:$("title").value,category:$("category").value,location:$("location").value,event_date:$("date").value||null,description:$("description").value,published:$("published").checked,created_by:session.user.id}).select().single();
  if(error)throw error;
  for(let i=0;i<selectedFiles.length;i++){
   const f=await prepareUpload(selectedFiles[i],i,selectedFiles.length);
   const safe=f.name.replace(/[^a-zA-Z0-9._-]/g,"-"),path=`${event.id}/${crypto.randomUUID()}-${safe}`;
   $("formMsg").textContent = `Uploading photo ${i+1} of ${selectedFiles.length}…`;
   const up=await client.storage.from("event-photos").upload(path,f,{
     cacheControl:"31536000",
     upsert:false,
     contentType:"image/webp"
   });
   if(up.error)throw up.error;
   const ins=await client.from("event_photos").insert({event_id:event.id,path,sort_order:i});
   if(ins.error)throw ins.error;
  }
  $("formMsg").textContent=`Event published with ${selectedFiles.length} photo${selectedFiles.length>1?"s":""}.`;
  $("eventForm").reset();$("published").checked=true;selectedFiles=[];renderPreviews();loadEvents();
 }catch(err){$("formMsg").textContent=err.message}
};
start();
