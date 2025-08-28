// /js/music-bus.js
(() => {
  const KEY = 'bgm_bus_v1';
  const BUS = {
    set(v){ localStorage.setItem(KEY, JSON.stringify(v)); },
    get(){ try{ return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } },
    clear(){ localStorage.removeItem(KEY); }
  };

  // 对外 API
  window.BGM = {
    /** 在“有用户手势”的回调里启动（首页：点击电脑） */
    start({src, volume=0.8, loop=true}){
      const el = new Audio(src);
      el.loop = loop; el.volume = 0; // 先静音，淡入
      el.play().then(()=>{
        const startedAt = Date.now();
        BUS.set({ src, startedAt, lastT: 0, playing: true, volume });
        // 记录播放进度（可选）
        el.addEventListener('timeupdate', ()=>{
          const data = BUS.get();
          if (data.src !== src) return;
          data.lastT = el.currentTime;
          BUS.set(data);
        });
        // 1s 淡入
        const target = volume; let v = 0;
        const fade = () => { v = Math.min(target, v + 0.08); el.volume = v; if (v < target) requestAnimationFrame(fade); };
        fade();
        // 保存实例到 window 以便调试
        window.__BGM_EL__ = el;
      }).catch(console.warn);
    },
    /** 其它页面：在“任意用户手势”触发时复现并续播 */
    resumeOnGesture(){
      const data = BUS.get();
      if (!data.playing || !data.src) return;
      // 只注册一次
      if (window.__BGM_RESUMED__) return;
      const handler = () => {
        if (window.__BGM_RESUMED__) return;
        window.__BGM_RESUMED__ = true;
        const el = new Audio(data.src);
        el.loop = true; el.volume = 0;
        el.addEventListener('loadedmetadata', ()=>{
          // 估算应到达的进度（上次记录 + 跨页经过时间）
          const dt = (Date.now() - (data.startedAt||Date.now()))/1000;
          const t  = ((data.lastT||0) + dt) % (el.duration || dt+0.1);
          try{ el.currentTime = t; }catch{}
          el.play().then(()=>{
            // 淡入到记录的目标音量
            const target = data.volume ?? 0.8; let v = 0;
            const fade = () => { v = Math.min(target, v + 0.08); el.volume = v; if (v < target) requestAnimationFrame(fade); };
            fade();
            window.__BGM_EL__ = el;
          }).catch(console.warn);
        });
      };
      // 绑定一次全局手势（移动端友好）
      ['pointerdown','touchstart','keydown'].forEach(ev=>document.addEventListener(ev, handler, {once:true, passive:true}));
    },
    /** 停止并清理（比如你提供“关闭音乐”按钮） */
    stop(){
      const el = window.__BGM_EL__; if (el){ el.pause(); try{ el.src=''; }catch{} }
      BUS.clear(); window.__BGM_RESUMED__=false;
    }
  };
})();
