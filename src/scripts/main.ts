import Lenis from 'lenis';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
root.classList.add('js');

/* ---------- Smooth scroll ---------- */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
  const raf = (time: number) => {
    lenis!.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      const target = id === '#main' ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis!.scrollTo(target as HTMLElement, { offset: id === '#main' ? 0 : -72 });
      history.replaceState(null, '', id);
    });
  });
}

/* ---------- Board date ---------- */
const dateEl = document.querySelector<HTMLElement>('[data-date]');
if (dateEl) {
  const fmt = new Intl.DateTimeFormat(root.lang === 'tr' ? 'tr-TR' : 'en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  const tick = () => (dateEl.textContent = fmt.format(new Date()).toLocaleUpperCase(root.lang));
  tick();
  setInterval(tick, 30_000);
}

/* ---------- Split-flap engine ---------- */
const CHARS = 'ABCDEFGHIJKLMNOPRSTUVYZÇĞİÖŞÜ0123456789·-/';

function turn(cell: HTMLElement, ch: string) {
  cell.textContent = ch;
  cell.classList.remove('is-turning');
  // restart the CSS turn animation
  void cell.offsetWidth;
  cell.classList.add('is-turning');
}

function flap(el: HTMLElement, delay = 0): Promise<void> {
  const cells = Array.from(el.querySelectorAll<HTMLElement>('.cell'));
  return new Promise((resolve) => {
    let pending = 0;
    cells.forEach((cell, i) => {
      const target = cell.dataset.c ?? '';
      if (target === ' ') return;
      pending++;
      let spins = 3 + Math.floor(Math.random() * 5);
      const step = () => {
        if (spins-- <= 0) {
          turn(cell, target);
          if (--pending === 0) resolve();
          return;
        }
        turn(cell, CHARS[(Math.random() * CHARS.length) | 0]);
        setTimeout(step, 62);
      };
      setTimeout(step, delay + i * 28);
    });
    if (pending === 0) resolve();
  });
}

/* ---------- Preloader: the board spells the name, then lifts ---------- */
const preloader = document.querySelector<HTMLElement>('[data-preloader]');
function runPreloader(): Promise<void> {
  if (!preloader || !root.classList.contains('js-intro')) {
    preloader?.remove();
    return Promise.resolve();
  }
  const lines = Array.from(preloader.querySelectorAll<HTMLElement>('[data-flap]'));
  const bar = preloader.querySelector<HTMLElement>('[data-preloader-bar]');
  lenis?.stop();
  let done = false;
  return new Promise((resolve) => {
    const finish = () => {
      if (done) return;
      done = true;
      try { sessionStorage.setItem('ofe-intro', '1'); } catch {}
      preloader.classList.add('is-leaving');
      setTimeout(() => {
        preloader.remove();
        root.classList.remove('js-intro');
        lenis?.start();
      }, 900);
      resolve();
    };
    preloader.addEventListener('click', finish, { once: true });
    bar?.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 2100, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });
    (async () => {
      await Promise.all([lines[0] && flap(lines[0], 80), lines[1] && flap(lines[1], 260)]);
      if (lines[2]) await flap(lines[2]);
      setTimeout(finish, 350);
    })();
  });
}

if (!reduced) {
  const boards = Array.from(document.querySelectorAll<HTMLElement>('[data-flap]')).filter((b) => !b.closest('[data-preloader]'));
  const hero = document.querySelector('.hero');
  const heroFlaps = boards.filter((b) => hero?.contains(b));
  const otherFlaps = boards.filter((b) => !hero?.contains(b));

  // Hero: name, then role, then the status blinks before its flaps turn.
  (async () => {
    await runPreloader();
    const [first, last, role, dest, status] = heroFlaps;
    await Promise.all([first && flap(first, 150), last && flap(last, 420)]);
    if (role) await flap(role);
    if (dest) flap(dest);
    if (status) {
      status.classList.add('is-announcing');
      await new Promise((r) => setTimeout(r, 900));
      status.classList.remove('is-announcing');
      await flap(status);
    }
  })();

  // Everything else turns when it first scrolls into view.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        const statusCell = el.classList.contains('status');
        if (statusCell) {
          el.classList.add('is-announcing');
          setTimeout(() => {
            el.classList.remove('is-announcing');
            flap(el);
          }, 700);
        } else {
          flap(el);
        }
      });
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  otherFlaps.forEach((b) => io.observe(b));
}

