const L = '/wp-content/uploads/live2d/';
function L2log(m) { console.log('[Live2D] ' + m); }
function L2err(msg) {
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:999999;background:#c0392b;color:#fff;padding:12px 16px;border-radius:8px;font:13px/1.6 monospace;max-width:520px;white-space:pre-wrap;box-shadow:0 4px 16px rgba(0,0,0,.4)';
  d.textContent = 'Live2D: ' + msg;
  document.body.appendChild(d);
}
var _ce = console.error;
console.error = function () {
  try { _ce.apply(console, arguments); } catch (e) { }
  var parts = [];
  for (var k = 0; k < arguments.length; k++) {
    var a = arguments[k];
    parts.push(a && a.message ? a.message : String(a));
  }
  L2err('console.error -> ' + parts.join(' '));
};
window.addEventListener('error', function (e) {
  L2err('JS错误: ' + e.message + '  @ ' + (e.filename || '') + ':' + (e.lineno || ''));
});
window.addEventListener('unhandledrejection', function (e) {
  var r = e.reason;
  L2err('Promise未捕获: ' + (r && r.message ? r.message : String(r)));
});
function loadExternalResource(url, type) {
  return new Promise(function (resolve, reject) {
    var tag;
    if (type === 'css') { tag = document.createElement('link'); tag.rel = 'stylesheet'; tag.href = url; }
    else if (type === 'js') { tag = document.createElement('script'); tag.type = 'module'; tag.src = url; }
    if (tag) {
      tag.onload = function () { L2log('loaded ' + url); resolve(url); };
      tag.onerror = function () { L2log('FAILED ' + url); reject(url); };
      document.head.appendChild(tag);
    }
  });
}
(async function () {
  try {
    L2log('screen.width=' + screen.width);
    if (screen.width < 768) { L2log('宽度<768，跳过'); return; }
    var tc = document.createElement('canvas');
    var g2 = null, g1 = null;
    try { g2 = tc.getContext('webgl2'); } catch (e) { }
    try { g1 = tc.getContext('webgl'); } catch (e) { }
    L2log('WebGL2=' + (!!g2) + '  WebGL1=' + (!!g1));
    if (!g2) { L2err('WebGL2 不可用（widget 强制要求 webgl2）。WebGL1=' + (!!g1)); }
    await Promise.all([
      loadExternalResource(L + 'waifu.css', 'css'),
      loadExternalResource(L + 'waifu-tips.js', 'js')
    ]);
    L2log('initWidget type=' + (typeof window.initWidget));
    if (typeof window.initWidget !== 'function') { L2err('window.initWidget 未定义'); return; }
    window.initWidget({
      waifuPath: L + 'waifu-tips.json',
      cdnPath: L,
      cubism2Path: L + 'live2d.min.js',
      cubism5Path: 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
      tools: ['hitokoto', 'asteroids', 'switch-model', 'switch-texture', 'info', 'quit'],
      logLevel: 'info',
      drag: false
    });
    L2log('initWidget() 已调用');
    setTimeout(function () {
      var w = document.getElementById('waifu');
      var cv = document.getElementById('live2d');
      L2log('检查: #waifu=' + (w ? '存在 class=' + w.className : '缺失') + ' | #live2d=' + (cv ? '存在' : '缺失'));
      if (!w) { L2err('#waifu 未创建，初始化在早期中断'); return; }
      if (w.className.indexOf('waifu-active') === -1) { L2err('#waifu 已创建但未激活（模型加载未完成）'); return; }
      L2log('OK: 看板娘已激活');
    }, 9000);
  } catch (e) {
    L2err('catch: ' + e.message);
  }
})();
