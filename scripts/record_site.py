"""
Frame-perfect walkthrough recordings of client websites, for the Work wall and the project pages.

Like record_intro.py, it doesn't screen-record: it freezes the browser's clock and steps it one frame at a time,
taking a screenshot at each step, so every scroll and animation is smooth whatever the speed of this PC. A drawn
cursor moves to each menu link and clicks it.

  python scripts/record_site.py v1                 # V1 Supermarket (serve ~/Documents/Supermarket/dist on :8171)
  python scripts/record_site.py dar-distributors   # Dar Distributors (serve ~/Documents/dardistributors-site/site on :8172)

Writes public/images/websites/<name>.mp4 (1920 x 1080, the project page), <name>-tile.mp4 (960 x 540, the home
page's Work wall) and <name>-poster.jpg.
"""
import subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright
import imageio_ffmpeg

FPS = 30
W, H, DSF = 1536, 864, 1.25          # -> 1920 x 1080
OUT = Path(__file__).resolve().parent.parent / 'public' / 'images' / 'websites'
FF = imageio_ffmpeg.get_ffmpeg_exe()
CLOCK = '2026-10-24T11:00:00+03:00'  # a weekday morning in Dar es Salaam, so the sites say "Open now"

# Each tour: (action, ...). click: a link, found by selector, that the cursor moves to and presses.
TOURS = {
    'v1': ('http://localhost:8171/?nointro', [
        ('hold', 3.2),
        ('click', 'header a[href="/products"]'), ('hold', 1.4),
        ('scroll', 'bottom', 7.5), ('hold', 1.0),
        ('click', 'header a[href="/about"]'), ('hold', 1.4),
        ('scroll', 'bottom', 4.5), ('hold', 1.0),
        ('click', 'header a[href="/contact"]'), ('hold', 1.4),
        ('scroll', 'bottom', 4.0), ('hold', 1.8),
    ]),
    'dar-distributors': ('http://localhost:8172/', [
        ('hold', 2.6),
        ('scroll', 'bottom', 7.0), ('hold', 1.0),
        ('scroll', 0, 1.6),
        ('click', 'header a[href="brands.html"]'), ('hold', 1.4),
        ('scroll', 'bottom', 6.5), ('hold', 1.0),
        ('scroll', 0, 1.4),
        ('click', 'header a[href="about.html"]'), ('hold', 1.4),
        ('scroll', 'bottom', 4.5), ('hold', 1.0),
        ('scroll', 0, 1.2),
        ('click', 'header a[href="contact.html"]'), ('hold', 1.4),
        ('scroll', 'bottom', 2.0), ('hold', 1.8),
    ]),
}

# no smooth scrolling (we scroll ourselves), no scrollbars, and the drawn cursor
SETUP_JS = """
() => {
  if (!document.getElementById('rec-css')) {
    const s = document.createElement('style'); s.id = 'rec-css';
    s.textContent = `html { scroll-behavior: auto !important; scrollbar-width: none; } ::-webkit-scrollbar { display: none; }
      #rec-cur { position: fixed; left: 0; top: 0; z-index: 2147483647; pointer-events: none; width: 26px; height: 26px; translate: -3px -2px; }
      #rec-cur svg { display: block; filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
      #rec-ring { position: absolute; left: 3px; top: 2px; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; background: rgba(0,0,0,.18); scale: 0; }`;
    document.head.appendChild(s);
  }
  if (!document.getElementById('rec-cur')) {
    const c = document.createElement('div'); c.id = 'rec-cur';
    c.innerHTML = '<div id="rec-ring"></div><svg width="22" height="26" viewBox="0 0 22 26"><path d="M2 1.5v19.2l4.9-4.6 3.2 7.4 3.6-1.5-3.2-7.3h6.7z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.documentElement.appendChild(c);
  }
}
"""

# Every CSS animation and transition follows the frozen clock (as in record_intro.py); the cursor is placed.
FRAME_JS = """
([now, x, y, ring]) => {
  window.__seen = window.__seen || new WeakMap();
  for (const a of document.getAnimations()) {
    if (a.timeline && !(a.timeline instanceof DocumentTimeline)) continue;  // scroll-driven: follows the scroll itself
    if (!window.__seen.has(a)) window.__seen.set(a, now);
    a.pause();
    a.currentTime = now - window.__seen.get(a);
  }
  const c = document.getElementById('rec-cur');
  if (c) { c.style.left = x + 'px'; c.style.top = y + 'px'; c.firstChild.style.scale = ring; c.firstChild.style.opacity = 1 - ring * .6; }
}
"""