if (reduced) preloader?.remove();

/* ---------- Departures: gate cards stack, each new one slides up over the last ---------- */
const stackCards = Array.from(document.querySelectorAll<HTMLElement>('[data-card]')).map((card) => ({
  card,
  inner: card.firstElementChild as HTMLElement,
  shade: card.querySelector<HTMLElement>('[data-card-shade]'),
  stick: 0,
}));
function measureStack() {
  const vh = window.innerHeight;
  stackCards.forEach((c, i) => {
    // Pin under the topbar with a small step so earlier cards peek out above;
    // a card taller than the screen pins by its bottom edge instead.
    const base = 76 + i * 12;
    c.stick = Math.min(base, vh - c.card.offsetHeight - 16);
    c.card.style.setProperty('--stick', `${c.stick}px`);
  });
}
function updateStack() {
  const vh = window.innerHeight;
  for (let i = 0; i < stackCards.length - 1; i++) {
    const cur = stackCards[i];
    const next = stackCards[i + 1];
    const top = next.card.getBoundingClientRect().top;
    const p = clamp01((vh - top) / Math.max(1, vh - next.stick)); // 0 → 1 while the next card rises
    cur.inner.style.transform = `scale(${(1 - p * 0.06).toFixed(4)})`;
    if (cur.shade) cur.shade.style.opacity = (p * 0.6).toFixed(3);
  }
}
if (!reduced && stackCards.length) {
  measureStack();
  window.addEventListener('resize', measureStack);
  window.addEventListener('load', measureStack);
  new ResizeObserver(measureStack).observe(document.querySelector('[data-stack]')!);
}

/* ---------- Projects rail: vertical scroll drives a horizontal track ---------- */
const rail = document.querySelector<HTMLElement>('[data-rail]');
const track = document.querySelector<HTMLElement>('[data-rail-track]');
const wide = window.matchMedia('(min-width: 1100px)');
if (rail && track) {
  let distance = 0;
  const measure = () => {
    if (!wide.matches || reduced) {
      rail.style.height = '';
      track.style.transform = '';
      distance = 0;
      return;
    }
    distance = Math.max(0, track.scrollWidth - window.innerWidth);
    rail.style.height = `${window.innerHeight + distance}px`;
    lenis?.resize();
  };
  const update = () => {
    if (!distance) return;
    const top = rail.getBoundingClientRect().top;
    const p = Math.min(1, Math.max(0, -top / distance));
    track.style.transform = `translate3d(${-p * distance}px,0,0)`;
  };
  measure();
  window.addEventListener('resize', () => {
    measure();
    update();
  });
  wide.addEventListener('change', measure);
  window.addEventListener('load', () => {
    measure();
    update();
  });
  if (lenis) lenis.on('scroll', update);
  else window.addEventListener('scroll', update, { passive: true });
}

/* ---------- Scroll reveals ---------- */
if (!reduced) {
  const revealIO = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -10% 0px' },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => revealIO.observe(el));
} else {
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
}

/* ---------- Signage bands: vertical scroll pushes them sideways ---------- */
const bands = Array.from(document.querySelectorAll<HTMLElement>('[data-band]')).map((band) => ({
  band,
  track: band.querySelector<HTMLElement>('[data-band-track]')!,
  dir: Number(band.dataset.band) || -1,
}));
function updateBands() {
  const vh = window.innerHeight;
  for (const { band, track, dir } of bands) {
    const r = band.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) continue;
    const third = track.scrollWidth / 3;
    // progress through the viewport, mapped to up to one third of the track
    const p = (vh - r.top) / (vh + r.height);
    const x = dir < 0 ? -p * third * 0.9 : -third + p * third * 0.9;
    track.style.transform = `translate3d(${x}px,0,0)`;
  }
}

