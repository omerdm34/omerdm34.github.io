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

const TURN: Keyframe[] = [{ transform: 'scaleY(0.55)', opacity: 0.7 }, { transform: 'scaleY(1)', opacity: 1 }];
function turn(cell: HTMLElement, ch: string) {
  cell.textContent = ch;
  // WAAPI restarts the turn without forcing a layout (the old class toggle read offsetWidth per cell)
  cell.animate(TURN, { duration: 90, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
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

/* ============ Scroll-linked effects ============
   Every effect is split into read (layout) and write (style) halves. One frame runs
   all reads first, then all writes, so the browser lays the page out once per frame.
   Positions that only change on resize are cached in measure(). */
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
let vw = window.innerWidth;
let vh = window.innerHeight;
type Write = (() => void) | void;
type Effect = { measure?: () => void; read: () => Write };
const effects: Effect[] = [];

/* ---------- Departures: gate cards stack, each new one slides up over the last ---------- */
const stackCards = Array.from(document.querySelectorAll<HTMLElement>('[data-card]')).map((card) => ({
  card,
  inner: card.firstElementChild as HTMLElement,
  shade: card.querySelector<HTMLElement>('[data-card-shade]'),
  stick: 0,
  p: -1,
}));
let stackLastShort = false;
let stackFade = -1;
function measureStack() {
  const heights = stackCards.map((c) => c.card.offsetHeight);
  stackCards.forEach((c, i) => {
    // Pin under the topbar with a small step so earlier cards peek out above;
    // a card taller than the screen pins by its bottom edge instead.
    c.stick = Math.min(76 + i * 12, vh - heights[i] - 16);
    c.card.style.setProperty('--stick', `${c.stick}px`);
  });
  // A short last card (phones) can't cover the cards behind it, so those fade out instead.
  const last = stackCards[stackCards.length - 1];
  stackLastShort = !!last && heights[heights.length - 1] < vh - 16 - last.stick - 4;
  if (!stackLastShort && stackFade !== -1) {
    stackCards.forEach((c) => (c.inner.style.opacity = ''));
    stackFade = -1;
  }
}
if (!reduced && stackCards.length) {
  effects.push({
    measure: measureStack,
    read: () => {
      const tops = stackCards.map((c) => c.card.getBoundingClientRect().top);
      return () => {
        for (let i = 0; i < stackCards.length - 1; i++) {
          const cur = stackCards[i];
          const next = stackCards[i + 1];
          // 0 → 1 while the next card rises; rounded so idle frames write nothing
          const p = Math.round(clamp01((vh - tops[i + 1]) / Math.max(1, vh - next.stick)) * 500) / 500;
          if (p === cur.p) continue;
          cur.p = p;
          cur.inner.style.transform = p ? `scale(${(1 - p * 0.06).toFixed(4)})` : '';
          if (cur.shade) cur.shade.style.opacity = (p * 0.6).toFixed(3);
        }
        if (!stackLastShort || stackCards.length < 2) return;
        const fade = Math.round((1 - smooth(clamp01((stackCards[stackCards.length - 2].p - 0.3) / 0.7))) * 200) / 200;
        if (fade === stackFade) return;
        stackFade = fade;
        for (let i = 0; i < stackCards.length - 1; i++) stackCards[i].inner.style.opacity = fade < 1 ? String(fade) : '';
      };
    },
  });
}

/* ---------- Projects rail: vertical scroll drives a horizontal track ---------- */
const rail = document.querySelector<HTMLElement>('[data-rail]');
const track = document.querySelector<HTMLElement>('[data-rail-track]');
const railSticky = rail?.querySelector<HTMLElement>('.rail__sticky') ?? null;
const wide = window.matchMedia('(min-width: 1100px)');
let railDistance = 0;
if (rail && track && railSticky) {
  effects.push({
    measure: () => {
      if (!wide.matches || reduced) {
        rail.style.height = '';
        track.style.transform = '';
        railDistance = 0;
        return;
      }
      railDistance = Math.max(0, track.scrollWidth - vw);
      rail.style.height = `${vh + railDistance}px`;
    },
    read: () => {
      if (!railDistance) return;
      const top = rail.getBoundingClientRect().top;
      return () => {
        track.style.transform = `translate3d(${(-clamp01(-top / railDistance) * railDistance).toFixed(1)}px,0,0)`;
      };
    },
  });
  // Keyboard: the browser reveals a focused link by scrolling the clipped sticky box
  // sideways, which desyncs the rail. Undo that and scroll the page to the card instead.
  railSticky.addEventListener('scroll', () => {
    if (railSticky.scrollLeft) railSticky.scrollLeft = 0;
  });
  rail.addEventListener('focusin', (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('.proj');
    requestAnimationFrame(() => {
      railSticky.scrollLeft = 0;
      if (!railDistance || !item) return;
      const shift = clamp01((item.offsetLeft - (vw - item.offsetWidth) / 2) / railDistance) * railDistance;
      const y = rail.getBoundingClientRect().top + window.scrollY + shift;
      window.scrollTo(0, y); // Lenis follows native scroll when it isn't animating
    });
  });
}

/* ---------- Signage bands: vertical scroll pushes them sideways ---------- */
const bands = Array.from(document.querySelectorAll<HTMLElement>('[data-band]')).map((band) => ({
  band,
  track: band.querySelector<HTMLElement>('[data-band-track]')!,
  dir: Number(band.dataset.band) || -1,
  third: 0,
}));
if (!reduced) {
  effects.push({
    measure: () => bands.forEach((b) => (b.third = b.track.scrollWidth / 3)),
    read: () => {
      const rects = bands.map((b) => b.band.getBoundingClientRect());
      return () =>
        bands.forEach(({ track, dir, third }, i) => {
          const r = rects[i];
          if (r.bottom < -200 || r.top > vh + 200) return;
          // progress through the viewport, mapped to up to one third of the track
          const p = (vh - r.top) / (vh + r.height);
          const x = dir < 0 ? -p * third * 0.9 : -third + p * third * 0.9;
          track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        });
    },
  });
}

/* ---------- The plane: takes off, cruises across the page, lands before contact ---------- */
const plane = document.querySelector<HTMLElement>('[data-plane]');
const planeFlip = document.querySelector<HTMLElement>('[data-plane-flip]');
const runway = document.querySelector<HTMLElement>('[data-runway]');

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
let planeW = 0;
let planeEnd = 1;
if (!reduced && plane && planeFlip && runway) {
  effects.push({
    measure: () => {
      // touch down just before the closing band and the contact sign scroll into view
      const arrival = document.querySelector<HTMLElement>('[data-band="1"]') ?? document.getElementById('contact');
      const arrivalTop = arrival ? arrival.getBoundingClientRect().top + window.scrollY : document.body.scrollHeight;
      planeEnd = Math.max(1, arrivalTop - vh * 1.02);
      planeW = plane.offsetWidth;
    },
    read: () => {
      const p = clamp01(window.scrollY / planeEnd);
      return () => {
        const a = planeAt(p);
        const b = planeAt(Math.min(1, p + 0.0025));
        const dx = (b.x - a.x) * vw;
        const dy = (b.y - a.y) * vh;
        if (Math.abs(dx) > 0.2) planeDir = dx > 0 ? 1 : -1;
        const onGround = a.y >= 0.929;
        const angle = onGround ? 0 : Math.max(-16, Math.min(16, (Math.atan2(dy, Math.abs(dx) || 1) * 180) / Math.PI)) * planeDir;
        const px = a.x * vw - planeW / 2;
        const py = a.y * vh - planeW * 0.36 * 0.84; // wheels sit on the runway line
        plane.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) rotate(${angle.toFixed(2)}deg)`;
        planeFlip.style.transform = `scaleX(${planeDir})`;
        plane.classList.toggle('gear-down', p < TAKEOFF * 0.7 || p > LANDING + (1 - LANDING) * 0.35);
        plane.classList.add('is-ready');
        runway.style.opacity = String(Math.max(1 - p / (TAKEOFF * 0.8), smooth(clamp01((p - LANDING - 0.03) / 0.08))));
      };
    },
  });
}

/* ---------- Travel deck: a pile of postcards dealt into a row as you scroll ---------- */
const deck = document.querySelector<HTMLElement>('[data-deck]');
const deckCards = deck
  ? Array.from(deck.querySelectorAll<HTMLElement>('[data-deck-card]')).map((el) => ({ el, cap: el.querySelector<HTMLElement>('.travel__cap') }))
  : [];
const deckWide = window.matchMedia('(min-width: 900px)');
const DECK_TILT = [-7, 3, 9]; // degrees, as they lie in the pile
const DECK_ORDER = [1, 2, 0]; // the top card (last in the DOM) is dealt first
let deckOffsets: { x: number; y: number }[] = [];
if (!reduced && deck) {
  effects.push({
    measure: () => {
      deckCards.forEach(({ el, cap }) => {
        el.style.transform = '';
        if (cap) cap.style.opacity = '';
      });
      deckOffsets = [];
      if (!deckWide.matches) return;
      const list = deckCards[0]?.el.parentElement?.getBoundingClientRect();
      if (!list) return;
      const cx = list.left + list.width / 2;
      const cy = list.top + list.height / 2;
      deckOffsets = deckCards.map(({ el }) => {
        const r = el.getBoundingClientRect();
        return { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) };
      });
    },
    read: () => {
      if (!deckOffsets.length) return;
      const r = deck.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      const p = clamp01(-r.top / Math.max(1, r.height - vh) / 0.8); // finish dealing with a short hold at the end
      return () =>
        deckCards.forEach(({ el, cap }, i) => {
          const q = clamp01((p - DECK_ORDER[i] * 0.2) / 0.6);
          const k = Math.pow(1 - q, 3); // ease-out: 1 in the pile → 0 in place
          const o = deckOffsets[i];
          if (cap) cap.style.opacity = clamp01((q - 0.6) / 0.4).toFixed(3); // caption appears as the card lands
          el.style.transform = k
            ? `translate3d(${(o.x * k).toFixed(1)}px,${(o.y * k + 24 * k).toFixed(1)}px,0) rotate(${(DECK_TILT[i] * k).toFixed(2)}deg) scale(${(1 - 0.1 * k).toFixed(3)})`
            : '';
        });
    },
  });
}

/* ---------- Ghost headings: huge outlined words drift sideways with scroll ---------- */
const ghosts = Array.from(document.querySelectorAll<HTMLElement>('[data-ghost]')).map((el) => ({
  el,
  dir: Number(el.dataset.ghost) || 1,
  host: el.parentElement as HTMLElement,
}));
if (!reduced) {
  effects.push({
    read: () => {
      const rects = ghosts.map((g) => g.host.getBoundingClientRect());
      return () =>
        ghosts.forEach(({ el, dir }, i) => {
          const r = rects[i];
          if (r.bottom < 0 || r.top > vh) return;
          const p = (vh - r.top) / (vh + r.height); // 0 → 1 while the section crosses the screen
          el.style.transform = `translate3d(${(dir > 0 ? 12 - p * 34 : -22 + p * 34).toFixed(2)}vw,0,0)`;
        });
    },
  });
}

/* ---------- Photo parallax: the image drifts inside its frame ---------- */
const parallax = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
  .map((frame) => ({ frame, img: frame.querySelector<HTMLImageElement>('img') }))
  .filter((p): p is { frame: HTMLElement; img: HTMLImageElement } => !!p.img);
if (!reduced) {
  effects.push({
    read: () => {
      const rects = parallax.map((p) => p.frame.getBoundingClientRect());
      return () =>
        parallax.forEach(({ img }, i) => {
          const r = rects[i];
          if (r.bottom < -100 || r.top > vh + 100 || r.height === 0) return;
          const p = (vh - r.top) / (vh + r.height) - 0.5; // -0.5 → 0.5
          img.style.transform = `translate3d(0,${(-p * 12).toFixed(2)}%,0) scale(1.14)`;
        });
    },
  });
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
  return { block, words, lit: 0 };
});
if (wordBlocks.length) {
  effects.push({
    read: () => {
      const rects = wordBlocks.map((w) => w.block.getBoundingClientRect());
      return () =>
        wordBlocks.forEach((w, i) => {
          const r = rects[i];
          // fully lit by the time the block's bottom reaches 55% of the viewport
          const n = Math.round(clamp01((vh * 0.9 - r.top) / (r.height + vh * 0.35)) * w.words.length);
          if (n === w.lit) return;
          // only touch the words whose state changed
          for (let k = Math.min(n, w.lit); k < Math.max(n, w.lit); k++) w.words[k].classList.toggle('is-lit', k < n);
          w.lit = n;
        });
    },
  });
}

/* ---------- Top bar state ---------- */
const topbar = document.querySelector<HTMLElement>('[data-topbar]');
if (topbar) {
  let scrolled: boolean | null = null;
  effects.push({
    read: () => {
      const s = window.scrollY > 24;
      if (s === scrolled) return;
      scrolled = s;
      return () => topbar.classList.toggle('is-scrolled', s);
    },
  });
}

/* ---------- Frame scheduler ---------- */
function frame() {
  const writes = effects.map((e) => e.read());
  for (const w of writes) if (w) w();
}
function measureAll() {
  vw = window.innerWidth;
  vh = window.innerHeight;
  for (const e of effects) e.measure?.();
  lenis?.resize();
  frame();
}
let queued = false;
const schedule = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    frame();
  });
};
// Touch browsers resize the viewport whenever the address bar slides in or out.
// Re-measuring the whole page for that made mobile scrolling stutter, so only a
// width change (rotation, window resize) or a large height change re-measures.
let lastW = vw;
let lastH = vh;
const coarse = window.matchMedia('(pointer: coarse)').matches;
let resizeQueued = false;
window.addEventListener('resize', () => {
  if (resizeQueued) return;
  resizeQueued = true;
  requestAnimationFrame(() => {
    resizeQueued = false;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w !== lastW || !coarse || Math.abs(h - lastH) > 160) {
      lastW = w;
      lastH = h;
      measureAll();
    } else {
      vh = h;
      frame();
    }
  });
});
wide.addEventListener('change', measureAll);
deckWide.addEventListener('change', measureAll);
window.addEventListener('load', measureAll);
if (!reduced && stackCards.length) {
  let roQueued = false;
  new ResizeObserver(() => {
    if (roQueued) return;
    roQueued = true;
    requestAnimationFrame(() => {
      roQueued = false;
      measureStack();
      frame();
    });
  }).observe(document.querySelector('[data-stack]')!);
}
if (lenis) lenis.on('scroll', frame); // Lenis emits inside its own animation frame
else window.addEventListener('scroll', schedule, { passive: true });
measureAll();

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
