const L = '/wp-content/uploads/live2d/';
function L2log(m) { console.log('[Live2D] ' + m); }
function L2err(msg) {
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:999999;background:#c0392b;color:#fff;padding:12px 16px;border-radius:8px;font:13px/1.6 monospace;max-width:460px;white-space:pre-wrap;box-shadow:0 4px 16px rgba(0,0,0,.4)';
  d.textContent = 'Live2D 错误: ' + msg;
  document.body.appendChild(d);
}
window.addEventListener('error', function (e) {
  L2err(e.message + '  @  ' + (e.filename || '') + ':' + (e.lineno || ''));
});
window.addEventListener('unhandledrejection', function (e) {
  var r = e.reason;
  L2err('Promise 未捕获: ' + (r && r.message ? r.message : String(r)));
});
function loadExternalResource(url, type) {
  return new Promise(function (resolve, reject) {
    var tag;
    if (type === 'css') {
      tag = document.createElement('link');
      tag.rel = 'stylesheet';
      tag.href = url;
    } else if (type === 'js') {
      tag = document.createElement('script');
      tag.type = 'module';
      tag.src = url;
    }
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
    if (screen.width < 768) { L2log('width<768, skipped'); return; }
    if (localStorage.getItem('waifu-disabled') === 'true') {
      L2err('waifu-disabled=true（曾点过关闭），需清除 localStorage');
    }
    var OriginalImage = window.Image;
    window.Image = function () {
      var img = new (Function.prototype.bind.apply(OriginalImage, [null].concat(Array.prototype.slice.call(arguments))))();
      img.crossOrigin = 'anonymous';
      return img;
    };
    window.Image.prototype = OriginalImage.prototype;
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
      tools: ['hitokoto', 'asteroids', 'switch-model', 'switch-texture', 'photo', 'info', 'quit'],
      logLevel: 'info',
      drag: false
    });
    L2log('initWidget() called');
    setTimeout(function () {
      var w = document.getElementById('waifu');
      var c = document.getElementById('live2d');
      L2log('check: #waifu=' + (w ? 'yes class=' + w.className : 'MISSING') + ' | #live2d=' + (c ? 'yes' : 'MISSING'));
      if (!w) { L2err('#waifu 元素未创建（初始化中断）'); }
      else if (w.className.indexOf('waifu-active') === -1) { L2err('#waifu 已创建但无 waifu-active 类（模型加载未完成）'); }
      else { L2log('OK: 看板娘已激活'); }
    }, 8000);
  } catch (e) {
    L2err('catch: ' + e.message);
  }
})();