/* ---------- The plane: takes off, cruises across the page, lands before contact ---------- */
const plane = document.querySelector<HTMLElement>('[data-plane]');
const planeFlip = document.querySelector<HTMLElement>('[data-plane-flip]');
const runway = document.querySelector<HTMLElement>('[data-runway]');
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

const TAKEOFF = 0.1;
const LANDING = 0.86;
const PHI0 = Math.asin(0.12 / 0.38); // cruise starts at x = 0.62
const PHI_SPAN = 2 * Math.PI + (2 * Math.PI - Math.asin(0.2 / 0.38)) - PHI0; // ends at x = 0.30 heading right

function planeAt(p: number): { x: number; y: number } {
  // x as a fraction of viewport width, y as a fraction of height (nose-line of the plane)
  if (p < TAKEOFF) {
    const t = p / TAKEOFF;
    const lift = smooth(clamp01((t - 0.45) / 0.55));
    return { x: lerp(0.06, 0.62, t * t), y: lerp(0.93, 0.3, lift) };
  }
  if (p < LANDING) {
    const t = (p - TAKEOFF) / (LANDING - TAKEOFF);
    const phi = PHI0 + t * PHI_SPAN;
    const ph = t * PHI_SPAN;
    return { x: 0.5 + 0.38 * Math.sin(phi), y: 0.3 + 0.07 * (1 - Math.cos(ph * 0.9)) };
  }
  const end = planeAt(LANDING - 1e-6);
  const t = (p - LANDING) / (1 - LANDING);
  if (t < 0.72) {
    const g = t / 0.72;
    return { x: lerp(end.x, 0.66, g), y: lerp(end.y, 0.93, smooth(g)) };
  }
  const r = (t - 0.72) / 0.28;
  return { x: lerp(0.66, 0.8, 1 - (1 - r) * (1 - r)), y: 0.93 };
}

let planeDir = 1;
function updatePlane() {
  if (!plane || !planeFlip || !runway) return;
  // touch down just before the closing band and the contact sign scroll into view
  const arrival = document.querySelector<HTMLElement>('[data-band="1"]') ?? document.getElementById('contact');
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const endScroll = Math.max(1, (arrival ? arrival.offsetTop : document.body.scrollHeight) - vh * 1.02);
  const p = clamp01(window.scrollY / endScroll);

  const a = planeAt(p);
  const b = planeAt(Math.min(1, p + 0.0025));
  const dx = (b.x - a.x) * vw;
  const dy = (b.y - a.y) * vh;
  if (Math.abs(dx) > 0.2) planeDir = dx > 0 ? 1 : -1;
  const onGround = a.y >= 0.929;
  const angle = onGround ? 0 : Math.max(-16, Math.min(16, (Math.atan2(dy, Math.abs(dx) || 1) * 180) / Math.PI)) * planeDir;

  const w = plane.offsetWidth;
  const h = w * 0.36;
  const px = a.x * vw - w / 2;
  const py = a.y * vh - h * 0.84; // wheels sit on the runway line
  plane.style.transform = `translate3d(${px}px,${py}px,0) rotate(${angle}deg)`;
  planeFlip.style.transform = `scaleX(${planeDir})`;
  plane.classList.toggle('gear-down', p < TAKEOFF * 0.7 || p > LANDING + (1 - LANDING) * 0.35);
  plane.classList.add('is-ready');
  runway.style.opacity = String(Math.max(1 - p / (TAKEOFF * 0.8), smooth(clamp01((p - LANDING - 0.03) / 0.08))));
}

