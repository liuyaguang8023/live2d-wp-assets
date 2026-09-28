const live2d_path = '/wp-content/uploads/live2d/';
const LOGS = [];
function beacon(m) {
  try {
    var im = new Image();
    im.src = '/l2ddbg.php?m=' + encodeURIComponent(String(m).slice(0, 500)) + '&r=' + Math.random();
  } catch (e) {}
}
function P(m) { var s = String(m); LOGS.push(s); console.log('[Live2D] ' + s); beacon('LOG ' + s); }
const _err = console.error;
console.error = function () {
  try {
    var parts = [];
    for (var i = 0; i < arguments.length; i++) {
      var x = arguments[i];
      parts.push((x && x.stack) ? x.stack.slice(0, 400) : (x && x.message) ? x.message : String(x));
    }
    var msg = parts.join(' ').slice(0, 500);
    LOGS.push('ERR: ' + msg);
    beacon('CONSOLE_ERROR ' + msg);
  } catch (e) {}
  _err.apply(console, arguments);
};
const _warn = console.warn;
console.warn = function () {
  try { beacon('WARN ' + Array.prototype.slice.call(arguments).map(String).join(' ').slice(0, 300)); } catch (e) {}
  _warn.apply(console, arguments);
};
window.addEventListener('error', function (e) { P('WINERR: ' + (e.message || '') + ' @' + (e.filename || '') + ':' + (e.lineno || '')); });
window.addEventListener('unhandledrejection', function (e) { P('REJECT: ' + ((e.reason && (e.reason.stack || e.reason.message || e.reason)) || '?')); });
function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    let tag;
    if (type === 'css') { tag = document.createElement('link'); tag.rel = 'stylesheet'; tag.href = url; }
    else if (type === 'js') { tag = document.createElement('script'); tag.type = 'module'; tag.src = url; }
    if (tag) { tag.onload = () => resolve(url); tag.onerror = () => reject(url); document.head.appendChild(tag); }
  });
}
function canvasState() {
  const c = document.getElementById('live2d');
  if (!c) return 'NO_CANVAS';
  let px = 'n/a';
  try { px = c.toDataURL().length; } catch (e) { px = 'fail'; }
  return 'canvas=' + c.width + 'x' + c.height + ' dataURL=' + px;
}
function show() {
  const w = document.getElementById('waifu');
  const info = [
    'waifu=' + (w ? '[' + w.className + ']' : 'NO'),
    canvasState(),
    'UA=' + navigator.userAgent.slice(0, 60)
  ].concat(LOGS.slice(-6));
  const box = document.getElementById('l2d-dbg') || (function () { const d = document.createElement('div'); d.id = 'l2d-dbg'; document.body.appendChild(d); return d; })();
  box.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:999999;max-width:460px;background:#000;color:#fff;font:12px/1.5 monospace;padding:10px;border:2px solid #f33;white-space:pre-wrap;';
  box.textContent = info.join('\n');
}
(async () => {
  try {
    P('START w=' + screen.width + ' ua=' + navigator.userAgent.slice(0, 40));
    if (screen.width < 768) { P('SKIP narrow'); return; }
    const OriginalImage = window.Image;
    window.Image = function (...args) { const img = new OriginalImage(...args); img.crossOrigin = 'anonymous'; return img; };
    window.Image.prototype = OriginalImage.prototype;
    await Promise.all([
      loadExternalResource(live2d_path + 'waifu.css', 'css'),
      loadExternalResource(live2d_path + 'waifu-tips.js', 'js')
    ]);
    P('res_ok initWidget=' + (typeof window.initWidget));
    initWidget({
      waifuPath: live2d_path + 'waifu-tips.json',
      cdnPath: live2d_path,
      cubism2Path: live2d_path + 'live2d.min.js',
      cubism5Path: 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
      tools: ['hitokoto', 'asteroids', 'switch-model', 'switch-texture', 'photo', 'info', 'quit'],
      logLevel: 'trace',
      drag: false
    });
    P('initWidget_called');
  } catch (e) {
    P('FATAL ' + (e && e.stack ? e.stack.slice(0, 400) : e));
  }
  let n = 0;
  const iv = setInterval(function () {
    n++;
    const c = document.getElementById('live2d');
    let px = -1;
    try { px = c ? c.toDataURL().length : -1; } catch (e) {}
    P('t=' + (n * 2) + 's ' + canvasState() + ' waifu=' + (document.getElementById('waifu') ? document.getElementById('waifu').className : 'NO') + ' px=' + px);
    if (px > 20000) P('>>> CANVAS_RENDERED');
    show();
    if (n >= 8) { clearInterval(iv); P('DONE'); show(); }
  }, 2000);
})();