def ease(t):  # ease in-out (cubic)
    return 4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2


class Rec:
    def __init__(self, page, ff):
        self.page, self.ff, self.n = page, ff, 0
        self.x, self.y, self.ring = W * .62, H * .55, 0.0

    def ready(self):
        self.page.evaluate(SETUP_JS)

    def frame(self):
        p = self.page
        p.evaluate(SETUP_JS)
        p.evaluate(FRAME_JS, [p.evaluate('performance.now()'), self.x, self.y, self.ring])
        self.ff.stdin.write(p.screenshot(type='png', animations='allow', caret='initial'))
        self.n += 1
        if self.n % FPS == 0:
            print(f'  {self.n // FPS}s', end='', flush=True)
        p.clock.run_for(round(1000 / FPS))

    def hold(self, secs):
        for _ in range(round(secs * FPS)):
            self.frame()

    def scroll(self, to, secs):
        p = self.page
        y0 = p.evaluate('scrollY')
        top = p.evaluate('document.documentElement.scrollHeight - innerHeight')
        y1 = top if to == 'bottom' else min(to, top)
        n = max(1, round(secs * FPS))
        for i in range(1, n + 1):
            p.evaluate('y => scrollTo(0, y)', y0 + (y1 - y0) * ease(i / n))
            self.frame()

    def click(self, sel, move=1.0):
        p = self.page
        box = p.evaluate("""sel => { for (const a of document.querySelectorAll(sel)) { const r = a.getBoundingClientRect();
          if (r.width && r.height && r.top >= 0 && r.bottom <= innerHeight) return [r.left + r.width / 2, r.top + r.height / 2]; } return null; }""", sel)
        if not box:
            sys.exit(f'no visible link for {sel}')
        x0, y0 = self.x, self.y
        n = round(move * FPS)
        for i in range(1, n + 1):
            t = ease(i / n)
            self.x, self.y = x0 + (box[0] - x0) * t, y0 + (box[1] - y0) * t
            self.frame()
        for i in range(1, 5):  # press
            self.ring = i / 4
            self.frame()
        url = p.url
        p.evaluate("""sel => { for (const a of document.querySelectorAll(sel)) { const r = a.getBoundingClientRect();
          if (r.width && r.height && r.top >= 0 && r.bottom <= innerHeight) { a.click(); return; } } }""", sel)
        # let the next page arrive (real time; the frozen clock doesn't hold back the network)
        for _ in range(100):
            time.sleep(.1)
            if p.url != url:
                break
        try:
            p.wait_for_load_state('load', timeout=15000)
        except Exception:
            pass
        time.sleep(1.2)  # images
        for i in range(3, -1, -1):
            self.ring = i / 4
            self.frame()


def record(name):
    url, steps = TOURS[name]
    OUT.mkdir(parents=True, exist_ok=True)
    master = OUT / f'{name}.mp4'
    ff = subprocess.Popen([FF, '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
                           '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', str(master)],
                          stdin=subprocess.PIPE)
    with sync_playwright() as pw:
        b = pw.chromium.launch(channel='chrome', args=['--force-color-profile=srgb', '--font-render-hinting=none'])
        ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=DSF, reduced_motion='no-preference')
        page = ctx.new_page()
        page.clock.install(time=CLOCK)
        page.goto(url, wait_until='load')
        page.clock.pause_at(CLOCK.replace('11:00:00', '11:00:05'))
        page.evaluate('document.fonts.ready')
        time.sleep(2)
        r = Rec(page, ff)
        r.ready()
        print(name, end='', flush=True)
        for s in steps:
            getattr(r, s[0])(*s[1:])
        b.close()
    ff.stdin.close(); ff.wait()
    print('\nsaved', master)
    # the Work wall's copy: smaller and lighter, it plays muted in a tile
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', str(master), '-vf', 'scale=960:-2', '-c:v', 'libx264', '-preset', 'slow',
                    '-crf', '27', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', str(OUT / f'{name}-tile.mp4')], check=True)
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', str(master), '-frames:v', '1', '-q:v', '3', str(OUT / f'{name}-poster.jpg')], check=True)
    print('saved', OUT / f'{name}-tile.mp4', 'and the poster')


if __name__ == '__main__':
    for n in (sys.argv[1:] or TOURS):
        record(n)
