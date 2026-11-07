// App de Juan (app_movil.py). Versión 20261107-1019: al cambiarla, el móvil coge las fichas nuevas.
var V='m10-app-20261107-1019',VID='m10-videos';
var NUCLEO=["./", "index.html", "datos.bin", "manifest.webmanifest", "icono-180.png", "icono-192.png", "icono-512.png", "v/chef.jpg", "v/serenica.jpg", "v/naranjas.jpg", "v/moda-urbana.jpg", "v/moda-grafiti.jpg", "v/moda-clasica.jpg", "v/noche.jpg", "v/lucy.jpg", "v/marbella.jpg", "v/rep-lucy.jpg", "v/rep-adrian.jpg", "v/rep-sabrina.jpg", "v/rep-lara.jpg", "v/rep-malik.jpg", "v/rep-melissa.jpg", "v/rep-kimiko.jpg", "v/rep-runa.jpg", "v/clinica.jpg", "v/copisteria.jpg", "v/tekhne.jpg", "v/anfora.jpg"];
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(NUCLEO)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('m10-app-')===0&&k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(/\/v\/[^/]+\.mp4$/.test(u.pathname)){e.respondWith(video(e.request));return}
  e.respondWith(redPrimero(e.request));
});
// Fichas y página: de internet si responde en 4 s (así llegan las nuevas); si no, la copia del móvil.
function redPrimero(req){
  return caches.open(V).then(function(c){
    var red=fetch(req).then(function(r){if(r.ok)c.put(req,r.clone());return r});
    var tope=new Promise(function(ok,mal){setTimeout(function(){mal(new Error('lento'))},4000)});
    return Promise.race([red,tope]).catch(function(x){
      return c.match(req,{ignoreSearch:true}).then(function(y){return y||red})})})}
// Vídeos: de la caché si Juan los guardó (con trozos, que es como los pide el iPhone); si no, de internet.
function video(req){
  var url=new URL(req.url);url.search='';
  return caches.open(VID).then(function(c){return c.match(url.href)}).then(function(r){
    if(!r)return fetch(req);
    var rango=req.headers.get('range');if(!rango)return r;
    return r.blob().then(function(b){
      var m=/bytes=(\d*)-(\d*)/.exec(rango)||[],t=b.size,ini=m[1]?+m[1]:0,fin=m[2]?+m[2]:t-1;
      if(!m[1]&&m[2]){ini=Math.max(0,t-(+m[2]));fin=t-1}
      fin=Math.min(fin,t-1);
      return new Response(b.slice(ini,fin+1,'video/mp4'),{status:206,statusText:'Partial Content',headers:{
        'Content-Type':'video/mp4','Content-Range':'bytes '+ini+'-'+fin+'/'+t,'Content-Length':String(fin-ini+1),'Accept-Ranges':'bytes'}})})})}
