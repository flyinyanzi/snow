// /js/collect.js
const STORAGE_KEY = 'demo_collected_v3';
const FIRE_ONCE_KEY = 'demo_fire_once_v3';
const TOTAL_ITEMS = 7; // ★总数（房间+雪地）

// 用 sessionStorage：关闭页面/浏览器就清零
const box = sessionStorage;

const state = {
  set(ids){ box.setItem(STORAGE_KEY, JSON.stringify([...ids])); },
  get(){ try { return new Set(JSON.parse(box.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); } },
  reset(){ box.removeItem(STORAGE_KEY); box.removeItem(FIRE_ONCE_KEY); },
  has(id){ return state.get().has(id); },
  add(id){ const s = state.get(); s.add(id); state.set(s); return s; },
  delete(id){ const s = state.get(); s.delete(id); state.set(s); return s; }
};

function $$(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function tipToBody(el, text, ms=1200){
  // 把提示挂到 body，避免在小按钮里换行成“竖排”
  const r = el.getBoundingClientRect();
  const t = document.createElement('div');
  t.textContent = text;
  t.style.cssText =
    'position:fixed;left:'+ (r.left + r.width/2) +'px;top:'+ (r.top - 10) +'px;transform:translate(-50%,-100%);' +
    'background:#000b;color:#fff;padding:6px 10px;border-radius:10px;' +
    'font:12px/1.2 system-ui;white-space:nowrap;z-index:9999;pointer-events:none;';
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), ms);
}

function updateCounter(){
  const collected = state.get();
  const countEl = document.querySelector('[data-count]');
  const totalEl = document.querySelector('[data-total]');
  if (countEl) countEl.textContent = collected.size;
  if (totalEl) totalEl.textContent = TOTAL_ITEMS;

  // 会话内仅触发一次烟花
  if (collected.size >= TOTAL_ITEMS && !box.getItem(FIRE_ONCE_KEY)) {
    box.setItem(FIRE_ONCE_KEY, '1');
    if (typeof fireworks === 'function') fireworks();
  }
}

function styleCollected(el){
  // data-keepcolor="1" 的入口元素（书/水晶球）保持原色；其他置灰
  if (el.dataset.keepcolor === '1') {
    el.style.opacity = '';
    el.style.filter = '';
  } else {
    el.style.opacity = 0.45;
    el.style.filter = 'grayscale(60%)';
  }
  el.dataset.collected = '1';
}

function attachHandlers(){
  const collected = state.get();

  $$('.collect').forEach(el => {
    const id = el.dataset.id;
    if (!id) return;

    if (collected.has(id)) styleCollected(el);

    el.addEventListener('click', () => {
      const link = el.dataset.link;
      const already = state.has(id);

      if (!already) {
        // 第一次点击：收集 + 提示，不跳转
        styleCollected(el);
        state.add(id);
        updateCounter();
        tipToBody(el, link ? '已收集！再次点击进入' : '已收集 ✓', link ? 1500 : 1000);
        return;
      }

      // 已收集：带链接就直接进入；无链接给提示
      if (link) location.href = link;
      else tipToBody(el, '已经收集过啦', 800);
    });
  });

  // 清空按钮（如果页面放了 data-reset 收集按钮）
  const resetBtn = document.querySelector('[data-reset-collect]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => { state.reset(); updateCounter(); tipToBody(resetBtn, '已清空进度', 1000); });
  }

  updateCounter();
}

// 对外 API（可选）
window.resetCollect = () => { state.reset(); updateCounter(); };
window.clearCollected = (id) => { state.delete(id); updateCounter(); };
window.getCollected = () => Array.from(state.get());

document.addEventListener('DOMContentLoaded', attachHandlers);

// 占位烟花：请在最终页面覆写
window.fireworks = window.fireworks || function(){
  const note = document.createElement('div');
  note.textContent = '🎆 全部收集完成！雪夜烟花！';
  note.style.cssText = 'position:fixed;left:50%;top:14%;transform:translateX(-50%);' +
    'background:#000b;color:#fff;padding:10px 14px;border-radius:12px;font:14px system-ui;z-index:9999';
  document.body.appendChild(note);
  setTimeout(()=> note.remove(), 2200);
};
