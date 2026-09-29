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
  [3,6,10,15].forEach(function(t){
    setTimeout(function(){
      var c=document.getElementById('live2d');
      var info='t='+t+'s canvas='+(c?c.width+'x'+c.height:'null');
      var img='';
      if(c){try{img=(c.toDataURL?c.toDataURL().substring(0,1800):''); info+=' dataURL='+img.length;}catch(e){info+=' toDataURLerr='+e.message;}}
      info+=' waifu='+(document.getElementById('waifu')?'waifu-active':'no-waifu');
      l2dlog(info);
      if(img){ setTimeout(function(){ l2dlog('IMG_'+t+' '+img); }, 300); }
    },t*1000);
  });
})();
