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
const submitButton = form.querySelector('button[type="submit"]');

function saveState() {
  localStorage.setItem(stateKey, JSON.stringify(state));
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" })[char]);
}
function normalizedText(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
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
function addRecordButton() {
  const row = document.createElement("div");
  row.className = "record-row";
  row.innerHTML = '<p>Save an informal first-posted timestamp to this browser.</p><button class="record-button" id="record-idea" type="button">Record this idea</button>';
  results.append(row);
  document.getElementById("record-idea").addEventListener("click", recordIdea);
}
function showLoading(idea) {
  results.innerHTML = '<p class="eyebrow">Public web search</p><h2>Looking for related pages</h2><p class="results-intro">Searching the public web for: <strong>' + escapeHtml(idea) + '</strong></p><div class="search-status" role="status">Searching now…</div>';
  results.hidden = false;
}
function showError(message) {
  results.innerHTML = '<p class="eyebrow">Public web search</p><h2>Search unavailable</h2><div class="no-match">' + escapeHtml(message) + '</div>';
  results.hidden = false;
}
function renderSearchResults(idea, items) {
  const phrase = normalizedText(idea);
  const exactWording = items.some(item => {
    const pageText = normalizedText(item.title + " " + item.description);
    return phrase.length > 0 && pageText.includes(phrase);
  });
  let summary;
  if (!items.length) {
    summary = "No similar public pages surfaced in these results. That does not mean the idea is new; private, unindexed, or differently worded posts may not appear.";
  } else if (exactWording) {
    summary = "At least one result repeats the full idea wording in its title or snippet. That is an exact wording match, but it does not prove the underlying idea is identical or show who thought of it first.";
  } else {
    summary = "The search returned " + items.length + " public page" + (items.length === 1 ? "" : "s") + " that may discuss something similar. None of the returned titles or snippets repeats the full idea wording exactly.";
  }

  results.innerHTML =
    '<p class="eyebrow">Public web search</p><h2>What turned up online</h2>' +
    '<div class="search-summary">' + escapeHtml(summary) + '</div>' +
    '<p class="results-intro">These are possible connections from public search results, not proof of originality or ownership. Search may miss private, unindexed, or differently worded posts.</p>';

  if (items.length) {
    const list = document.createElement("div");
    list.className = "search-result-list";
    items.forEach(item => {
      const card = document.createElement("article");
      card.className = "search-result-card";
      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.title;
      const description = document.createElement("p");
      description.textContent = item.description || new URL(item.url).hostname;
      card.append(link, description);
      list.append(card);
    });
    results.append(list);
  } else {
    const empty = document.createElement("div");
    empty.className = "no-match";
    empty.textContent = "No results came back for this search.";
    results.append(empty);
  }
  addRecordButton();
  results.hidden = false;
}
async function searchIdea(idea) {
  showLoading(idea);
  submitButton.disabled = true;
  submitButton.textContent = "Searching…";
  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idea })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Live search is temporarily unavailable. Please try again later.");
    renderSearchResults(idea, Array.isArray(data.items) ? data.items.slice(0, 5) : []);
  } catch (error) {
    showError(error.message || "Live search is temporarily unavailable. Please try again later.");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Look for similar ideas <span aria-hidden="true">↗</span>';
  }
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
form.addEventListener("submit", async event => {
  event.preventDefault();
  currentIdea = input.value.trim();
  if (!currentIdea || currentIdea.length > 500) return;
  await searchIdea(currentIdea);
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