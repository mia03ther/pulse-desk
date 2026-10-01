const state = { view: "news", cat: "all", q: "", selected: NEWS[0].id };

const $ = (sel) => document.querySelector(sel);
const feed = $("#feed");
const detail = $("#detail");

function moneyChange(n) {
  const cls = n > 0 ? "up" : n < 0 ? "down" : "flat";
  const sign = n > 0 ? "+" : "";
  return `<span class="${cls}">${sign}${n.toFixed(1)}%</span>`;
}

function renderQuotes() {
  $("#quotes").innerHTML = QUOTES.map((q) => `
    <button class="quote" data-symbol="${q.symbol}">
      <b>${q.symbol}</b>
      <span>${q.price}</span>
      ${moneyChange(q.change)}
      <small>${q.note}</small>
    </button>`).join("");
}

function filtered() {
  return NEWS.filter((n) => {
    const catOk = state.cat === "all" || n.category === state.cat;
    const blob = `${n.title} ${n.body} ${n.tag}`.toLowerCase();
    return catOk && blob.includes(state.q.toLowerCase());
  });
}

function renderFeed() {
  const rows = filtered();
  $("#count").textContent = `已显示 ${rows.length} 条`;
  feed.innerHTML = rows.map((n) => `
    <article class="item ${n.id === state.selected ? "on" : ""}" data-id="${n.id}">
      <div class="meta"><span class="tag">${n.tag}</span><time>${n.date} ${n.time}</time></div>
      <h3>${n.title}</h3>
      <p>${n.body}</p>
    </article>`).join("") || `<p class="empty">没有匹配的快讯。换个词，或切回全部。</p>`;
  const current = NEWS.find((n) => n.id === state.selected) || rows[0];
  if (current) renderDetail(current);
}

function renderDetail(n) {
  state.selected = n.id;
  detail.innerHTML = `
    <p class="kicker">${CATS[n.category]} · ${n.tag}</p>
    <h2>${n.title}</h2>
    <p class="body">${n.body}</p>
    <dl>
      <div><dt>影响</dt><dd>${n.impact}</dd></div>
      <div><dt>触发</dt><dd>${n.trigger}</dd></div>
      <div><dt>失效</dt><dd>${n.invalid}</dd></div>
    </dl>
    <button id="copyOne" class="primary">复制成社群帖</button>`;
  $("#copyOne").onclick = () => copyText(onePost(n));
}

function onePost(n) {
  return `【观察｜不是喊单】${n.title}\n依据：${n.body}\n影响：${n.impact}\n触发：${n.trigger}\n失效：${n.invalid}`;
}

function brief() {
  const picks = NEWS.slice(0, 5);
  const lines = picks.map((n, i) => `${i + 1}. ${n.tag}｜${n.title}\n依据：${n.impact}\n触发：${n.trigger}\n失效：${n.invalid}`).join("\n\n");
  return `【样例简报】观察，不是投资建议。\n\n背景：产业叙事偏热，利率和汇率不配合追高。下面 5 条按社群转发来写。\n\n${lines}\n\n一句话：叙事可以跟踪，方向等价格和失效条件确认。`;
}

function renderReview() {
  feed.innerHTML = `
    <section class="panel">
      <h2>今日复盘</h2>
      <p>产业新闻强、宏观定价乱。芯片出口和存储长单支持 AI 叙事；美债、日债和美元把风险偏好按住。黄金同一小时内多空都出现过，所以帖子只能写区间。</p>
      <pre id="briefBox">${brief()}</pre>
      <button id="copyBrief" class="primary">复制 5 条简报</button>
    </section>`;
  detail.innerHTML = `<p class="kicker">用法</p><h2>先复盘，再发帖</h2><p class="body">这条复盘可以直接贴进岗位样例。发出前用 TradingView 对一下价位，样例数据不是实时行情。</p>`;
  $("#copyBrief").onclick = () => copyText(brief());
}

function renderCalendar() {
  feed.innerHTML = `<section class="panel"><h2>投资日历</h2><ul class="plain">${CALENDAR.map((c) => `<li><b>${c.date}</b> ${c.event} <em>${c.level}</em></li>`).join("")}</ul></section>`;
  detail.innerHTML = `<p class="kicker">日历</p><h2>只标会改仓位的事件</h2><p class="body">低优先级事件写进日历，不写进买卖点。10 月 8 日特别国债是流动性日历，不是当天的加密催化。</p>`;
}

function renderFilings() {
  feed.innerHTML = `<section class="panel"><h2>公告</h2>${FILINGS.map((f) => `<article class="item"><div class="meta"><span class="tag">${f.source}</span><time>${f.time}</time></div><h3>${f.title}</h3></article>`).join("")}</section>`;
  detail.innerHTML = `<p class="kicker">公告</p><h2>原文和推论分开</h2><p class="body">公告只写已经发生的事。推论放在右侧影响栏，避免把磋商写成禁令。</p>`;
}

function renderResearch() {
  feed.innerHTML = `<section class="panel"><h2>研报草稿</h2>${RESEARCH.map((r) => `<article class="item"><h3>${r.title}</h3><p>${r.summary}</p></article>`).join("")}</section>`;
  detail.innerHTML = `<p class="kicker">研究</p><h2>一页纸就够</h2><p class="body">实习样例不需要长报告。一页纸写清叙事、资金是否跟上、失效条件。</p>`;
}

function render() {
  document.querySelectorAll(".nav button").forEach((b) => b.classList.toggle("on", b.dataset.view === state.view));
  $("#cats").hidden = state.view !== "news";
  if (state.view === "news") renderFeed();
  if (state.view === "review") renderReview();
  if (state.view === "calendar") renderCalendar();
  if (state.view === "filings") renderFilings();
  if (state.view === "research") renderResearch();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    $("#toast").textContent = "已复制";
  } catch {
    $("#toast").textContent = "复制失败，请手动选择";
  }
  setTimeout(() => { $("#toast").textContent = ""; }, 1600);
}

document.querySelectorAll(".nav button").forEach((b) => b.onclick = () => { state.view = b.dataset.view; render(); });
document.querySelectorAll(".cats button").forEach((b) => b.onclick = () => {
  state.cat = b.dataset.cat;
  document.querySelectorAll(".cats button").forEach((x) => x.classList.toggle("on", x === b));
  renderFeed();
});
feed.onclick = (e) => {
  const item = e.target.closest(".item");
  if (!item || !item.dataset.id) return;
  state.selected = item.dataset.id;
  renderFeed();
};
$("#q").oninput = (e) => { state.q = e.target.value.trim(); if (state.view !== "news") state.view = "news"; render(); };
$("#make").onclick = () => { state.view = "review"; render(); };

renderQuotes();
render();
