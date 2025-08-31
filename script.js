const DATA_URL = "usernames.json";

const el = {
  list: document.getElementById("usernamesContainer"),
  loading: document.getElementById("loadingSpinner"),
  errorBox: document.getElementById("errorMessage"),
  errorText: document.getElementById("errorText"),
  empty: document.getElementById("emptyState"),
  count: document.getElementById("resultsCount"),
  search: document.getElementById("searchInput"),
  clear: document.getElementById("clearSearch"),
  sort: document.getElementById("sortSelect"),
};


let base = [];          
let view = [];          
let term = "";
let sortMode = "original";

const show = (n, b) => (n.style.display = b ? "" : "none");
const setError = (msg) => {
  if (msg) {
    el.errorText.textContent = msg;
    show(el.errorBox, true);
  } else {
    show(el.errorBox, false);
  }
};
const updateCount = () => {
  const total = base.length, shown = view.length;
  el.count.textContent = total
    ? (shown === total ? `${shown} usernames` : `${shown} / ${total} usernames`)
    : "No usernames loaded.";
};

function updateView() {
  const t = term.toLowerCase();
  view = base.filter(x => x.username.toLowerCase().includes(t));

  if (sortMode === "alphabetical") view.sort((a, b) => a.username.localeCompare(b.username));
  else if (sortMode === "reverse") view.sort((a, b) => b.username.localeCompare(a.username));
  else view.sort((a, b) => a.idx - b.idx); 

  el.list.innerHTML = "";
  if (view.length === 0) {
    show(el.empty, true);
  } else {
    show(el.empty, false);
    const frag = document.createDocumentFragment();
    for (const it of view) {
      const card = document.createElement("div");
      card.className = "username-card";
      card.innerHTML = `
        <div class="username-row">
          <i class="fab fa-reddit-alien"></i>
          <a class="username-link" href="https://www.reddit.com/user/${encodeURIComponent(it.username)}/" target="_blank" rel="noopener noreferrer">
            u/${it.username}
          </a>
        </div>`;
      frag.appendChild(card);
    }
    el.list.appendChild(frag);
  }
  updateCount();
}

const debounce = (fn, ms = 200) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

// Events
el.search.addEventListener("input", debounce(e => { term = e.target.value || ""; updateView(); }, 150));
el.clear.addEventListener("click", () => { el.search.value = ""; term = ""; updateView(); });
el.sort.addEventListener("change", e => { sortMode = e.target.value; updateView(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && document.activeElement === el.search) { el.clear.click(); }
});

(async () => {
  try {
    show(el.loading, true);
    setError(null);

    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load JSON (${res.status})`);

    const data = await res.json();
    const arr = Array.isArray(data?.usernames) ? data.usernames : [];
    base = arr
      .filter(x => typeof x === "string" && x.trim().length)
      .map((username, idx) => ({ username: username.trim(), idx }));

    updateView();
  } catch (err) {
    console.error(err);
    setError("Could not load usernames.");
    el.count.textContent = "No usernames loaded.";
  } finally {
    show(el.loading, false);
  }
})();