if (!reduced) {
  const onFrame = () => {
    updateBands();
    updatePlane();
    updateGhosts();
    updateParallax();
    updateWords();
    updateStack();
    updateDeck();
  };
  queueMicrotask(onFrame); // run after the effect modules below are initialised
  if (lenis) lenis.on('scroll', onFrame);
  else window.addEventListener('scroll', onFrame, { passive: true });
  window.addEventListener('resize', onFrame);
  window.addEventListener('load', onFrame);
}

/* ---------- Travel deck: a pile of postcards dealt into a row as you scroll ---------- */
const deck = document.querySelector<HTMLElement>('[data-deck]');
const deckCards = deck ? Array.from(deck.querySelectorAll<HTMLElement>('[data-deck-card]')) : [];
const deckWide = window.matchMedia('(min-width: 900px)');
const DECK_TILT = [-7, 3, 9]; // degrees, as they lie in the pile
const DECK_ORDER = [1, 2, 0]; // the top card (last in the DOM) is dealt first
let deckOffsets: { x: number; y: number }[] = [];
function measureDeck() {
  deckCards.forEach((c) => {
    c.style.transform = '';
    const cap = c.querySelector<HTMLElement>('.travel__cap');
    if (cap) cap.style.opacity = '';
  });
  deckOffsets = [];
  if (!deck || !deckWide.matches) return;
  const list = deckCards[0]?.parentElement?.getBoundingClientRect();
  if (!list) return;
  const cx = list.left + list.width / 2;
  const cy = list.top + list.height / 2;
  deckOffsets = deckCards.map((c) => {
    const r = c.getBoundingClientRect();
    return { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) };
  });
  updateDeck();
}
function updateDeck() {
  if (!deck || !deckOffsets.length) return;
  const r = deck.getBoundingClientRect();
  const range = Math.max(1, r.height - window.innerHeight);
  const p = clamp01(-r.top / range / 0.8); // finish dealing with a short hold at the end
  deckCards.forEach((c, i) => {
    const q = clamp01((p - DECK_ORDER[i] * 0.2) / 0.6);
    const k = Math.pow(1 - q, 3); // ease-out: 1 in the pile → 0 in place
    const o = deckOffsets[i];
    const cap = c.querySelector<HTMLElement>('.travel__cap');
    if (cap) cap.style.opacity = clamp01((q - 0.6) / 0.4).toFixed(3); // caption appears as the card lands
    c.style.transform = `translate3d(${(o.x * k).toFixed(1)}px,${(o.y * k + 24 * k).toFixed(1)}px,0) rotate(${(DECK_TILT[i] * k).toFixed(2)}deg) scale(${(1 - 0.1 * k).toFixed(3)})`;
  });
}
if (!reduced && deck) {
  measureDeck();
  window.addEventListener('resize', measureDeck);
  window.addEventListener('load', measureDeck);
  deckWide.addEventListener('change', measureDeck);
}

/* ---------- Ghost headings: huge outlined words drift sideways with scroll ---------- */
const ghosts = Array.from(document.querySelectorAll<HTMLElement>('[data-ghost]')).map((el) => ({
  el,
  dir: Number(el.dataset.ghost) || 1,
  host: el.parentElement as HTMLElement,
}));
function updateGhosts() {
  const vh = window.innerHeight;
  for (const { el, dir, host } of ghosts) {
    const r = host.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) continue;
    const p = (vh - r.top) / (vh + r.height); // 0 → 1 while the section crosses the screen
    el.style.transform = `translate3d(${(dir > 0 ? 12 - p * 34 : -22 + p * 34)}vw,0,0)`;
  }
}

/* ---------- Photo parallax: the image drifts inside its frame ---------- */
const parallax = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
  .map((frame) => ({ frame, img: frame.querySelector<HTMLImageElement>('img') }))
  .filter((p): p is { frame: HTMLElement; img: HTMLImageElement } => !!p.img);
