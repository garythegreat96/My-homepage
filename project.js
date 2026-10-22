const activities = [
  { key: "sleep", label: "Sleep", icon: "☾", value: "7.5", unit: "hrs" },
  { key: "meal", label: "Meals", icon: "♨", value: "2", unit: "logged" },
  { key: "outdoor", label: "Outdoor", icon: "☼", value: "35", unit: "min" },
  { key: "exercise", label: "Exercise", icon: "↗", value: "40", unit: "min" },
  { key: "screen_time", label: "Screen", icon: "▣", value: "95", unit: "min" },
  { key: "hydration", label: "Water", icon: "◉", value: "5", unit: "glasses" },
];
const sampleRoutine = [
  ["07:00", "Wake up and get some morning light", "outdoor", true],
  ["07:30", "Breakfast and a glass of water", "meal", true],
  ["08:00", "Start the day with a little movement", "exercise", false],
  ["12:30", "Take a screen break outside", "outdoor", false],
  ["18:30", "Dinner and time to wind down", "meal", false],
  ["21:30", "Put screens away before bed", "screen time", false],
];
const storageKey = "gary-homeostasis-demo";
let demoState = JSON.parse(localStorage.getItem(storageKey) || "{}");
demoState.logs ||= [];
demoState.done ||= {};
const app = document.getElementById("app-content");
const nav = document.querySelector(".nav-list");
const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());

