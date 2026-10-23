const exampleIdeas = [
  { title: "A plant pot that reminds you when the soil is dry", tags: "plant water sensor soil moisture reminder" },
  { title: "A shared calendar that turns homework into small daily steps", tags: "school homework assignments calendar study planner tasks" },
  { title: "A reusable cup that tracks how much water you drink", tags: "water bottle hydration cup drink tracking" },
  { title: "A quiet study timer that schedules short screen breaks", tags: "study timer focus break screen school" },
  { title: "A neighborhood shelf for sharing extra garden produce", tags: "community neighborhood garden food sharing vegetables" }
];
const stateKey = "original-ideas-prototype-v1";
let state = JSON.parse(localStorage.getItem(stateKey) || "{}");
state.entries ||= [];
state.name ||= "";
let currentIdea = "";
const form = document.getElementById("idea-form");
const input = document.getElementById("idea-input");
const results = document.getElementById("results");
const entriesList = document.getElementById("entries-list");
const emptyState = document.getElementById("empty-state");
const stopWords = new Set(["a","an","and","are","as","at","be","by","for","from","how","i","in","into","is","it","my","of","on","or","our","that","the","their","this","to","use","with","you"]);

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
}
function words(value) {
  const tokens = value.toLowerCase().match(/[a-z0-9]+/g) || [];
  return new Set(tokens.filter(word => word.length > 2 && !stopWords.has(word)));
}
function overlap(a, b) {
  const left = words(a);
  const right = words(b);
  if (!left.size || !right.size) return 0;
  let common = 0;
  left.forEach(word => { if (right.has(word)) common += 1; });
  return common / (left.size + right.size - common);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" })[char]);
}
function renderEntries() {
  entriesList.innerHTML = state.entries.slice().reverse().map(entry =>
    '<article class="idea-entry"><p>' + escapeHtml(entry.text) + '</p><span>First recorded here by ' + escapeHtml(entry.name) + ' · ' + new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.createdAt)) + '</span></article>'
  ).join("");
  emptyState.hidden = state.entries.length > 0;
  document.getElementById("entry-count").textContent = String(state.entries.length);
  if (state.name) {
    document.getElementById("profile-heading").textContent = "Recording as " + state.name;
    document.getElementById("profile-name").value = state.name;
  }
}
function webSearchPanel(idea) {
  const query = encodeURIComponent(idea);
  const similarQuery = encodeURIComponent(idea + " similar ideas");
  return '<section class="web-search-panel"><div><strong>Search the public web</strong><span>Choose a search engine. Your idea text will be sent to that provider.</span></div><nav class="web-search-links" aria-label="Search the web">' +
    '<a href="https://www.google.com/search?q=' + query + '" target="_blank" rel="noopener noreferrer">Google ↗</a>' +
    '<a href="https://www.bing.com/search?q=' + similarQuery + '" target="_blank" rel="noopener noreferrer">Bing ↗</a>' +
    '<a href="https://duckduckgo.com/?q=' + query + '" target="_blank" rel="noopener noreferrer">DuckDuckGo ↗</a>' +
    '</nav></section>';
}
function showMatches(idea) {
  const matches = exampleIdeas.map(item => ({
    title: item.title,
    score: Math.max(overlap(idea, item.title), overlap(idea, item.tags))
  })).filter(item => item.score >= 0.12).sort((a,b) => b.score - a.score).slice(0,3);
  let body = "";
  if (matches.length) {
    body = '<div class="match-list">' + matches.map(item =>
      '<article class="match-card"><strong>' + escapeHtml(item.title) + '</strong><span>Word overlap with the prototype example collection: ' + Math.round(item.score * 100) + '%</span></article>'
    ).join("") + '</div>';
  } else {
    body = '<div class="no-match">No close wording match in the small example collection. This does not mean nobody has thought of the idea.</div>';
  }
  results.innerHTML = '<p class="eyebrow">Possible connections</p><h2>Here’s what the prototype found</h2><p class="results-intro">These wording matches come from a few examples. Use a web-search link below to check public pages; search engines may miss similar ideas.</p>' + webSearchPanel(idea) + body +
    '<div class="record-row"><p>Save an informal first-posted timestamp to this browser.</p><button class="record-button" id="record-idea" type="button">Record this idea</button></div>';
  results.hidden = false;
  document.getElementById("record-idea").addEventListener("click", recordIdea);
}
function recordIdea() {
  if (!state.name) {
    document.getElementById("profile-note").textContent = "Add a display name first. This prototype does not create a real account.";
    document.getElementById("profile-name").focus();
    return;
  }
  if (state.entries.some(entry => entry.text.toLowerCase() === currentIdea.toLowerCase())) {
    document.getElementById("profile-note").textContent = "This exact idea is already recorded in this browser.";
    return;
  }
  state.entries.push({ text: currentIdea, name: state.name, createdAt: new Date().toISOString() });
  saveState();
  renderEntries();
  document.getElementById("profile-note").textContent = "Saved here as informal credit. Entries are only stored in this browser.";
  document.getElementById("record-idea").textContent = "Recorded";
  document.getElementById("record-idea").disabled = true;
}
input.addEventListener("input", () => {
  document.getElementById("character-count").textContent = input.value.length + " / 500";
});
form.addEventListener("submit", event => {
  event.preventDefault();
  currentIdea = input.value.trim();
  if (!currentIdea) return;
  showMatches(currentIdea);
  results.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
document.getElementById("profile-form").addEventListener("submit", event => {
  event.preventDefault();
  state.name = document.getElementById("profile-name").value.trim().slice(0,32);
  if (!state.name) return;
  saveState();
  document.getElementById("profile-heading").textContent = "Recording as " + state.name;
  document.getElementById("profile-note").textContent = "This prototype name is stored only in this browser.";
});
renderEntries();
