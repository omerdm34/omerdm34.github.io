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

if (!reduced) {
  const boards = Array.from(document.querySelectorAll<HTMLElement>('[data-flap]'));
  const hero = document.querySelector('.hero');
  const heroFlaps = boards.filter((b) => hero?.contains(b));
  const otherFlaps = boards.filter((b) => !hero?.contains(b));

  // Hero: name, then role, then the status blinks before its flaps turn.
  (async () => {
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

/* ---------- Departure rows ---------- */
document.querySelectorAll<HTMLButtonElement>('[data-row-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const panel = document.getElementById(btn.getAttribute('aria-controls')!)!;
    const row = btn.closest<HTMLElement>('[data-row]')!;
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    row.classList.toggle('is-open', !open);
    if (open) {
      panel.hidden = true;
    } else {
      panel.hidden = false;
      if (!reduced) {
        panel.animate(
          [
            { clipPath: 'inset(0 0 100% 0)', opacity: 0.2 },
            { clipPath: 'inset(0 0 0% 0)', opacity: 1 },
          ],
          { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        );
      }
    }
    lenis?.resize();
  });
});

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
  };
  onFrame();
  if (lenis) lenis.on('scroll', onFrame);
  else window.addEventListener('scroll', onFrame, { passive: true });
  window.addEventListener('resize', onFrame);
  window.addEventListener('load', onFrame);
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