function updateParallax() {
  const vh = window.innerHeight;
  for (const { frame, img } of parallax) {
    const r = frame.getBoundingClientRect();
    if (r.bottom < -100 || r.top > vh + 100 || r.height === 0) continue;
    const p = (vh - r.top) / (vh + r.height) - 0.5; // -0.5 → 0.5
    img.style.transform = `translate3d(0,${(-p * 12).toFixed(2)}%,0) scale(1.14)`;
  }
}

/* ---------- Word-by-word reading light on the intro ---------- */
const wordBlocks = (reduced ? [] : Array.from(document.querySelectorAll<HTMLElement>('[data-words]'))).map((block) => {
  const words: HTMLElement[] = [];
  block.querySelectorAll('p').forEach((p) => {
    const text = p.textContent ?? '';
    p.textContent = '';
    text.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part) || part === '') {
        p.append(part);
        return;
      }
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = part;
      p.append(span);
      words.push(span);
    });
  });
  block.classList.add('is-split');
  return { block, words, lit: -1 };
});
function updateWords() {
  const vh = window.innerHeight;
  for (const w of wordBlocks) {
    const r = w.block.getBoundingClientRect();
    // fully lit by the time the block's bottom reaches 55% of the viewport
    const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (r.height + vh * 0.35)));
    const n = Math.round(p * w.words.length);
    if (n === w.lit) continue;
    w.words.forEach((el, i) => el.classList.toggle('is-lit', i < n));
    w.lit = n;
  }
}

/* ---------- Counters ---------- */
const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'));
if (!reduced && counters.length) {
  counters.forEach((c) => (c.textContent = '0'));
  const countIO = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        const el = e.target as HTMLElement;
        const to = Number(el.dataset.count);
        const start = performance.now();
        const dur = 1400;
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          el.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 4))));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    { rootMargin: '0px 0px -15% 0px' },
  );
  counters.forEach((c) => countIO.observe(c));
}

/* ---------- Certificate cards: 3D tilt toward the pointer ---------- */
if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width; // 0 → 1
      const y = (e.clientY - r.top) / r.height;
      el.classList.add('is-tilting');
      el.style.setProperty('--ry', `${((x - 0.5) * 10).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${((0.5 - y) * 8).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

/* ---------- Magnetic controls (fine pointers only) ---------- */
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (finePointer && !reduced) {
  document.querySelectorAll<HTMLElement>('.sign, .btn, .socials a, .lang, .form__send, .case__next').forEach((el) => {
    el.classList.add('magnet');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const my = (e.clientY - (r.top + r.height / 2)) * 0.3;
      el.style.setProperty('--mx', `${mx.toFixed(1)}px`);
      el.style.setProperty('--my', `${my.toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    });
  });
}

/* ---------- Top bar state ---------- */
const topbar = document.querySelector<HTMLElement>('[data-topbar]');
if (topbar) {
  const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Contact form (FormSubmit relay) ---------- */
const form = document.querySelector<HTMLFormElement>('[data-form]');
if (form) {
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const label = form.querySelector<HTMLElement>('[data-send-label]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const d = form.dataset;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    status.className = 'form__status';

    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = d.invalid!;
      status.classList.add('is-error');
      (form.querySelector(!name ? '[name="name"]' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '[name="email"]' : '[name="message"]') as HTMLElement).focus();
      return;
    }
    if (data.get('_honey')) return;

    button.disabled = true;
    label.textContent = d.sending!;
    status.textContent = '';
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${d.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          _replyto: email,
          _subject: `${d.subject}: ${name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || 'failed');
      form.reset();
      status.textContent = d.ok!;
      status.classList.add('is-ok');
    } catch {
      status.innerHTML = '';
      status.append(`${d.error} `);
      const a = document.createElement('a');
      a.href = `mailto:${d.email}`;
      a.textContent = d.email!;
      status.append(a);
      status.classList.add('is-error');
    } finally {
      button.disabled = false;
      label.textContent = d.send!;
    }
  });
}
