const U=window.EWE_CONFIG?.url||"",K=window.EWE_CONFIG?.anonKey||"",client=(window.supabase&&U&&K)?window.supabase.createClient(U,K):null;
const $=id=>document.getElementById(id);let session=null;
function msg(t){$("loginMsg").textContent=t}
async function start(){
  if(!client){msg("Add Supabase URL and anon key to config.js first.");return}
  const {data}=await client.auth.getSession();
  session=data.session;
  if(session) show();
  client.auth.onAuthStateChange((event,s)=>{
    session=s;
    if(event==="SIGNED_IN" && s) show();
    if(event==="SIGNED_OUT"){
      $("dashboard").classList.add("hidden");
      $("login").classList.remove("hidden");
      $("logout").classList.add("hidden");
      msg("You have been signed out.");
    }
  });
}
function show(){$("login").classList.add("hidden");$("dashboard").classList.remove("hidden");$("logout").classList.remove("hidden");loadEvents()}
$("loginBtn").onclick=async()=>{if(!client)return msg("Supabase is not configured.");const {error}=await client.auth.signInWithPassword({email:$("email").value,password:$("password").value});msg(error?error.message:"Signed in.")};
$("logout").onclick=async()=>client?.auth.signOut();
async function loadEvents(){const {data,error}=await client.from("events").select("*").order("created_at",{ascending:false});if(error)return $("events").textContent=error.message;$("count").textContent=data.length;$("events").innerHTML=data.map(e=>`<div class="event-row"><div><b>${e.title}</b><span>${e.category} · ${e.location||""} · ${e.published?"Published":"Draft"}</span></div><button class="delete" onclick="delEvent('${e.id}')">Delete</button></div>`).join("")||"<p>No events yet.</p>"}
async function delEvent(id){if(!confirm("Delete this event and its photos?"))return;const {data:photos}=await client.from("event_photos").select("path").eq("event_id",id);if(photos?.length)await client.storage.from("event-photos").remove(photos.map(x=>x.path));await client.from("event_photos").delete().eq("event_id",id);await client.from("events").delete().eq("id",id);loadEvents()}
$("eventForm").onsubmit=async e=>{e.preventDefault();$("formMsg").textContent="Uploading…";try{
 const {data:event,error}=await client.from("events").insert({title:$("title").value,category:$("category").value,location:$("location").value,event_date:$("date").value||null,description:$("description").value,published:$("published").checked,created_by:session.user.id}).select().single();if(error)throw error;
 const files=[...$("photos").files];for(let i=0;i<files.length;i++){const f=files[i];const path=`${event.id}/${crypto.randomUUID()}-${f.name.replace(/[^a-zA-Z0-9._-]/g,"-")}`;const up=await client.storage.from("event-photos").upload(path,f,{cacheControl:"31536000",upsert:false});if(up.error)throw up.error;await client.from("event_photos").insert({event_id:event.id,path,sort_order:i});}
 $("formMsg").textContent=`Uploaded ${files.length} photos.`;$("eventForm").reset();$("published").checked=true;loadEvents();
}catch(err){$("formMsg").textContent=err.message}}
start();
