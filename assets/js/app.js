// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!open));
    toggle.setAttribute('aria-expanded', String(!open));
  });
}

// Year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Utility: fetch JSON with graceful error
async function getJSON(path){
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Failed loading', path, e);
    return null;
  }
}

// Experiments page rendering
async function renderExperiments(){
  const container = document.getElementById('experiment-list');
  if (!container) return;

  const data = await getJSON('assets/data/experiments.json');
  if (!data) { container.innerHTML = `<p>Could not load experiments.</p>`; return; }

  const search = document.getElementById('search');
  const topic = document.getElementById('topic');
  const difficulty = document.getElementById('difficulty');

  function matches(exp){
    const q = (search?.value || '').toLowerCase();
    const t = topic?.value || '';
    const d = difficulty?.value || '';
    const hay = (exp.title + ' ' + exp.summary + ' ' + exp.tags.join(' ')).toLowerCase();
    const qOk = !q || hay.includes(q);
    const tOk = !t || exp.tags.includes(t);
    const dOk = !d || exp.difficulty === d;
    return qOk && tOk && dOk;
  }

  function card(exp){
    return `
      <article class="card">
        <h3>${exp.title}</h3>
        <p class="meta">${exp.difficulty} · ~${exp.time} min</p>
        <p>${exp.summary}</p>
        <div class="tags">${exp.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div>
          ${exp.docs ? `<a class="card-link" href="${exp.docs}" target="_blank" rel="noreferrer">Docs</a>` : ''}
          ${exp.code ? `<a class="card-link" href="${exp.code}" target="_blank" rel="noreferrer">Code</a>` : ''}
        </div>
      </article>
    `;
  }

  function draw(){
    const items = data.filter(matches);
    container.innerHTML = items.map(card).join('') || `<p>No experiments match your filters.</p>`;
  }

  [search, topic, difficulty].forEach(ctrl => ctrl && ctrl.addEventListener('input', draw));
  draw();
}

// Videos page rendering
async function renderVideos(){
  const el = document.getElementById('video-list');
  if (!el) return;
  const data = await getJSON('assets/data/videos.json');
  if (!data) { el.innerHTML = `<p>Could not load videos.</p>`; return; }

  const search = document.getElementById('video-search');
  const topic = document.getElementById('video-topic');

  function matches(v){
    const q = (search?.value || '').toLowerCase();
    const t = topic?.value || '';
    const hay = (v.title + ' ' + v.description + ' ' + v.tags.join(' ')).toLowerCase();
    const qOk = !q || hay.includes(q);
    const tOk = !t || v.tags.includes(t);
    return qOk && tOk;
  }

  function card(v){
  const thumb = `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;
  const watch = `https://www.youtube.com/watch?v=${v.videoId}`;

  return `
    <article class="video-card">
      <a href="${watch}" target="_blank" rel="noreferrer" class="thumb">
        <img
          src="${thumb}"
          alt="${v.title}"
          loading="lazy"
        />
      </a>
      <div class="body">
        <h3>${v.title}</h3>
        <p class="meta">${v.length} · ${v.tags.join(' • ')}</p>
        <p>${v.description}</p>
      </div>
    </article>
  `;
}

  function draw(){
    const items = data.filter(matches);
    el.innerHTML = items.map(card).join('') || `<p>No videos match your filters.</p>`;
  }
  [search, topic].forEach(ctrl => ctrl && ctrl.addEventListener('input', draw));
  draw();
}

// Concepts page rendering (accordion)
async function renderConcepts(){
  const list = document.getElementById('concept-list');
  if (!list) return;
  const data = await getJSON('assets/data/concepts.json');
  if (!data) { list.innerHTML = `<p>Could not load concepts.</p>`; return; }

  list.innerHTML = data.map(c => `
    <article class="concept">
      <details>
        <summary>${c.title}</summary>
        <p class="meta">${c.tags.join(' • ')}</p>
        <p>${c.summary}</p>
        ${c.links?.length ? `<ul>${c.links.map(l=>`<li><a href="${l.url}" target="_blank" rel="noreferrer">${l.label}</a></li>`).join('')}</ul>` : ''}
      </details>
    </article>
  `).join('');
}

// Boot
renderExperiments();
renderVideos();
renderConcepts();

