const live2d_path = '/wp-content/uploads/live2d/';
function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    let tag;
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
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      document.head.appendChild(tag);
    }
  });
}
(async () => {
  console.log('[L2D] start width='+screen.width); if (screen.width < 768) { console.log('[L2D] mobile skip'); return; };
  console.log('[L2D] loading resources'); await Promise.all([
    loadExternalResource(live2d_path + 'waifu.css?v=11', 'css'),
    loadExternalResource(live2d_path + 'waifu-tips.js?v=11', 'js')
  ]);
  console.log('[L2D] call initWidget'); initWidget({
    waifuPath: live2d_path + 'waifu-tips.json?v=11',
    cdnPath: live2d_path,
    cubism2Path: live2d_path + 'live2d.min.js',
    cubism5Path: 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js',
    tools: ['hitokoto', 'asteroids', 'switch-model', 'switch-texture', 'photo', 'info', 'quit'],
    logLevel: 'warn',
    drag: false
  });

  var l2dlog=function(x){try{var i=new Image();i.src='/l2dcheck.php?m='+encodeURIComponent(x).substring(0,1900);}catch(e){}};
  window.addEventListener('error',function(e){l2dlog('WINERR '+e.message+' @ '+e.filename+':'+e.lineno);});
  window.addEventListener('unhandledrejection',function(e){var r=e.reason;l2dlog('REJECT '+String(r&&r.message?r.message:r).substring(0,300));});
  var _ce=console.error;console.error=function(){try{l2dlog('CERR '+Array.prototype.slice.call(arguments).join(' ').substring(0,300));}catch(e){};_ce.apply(console,arguments);};
  var _cw=console.warn;console.warn=function(){try{l2dlog('CWARN '+Array.prototype.slice.call(arguments).join(' ').substring(0,300));}catch(e){};_cw.apply(console,arguments);};

  [3,6,10,15].forEach(function(t){
    setTimeout(function(){
      var c=document.getElementById('live2d');
      var info='t='+t+'s canvas='+(c?c.width+'x'+c.height:'null');
      var img='';
      if(c){try{img=(c.toDataURL?c.toDataURL():''); info+=' dataURL='+img.length;}catch(e){info+=' toDataURLerr='+e.message;}}
      info+=' waifu='+(document.getElementById('waifu')?'waifu-active':'no-waifu');
      l2dlog(info);
      if(img){ setTimeout(function(){
        try {
          var b64 = img.indexOf(',') > 0 ? img.substring(img.indexOf(',')+1) : img;
          var xhr = new XMLHttpRequest();
          xhr.open('POST', '/l2dsave.php', true);
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.send('img=' + encodeURIComponent(b64));
          l2dlog('POSTED_'+t+' len='+b64.length);
          if(t===10){
            var im=new Image();
            im.src=img;
            im.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:99999;width:500px;height:500px;border:4px solid #fff;background:#444;display:block;';
            document.body.appendChild(im);
          }
        } catch(e) { l2dlog('POSTERR '+e.message); }
      }, 300); }
    },t*1000);
  });
  setTimeout(function(){
    var i='DIAG2 ';
    try{i+='Live2D='+(typeof window.Live2D);}catch(e){i+='L2Derr';}
    try{i+='|MWebGL='+(typeof window.Live2DModelWebGL);}catch(e){}
    var cs=document.querySelectorAll('canvas');i+='|canvasN='+cs.length;
    var c=document.getElementById('live2d');
    if(c){
      i+='|cSize='+c.width+'x'+c.height;
      var r=c.getBoundingClientRect();i+='|rect='+Math.round(r.width)+'x'+Math.round(r.height);
      var gl=null;try{gl=c.getContext('webgl');}catch(e){i+='|glerr='+e.message;}
      i+='|gl='+(gl?'OK':'NULL');
      if(gl){try{i+='|rend='+String(gl.getParameter(gl.RENDERER)).substring(0,35);}catch(e){}}
    } else i+='|NO_CANVAS';
    var wc=document.getElementById('waifu-canvas');i+='|waifuCanvas='+(wc?'yes':'no');
    if(wc){var wr=wc.getBoundingClientRect();i+='|wcRect='+Math.round(wr.width)+'x'+Math.round(wr.height);}
    l2dlog(i);
  },4500);
})();