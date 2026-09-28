const live2d_path = '/wp-content/uploads/live2d/';
const LOGS = [];
function P(m){ LOGS.push(String(m)); console.log('[Live2D] ' + m); }
const _err = console.error;
console.error = function(){ try { LOGS.push('ERR: ' + Array.prototype.slice.call(arguments).map(function(x){ try { return (x && x.message) ? x.message : String(x); } catch(e){ return '?'; } }).join(' ').slice(0,300)); } catch(e){} _err.apply(console, arguments); };
const _warn = console.warn;
console.warn = function(){ try { LOGS.push('WARN: ' + Array.prototype.slice.call(arguments).map(String).join(' ').slice(0,200)); } catch(e){} _warn.apply(console, arguments); };
window.addEventListener('error', function(e){ P('WINERR: ' + (e.message||'') ); });
window.addEventListener('unhandledrejection', function(e){ P('REJECT: ' + ((e.reason && (e.reason.message || e.reason)) || '?')); });
function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    let tag;
    if (type === 'css') { tag = document.createElement('link'); tag.rel = 'stylesheet'; tag.href = url; }
    else if (type === 'js') { tag = document.createElement('script'); tag.type = 'module'; tag.src = url; }
    if (tag) { tag.onload = () => resolve(url); tag.onerror = () => reject(url); document.head.appendChild(tag); }
  });
}
function canvasState(){
  const c = document.getElementById('live2d');
  if (!c) return 'NO_CANVAS';
  let px = 'n/a';
  try { px = c.toDataURL().length; } catch(e){ px = 'toDataURL_fail:' + e.message; }
  return 'canvas ' + c.width + 'x' + c.height + ' dataURL_len=' + px;
}
function show(){
  const w = document.getElementById('waifu');
  const info = [
    'waifu=' + (w ? 'YES class=[' + w.className + ']' : 'NO'),
    canvasState(),
    'errors=' + (LOGS.filter(function(x){ return x.indexOf('ERR:')===0 || x.indexOf('REJECT:')===0 || x.indexOf('WINERR:')===0; }).length)
  ].concat(LOGS.slice(-8));
  const box = document.getElementById('l2d-dbg') || (function(){ const d=document.createElement('div'); d.id='l2d-dbg'; document.body.appendChild(d); return d; })();
  box.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:999999;max-width:440px;background:#000;color:#fff;font:12px/1.5 monospace;padding:10px;border:2px solid #f33;white-space:pre-wrap;';
  box.textContent = info.join('\n');
}
(async () => {
  try {
    P('start width=' + screen.width);
    if (screen.width < 768) { P('SKIP narrow screen'); return; }
    const OriginalImage = window.Image;
    window.Image = function(...args) { const img = new OriginalImage(...args); img.crossOrigin = 'anonymous'; return img; };
    window.Image.prototype = OriginalImage.prototype;
    P('loading resources...');
    await Promise.all([
      loadExternalResource(live2d_path + 'waifu.css', 'css'),
      loadExternalResource(live2d_path + 'waifu-tips.js', 'js')
    ]);
    P('resources loaded, initWidget=' + (typeof window.initWidget));
    initWidget({
      waifuPath: live2d_path + 'waifu-tips.json',
      cdnPath: live2d_path,
      cubism2Path: live2d_path + 'live2d.min.js',
      cubism5Path: 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
      tools: ['hitokoto','asteroids','switch-model','switch-texture','photo','info','quit'],
      logLevel: 'trace',
      drag: false
    });
    P('initWidget called');
  } catch (e) {
    P('FATAL ' + (e && e.message ? e.message : e));
  }
  let n = 0;
  const iv = setInterval(function(){
    n++;
    const c = document.getElementById('live2d');
    let px = 0;
    try { px = c ? c.toDataURL().length : -1; } catch(e){}
    P('t=' + (n*2) + 's ' + canvasState() + ' waifu=' + (document.getElementById('waifu') ? document.getElementById('waifu').className : 'NO'));
    if (px > 20000) { P('>>> CANVAS HAS CONTENT - model rendered!'); }
    show();
    if (n >= 8) { clearInterval(iv); P('done'); show(); }
  }, 2000);
})();
