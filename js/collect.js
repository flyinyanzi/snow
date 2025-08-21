// /js/collect.js
const STORAGE_KEY = 'demo_collected_v2';
const TOTAL_ITEMS = 7; // ★房间+雪地合计

const state = {
  set(ids){ localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); },
  get(){ try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return new Set(); } },
  reset(){ localStorage.removeItem(STORAGE_KEY); },
  has(id){ return state.get().has(id); },
  add(id){ const s = state.get(); s.add(id); state.set(s); return s; },
  delete(id){ const s = state.get(); s.delete(id); state.set(s); return s; }
};

// —— 公共小工具 ——
function $$(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
function tip(el, text, ms=1200){
  const t = document.createElement('div');
  t.textContent = text;
  t.style.cssText = 'position:absolute;left:50%;top:0;transform:translate(-50%,-110%);'
    + 'background:#0009;color:#fff;padding:4px 8px;border-radius:8px;font:12px system-ui;pointer-events:none;';
  el.appendChild(t);
  setTimeout(()=> t.remove(), ms);
}

function updateCounter(){
  const collected = state.get();
  const countEl = document.querySelector('[data-count]');
  const totalEl = document.querySelector('[data-total]');
  if (countEl) countEl.textContent = collected.size;
  if (totalEl) totalEl.textContent = TOTAL_ITEMS;

  if (collected.size >= TOTAL_ITEMS) {
    if (typeof fireworks === 'function') fireworks();
  }
}

function styleCollected(el){
  // 如果元素声明 keepcolor，就不降亮度
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

    // 初始化外观
    if (collected.has(id)) styleCollected(el);

    el.addEventListener('click', () => {
      const link = el.dataset.link;
      const already = state.has(id);

      if (!already) {
        // 第一次点击：仅收集 + 提示；不跳转
        styleCollected(el);
        state.add(id);
        updateCounter();

        // 针对带 link 的入口元素，给提示“再次点击进入”
        if (link) tip(el, '已收集！再次点击进入', 1500);
        else      tip(el, '已收集 ✓', 1000);
        return;
      }

      // 已收集
      if (link) {
        // 已收集 + 带链接：一次点击直接进入
        location.href = link;
      } else {
        // 已收集 + 无链接：给轻提示
        tip(el, '已经收集过啦', 800);
      }
    });
  });

  updateCounter();
}

// —— 控制台/页面可用的API ——
// 清空全部收集记录
window.resetCollect = () => { state.reset(); updateCounter(); };
// 清除单个元素的收集记录
window.clearCollected = (id) => { state.delete(id); updateCounter(); };
// 查看已收集的 id 列表
window.getCollected = () => Array.from(state.get());

document.addEventListener('DOMContentLoaded', attachHandlers);

// —— 占位 fireworks（请在最终页面里覆写为真正烟花）——
window.fireworks = window.fireworks || function(){
  const b = document.body;
  const note = document.createElement('div');
  note.textContent = '🎆 全部收集完成！雪夜烟花！';
  note.style.cssText = 'position:fixed;left:50%;top:14%;transform:translateX(-50%);'
    + 'background:#000b;color:#fff;padding:10px 14px;border-radius:12px;font:14px system-ui;z-index:9999';
  b.appendChild(note);
  setTimeout(()=> note.remove(), 2200);
};