function save() { localStorage.setItem(storageKey, JSON.stringify(demoState)); }
function header(title, subtitle) {
  return `<header class="app-header"><div><h1>${title}</h1><p>${subtitle}</p></div><span class="demo-label">Sample data</span></header>`;
}
function routineRows() {
  return sampleRoutine.map((item, index) => {
    const done = demoState.done[index] ?? item[3];
    return `<button class="routine-row ${done ? "done" : ""}" data-routine="${index}" aria-pressed="${done}">
      <span class="routine-check">${done ? "✓" : ""}</span><span class="routine-time">${item[0]}</span>
      <span class="routine-name">${item[1]}</span><span class="routine-tag">${item[2]}</span>
    </button>`;
  }).join("");
}
function dashboard() {
  const logCount = demoState.logs.length;
  return header("Good morning", dateLabel) + `
    <div class="grid dashboard-top">
      <section class="card score-card">
        <div class="score-ring"><div class="score-number"><strong>${Math.min(99, 78 + logCount)}</strong><span>Score</span></div></div>
        <div class="score-caption">Today’s Wellness Score</div>
        <div class="score-sub">${logCount} activities logged</div>
      </section>
      <div class="grid metric-grid">${activities.map(a => `
        <article class="card metric">
          <div class="metric-top"><span class="metric-icon">${a.icon}</span><span class="metric-trend">Today</span></div>
          <div class="metric-label">${a.label}</div><div class="metric-value">${a.value}<small> ${a.unit}</small></div>
        </article>`).join("")}</div>
    </div>
    <div class="grid section-grid">
      <section>
        <div class="section-title"><h2>Quick Log</h2></div>
        <div class="grid quick-grid">${activities.map(a => `<button class="quick-btn" data-quick="${a.key}"><span>${a.icon}</span>${a.label}</button>`).join("")}</div>
      </section>
      <section>
        <div class="section-title"><h2>Today’s Routine</h2><button class="text-link" data-view="routine">View full routine →</button></div>
        <div class="card routine-card">${routineRows()}</div>
        <p class="sample-note">Example schedule · Check off items to personalize this demo.</p>
      </section>
    </div>`;
}
function logView(prefill = "") {
  return header("Log Activity", "Track what you did today") + `
    <section class="card page-card">
      <form class="log-form" id="log-form">
        <div class="form-row">
          <label class="field">Activity type<select name="type">${activities.map(a => `<option value="${a.key}" ${prefill === a.key ? "selected" : ""}>${a.label}</option>`).join("")}</select></label>
          <label class="field">Duration (minutes)<input name="duration" type="number" min="1" placeholder="30" required></label>
        </div>
        <label class="field">A short note<input name="note" maxlength="100" placeholder="How did it go?"></label>
        <button class="primary-btn" type="submit">Save activity</button>
      </form>
      <div class="section-title" style="margin-top:25px"><h2>Recent Activity</h2></div>
      <div class="log-list">${demoState.logs.length ? demoState.logs.slice().reverse().map(l => `<div class="log-item"><span>${escapeHtml(l.type)} · ${escapeHtml(l.note || "Activity logged")}</span><span>${l.duration} min</span></div>`).join("") : '<p class="sample-note">Your activity logs will appear here. This demo saves entries in this browser.</p>'}</div>
    </section>`;
}
function routineView() {
  return header("My Routine", dateLabel) + `
    <section class="card page-card"><div class="section-title"><h2>Today’s Schedule</h2><span class="sample-note">Tap an item to mark it done</span></div>
      <div class="routine-card">${routineRows()}</div>
      <p class="sample-note">A balanced day includes sleep, meals, movement, hydration, time outside, and breaks from screens.</p>
    </section>`;
}
function insightsView() {
  const bars = [46, 68, 52, 80, 62, 91, 74];
  return header("Insights", "Understand patterns and progress") + `
    <div class="grid streak-grid">${[["5", "Sleep streak"], ["3", "Exercise streak"], ["4", "Outdoor streak"], ["6", "Hydration streak"]].map(x => `<div class="card streak"><strong>${x[0]}</strong><span>${x[1]} (days)</span></div>`).join("")}</div>
    <section class="card page-card" style="margin-top:18px"><div class="section-title"><h2>Activity this week</h2><span class="sample-note">Minutes</span></div>
      <div class="bar-chart">${bars.map((height,i) => `<div class="chart-col"><i class="chart-bar" style="height:${height}%"></i><span class="chart-day">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</span></div>`).join("")}</div>
      <p class="sample-note">A small, steady routine can be easier to keep than a perfect one.</p>
    </section>`;
}
function challengesView() {
  return header("Challenges", "Small goals can make healthy habits more fun") + `
    <div class="grid">
      <article class="card challenge-card"><span class="challenge-icon">☼</span><div class="challenge-copy"><strong>Get outside</strong><p>Spend 20 minutes outdoors today · 12 of 20 min</p><div class="challenge-progress"><i style="width:60%"></i></div></div></article>
      <article class="card challenge-card"><span class="challenge-icon">◉</span><div class="challenge-copy"><strong>Water break</strong><p>Remember to pause for water · 5 of 8 glasses</p><div class="challenge-progress"><i style="width:62%"></i></div></div></article>
    </div><p class="sample-note">Sample challenges · No account or shared leaderboard in this demo.</p>`;
}
function settingsView() {
  return header("Settings", "A few ways to make the experience yours") + `
    <section class="card page-card"><h2 style="margin:0 0 8px;font:600 17px 'DM Sans',sans-serif">Your demo data</h2>
      <p class="sample-note">Activity entries and routine checkmarks stay in this browser only.</p>
      <button class="outline-btn" id="clear-data" style="margin-top:16px">Clear demo activity</button>
    </section>`;
}
const views = { dashboard, log: logView, routine: routineView, insights: insightsView, challenges: challengesView, settings: settingsView };
function render(view = "dashboard", prefill = "") {
  nav.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  app.innerHTML = view === "log" ? logView(prefill) : views[view]();
  app.dataset.view = view;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
}
document.addEventListener("click", event => {
  const navButton = event.target.closest("[data-view]");
  if (navButton) { render(navButton.dataset.view); return; }
  const quick = event.target.closest("[data-quick]");
  if (quick) { render("log", quick.dataset.quick); return; }
  const routine = event.target.closest("[data-routine]");
  if (routine) {
    const key = routine.dataset.routine;
    demoState.done[key] = !(demoState.done[key] ?? sampleRoutine[key][3]);
    save(); render(app.dataset.view || "dashboard"); return;
  }
  if (event.target.closest("#clear-data")) {
    demoState.logs = []; demoState.done = {}; save(); render("settings");
  }
});
document.addEventListener("submit", event => {
  if (event.target.id !== "log-form") return;
  event.preventDefault();
  const form = new FormData(event.target);
  demoState.logs.push({
    type: activities.find(a => a.key === form.get("type"))?.label || "Activity",
    duration: Number(form.get("duration")),
    note: String(form.get("note") || "").trim(),
    date: new Date().toISOString()
  });
  save(); render("dashboard");
});
render();
