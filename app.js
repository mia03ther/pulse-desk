const state = { view: "news", cat: "all", q: "", selected: NEWS[0].id, quotes: QUOTES };

const feed = document.querySelector("#feed");
const detail = document.querySelector("#detail");

function changeHtml(n) {
  const cls = n > 0 ? "up" : n < 0 ? "down" : "";
  const sign = n > 0 ? "+" : "";
  return `<span class="${cls}">${sign}${n.toFixed(1)}%</span>`;
}

function renderQuotes() {
  document.querySelector("#quotes").innerHTML = state.quotes.map((q) => `
    <div class="quote">
      <b>${q.symbol}</b>
      <span>${q.price}</span>
      ${changeHtml(q.change)}
      <small>${q.note}</small>
    </div>`).join("");
}

async function loadLiveQuotes() {
  const badge = document.querySelector("#live");
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,chainlink&vs_currencies=usd&include_24hr_change=true";
    const data = await fetch(url).then((r) => r.json());
    const map = [
      ["bitcoin", "BTC", "Bitcoin"],
      ["ethereum", "ETH", "Ether"],
      ["solana", "SOL", "Solana"],
      ["chainlink", "LINK", "Chainlink"]
    ];
    state.quotes = map.map(([id, symbol, name]) => ({
      symbol,
      name,
      price: Number(data[id].usd).toLocaleString("en-US", { maximumFractionDigits: 2 }),
      change: data[id].usd_24h_change,
      note: "CoinGecko"
    })).concat(QUOTES.filter((q) => q.symbol === "XAU" || q.symbol === "US10Y"));
    badge.textContent = "行情已刷新";
    renderQuotes();
  } catch {
    badge.textContent = "行情用样例";
  }
}

function filtered() {
  return NEWS.filter((n) => {
    const catOk = state.cat === "all" || n.category === state.cat;
    const blob = `${n.title} ${n.body} ${n.tag}`.toLowerCase();
    return catOk && blob.includes(state.q.toLowerCase());
  });
}

function renderDetail(n) {
  state.selected = n.id;
  detail.innerHTML = `
    <p class="kicker">${CATS[n.category]} · ${n.date} ${n.time}</p>
    <h2>${n.title}</h2>
    <p class="body">${n.body}</p>
    <dl>
      <div><dt>影响</dt><dd>${n.impact}</dd></div>
      <div><dt>触发</dt><dd>${n.trigger}</dd></div>
      <div><dt>失效</dt><dd>${n.invalid}</dd></div>
    </dl>
    <button id="copyOne" class="primary">复制成社群帖</button>`;
  document.querySelector("#copyOne").onclick = () => copyText(onePost(n));
}

function renderFeed() {
  const rows = filtered();
  document.querySelector("#count").textContent = `${rows.length} 条`;
  feed.innerHTML = rows.map((n) => `
    <article class="item ${n.id === state.selected ? "on" : ""}" data-id="${n.id}">
      <div class="meta"><span class="tag">${n.tag}</span><time>${n.date} ${n.time}</time></div>
      <h3>${n.title}</h3>
      <p>${n.body}</p>
    </article>`).join("") || `<p class="panel">没有匹配的快讯。</p>`;
  renderDetail(NEWS.find((n) => n.id === state.selected) || rows[0] || NEWS[0]);
}

function onePost(n) {
  return `【观察｜不是喊单】${n.title}\n依据：${n.body}\n影响：${n.impact}\n触发：${n.trigger}\n失效：${n.invalid}`;
}

function brief() {
  const lines = NEWS.slice(0, 5).map((n, i) => `${i + 1}. ${n.tag}｜${n.title}\n影响：${n.impact}\n触发：${n.trigger}\n失效：${n.invalid}`).join("\n\n");
  return `【样例简报】观察，不是投资建议。\n\n${lines}`;
}

function renderReview() {
  feed.innerHTML = `<section class="panel"><h2>今日复盘</h2><p>产业叙事热，利率和汇率不配合追高。点右侧不会变，简报在这里复制。</p><pre>${brief()}</pre><button id="copyBrief" class="primary">复制 5 条简报</button></section>`;
  detail.innerHTML = `<p class="kicker">复盘</p><h2>先看结构，再对盘口</h2><p class="body">价位以发出时的行情为准。这页演示的是写法，不是实时喊单。</p>`;
  document.querySelector("#copyBrief").onclick = () => copyText(brief());
}

function renderCalendar() {
  feed.innerHTML = `<section class="panel"><h2>投资日历</h2><ul class="plain">${CALENDAR.map((c) => `<li><b>${c.date}</b> ${c.event} <em>${c.level}</em></li>`).join("")}</ul></section>`;
  detail.innerHTML = `<p class="kicker">日历</p><h2>只把会改观察的事件放进来</h2><p class="body">低优先级事件不写进买卖点。</p>`;
}

function renderFilings() {
  feed.innerHTML = `<section class="panel"><h2>公告</h2>${FILINGS.map((f) => `<article class="item"><div class="meta"><span class="tag">${f.source}</span><time>${f.time}</time></div><h3>${f.title}</h3></article>`).join("")}</section>`;
  detail.innerHTML = `<p class="kicker">公告</p><h2>已发生和推论分开写</h2><p class="body">磋商不要写成已落地。</p>`;
}

function renderResearch() {
  feed.innerHTML = `<section class="panel"><h2>研报草稿</h2>${RESEARCH.map((r) => `<article class="item"><h3>${r.title}</h3><p>${r.summary}</p></article>`).join("")}</section>`;
  detail.innerHTML = `<p class="kicker">研究</p><h2>一页纸够用</h2><p class="body">叙事、资金有没有跟上、失效条件。</p>`;
}

function render() {
  document.querySelectorAll(".nav button").forEach((b) => b.classList.toggle("on", b.dataset.view === state.view));
  document.querySelector("#cats").hidden = state.view !== "news";
  if (state.view === "news") renderFeed();
  if (state.view === "review") renderReview();
  if (state.view === "calendar") renderCalendar();
  if (state.view === "filings") renderFilings();
  if (state.view === "research") renderResearch();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    document.querySelector("#toast").textContent = "已复制";
  } catch {
    document.querySelector("#toast").textContent = "复制失败";
  }
  setTimeout(() => { document.querySelector("#toast").textContent = ""; }, 1400);
}

document.querySelector("#nav").onclick = (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  state.view = button.dataset.view;
  render();
};
document.querySelector("#cats").onclick = (e) => {
  const button = e.target.closest("button");
  if (!button) return;
  state.cat = button.dataset.cat;
  document.querySelectorAll(".cats button").forEach((x) => x.classList.toggle("on", x === button));
  renderFeed();
};
feed.onclick = (e) => {
  const item = e.target.closest(".item");
  if (!item || !item.dataset.id) return;
  state.selected = item.dataset.id;
  renderFeed();
};
document.querySelector("#q").oninput = (e) => {
  state.q = e.target.value.trim();
  state.view = "news";
  render();
};
document.querySelector("#make").onclick = () => { state.view = "review"; render(); };

renderQuotes();
render();
loadLiveQuotes();
