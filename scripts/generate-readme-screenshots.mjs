import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = resolve(root, 'docs/screenshots/source');
const outputDir = resolve(root, 'docs/screenshots/readme');

const baseStyle = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #eef3fb;
    color: #111827;
  }
  .frame {
    width: 1200px;
    height: var(--frame-height, 760px);
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 18% 18%, rgba(37, 99, 235, 0.12), transparent 25%),
      linear-gradient(180deg, #f7f9fd, #eef3fb);
  }
  .frame.dark {
    background:
      radial-gradient(circle at 18% 18%, rgba(79, 134, 255, 0.12), transparent 25%),
      linear-gradient(180deg, #0b1220, #101827);
    color: #f8fbff;
  }
  .shot {
    position: absolute;
    object-fit: cover;
    object-position: top left;
    border-radius: 24px;
    box-shadow: 0 28px 80px rgba(24, 33, 52, 0.2);
  }
  .dark .shot { box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42); }
  .phone {
    border-radius: 34px;
  }
  .marker {
    position: absolute;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: #2563eb;
    color: #fff;
    border: 4px solid #fff;
    font-size: 16px;
    font-weight: 900;
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.32);
    transform: translate(-50%, -50%);
  }
  .dark .marker { background: #4f86ff; border-color: #0b1220; }
  .legend {
    position: absolute;
    right: 34px;
    bottom: 34px;
    width: 344px;
    padding: 18px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(190, 202, 224, 0.9);
    box-shadow: 0 18px 50px rgba(24, 33, 52, 0.16);
    backdrop-filter: blur(14px);
  }
  .dark .legend {
    background: rgba(18, 28, 45, 0.9);
    border-color: rgba(49, 64, 94, 0.9);
  }
  .legend h1 {
    margin: 0 0 12px;
    font-size: 22px;
    line-height: 1.1;
  }
  .legend ol {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 10px;
  }
  .legend li {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 9px;
    align-items: start;
    font-size: 15px;
    line-height: 1.25;
  }
  .legend b {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: #2563eb;
    color: #fff;
    font-size: 13px;
    line-height: 1;
  }
  .dark .legend b { background: #4f86ff; }
  .mobile-layout .legend {
    top: 34px;
    bottom: auto;
  }
`;

const outputs = [
  {
    file: 'readme-desktop-route.png',
    source: 'desktop-route.png',
    title: 'Route view',
    dark: false,
    img: { left: 36, top: 54, width: 780, height: 586 },
    markers: [
      { n: 1, x: 636, y: 166, text: 'Toolbar controls density, measures, completed items, and search.' },
      { n: 2, x: 156, y: 306, text: 'Items are grouped into the order you walk through the store.' },
      { n: 3, x: 744, y: 250, text: 'Quantities and measurements stay attached to the item.' },
      { n: 4, x: 110, y: 250, text: 'Tick items off while shopping without leaving the route.' },
    ],
  },
  {
    file: 'readme-desktop-edit-share.png',
    source: 'desktop-edit-share.png',
    title: 'Edit and share',
    dark: false,
    frameHeight: 820,
    img: { left: 28, top: 42, width: 884, height: 776 },
    markers: [
      { n: 1, x: 134, y: 274, text: 'Choose the store layout profile used to sort aisles.' },
      { n: 2, x: 148, y: 454, text: 'Paste or type a rough grocery list.' },
      { n: 3, x: 262, y: 682, text: 'Save in place, or save and jump straight to the route.' },
      { n: 4, x: 560, y: 286, text: 'Share the editable list by link.' },
      { n: 5, x: 560, y: 448, text: 'Reveal a QR code only when needed.' },
      { n: 6, x: 804, y: 604, text: 'Recently opened shared lists are kept on this device.' },
    ],
  },
  {
    file: 'readme-mobile-edit-share.png',
    source: 'mobile-edit-share.png',
    title: 'Mobile edit and share',
    dark: false,
    img: { left: 64, top: 28, width: 346, height: 704 },
    markers: [
      { n: 1, x: 218, y: 176, text: 'The editor stacks cleanly on phone-sized screens.' },
      { n: 2, x: 244, y: 350, text: 'The pasted list stays readable with touch-sized controls.' },
      { n: 3, x: 238, y: 666, text: 'The install prompt stays dismissible.' },
      { n: 4, x: 538, y: 376, text: 'Sharing moves below the editor on mobile.' },
    ],
    mobile: true,
    splitMobile: true,
  },
  {
    file: 'readme-mobile-settings.png',
    source: 'mobile-settings.png',
    title: 'Mobile settings',
    dark: false,
    img: { left: 70, top: 28, width: 340, height: 704 },
    markers: [
      { n: 1, x: 252, y: 278, text: 'Language, country, theme, and route density use the same styled selector.' },
      { n: 2, x: 260, y: 366, text: 'Detected country stays visible when auto-detect is active.' },
      { n: 3, x: 242, y: 584, text: 'Preferences are stored locally on the current device.' },
    ],
    mobile: true,
  },
];

await mkdir(outputDir, { recursive: true });

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const browser = await chromium.launch({ headless: true });
try {
  for (const output of outputs) {
    const frameHeight = output.frameHeight ?? 760;
    const page = await browser.newPage({ viewport: { width: 1200, height: frameHeight }, deviceScaleFactor: 2 });
    const sourceBytes = await readFile(resolve(sourceDir, output.source));
    const sourceUrl = `data:image/png;base64,${sourceBytes.toString('base64')}`;
    const frameClass = ['frame', output.dark ? 'dark' : '', output.mobile ? 'mobile-layout' : ''].filter(Boolean).join(' ');

    const screenshotMarkup = output.splitMobile
      ? `
            <div class="shot phone" style="left: 64px; top: 28px; width: 320px; height: 704px; overflow: hidden;">
              <img src="${sourceUrl}" style="display: block; width: 320px; height: auto;" alt="">
            </div>
            <div class="shot phone" style="left: 438px; top: 118px; width: 320px; height: 560px; overflow: hidden;">
              <img src="${sourceUrl}" style="display: block; width: 320px; height: auto; transform: translateY(-820px);" alt="">
            </div>
          `
      : `<img class="shot ${output.mobile ? 'phone' : ''}" src="${sourceUrl}" style="left: ${output.img.left}px; top: ${output.img.top}px; width: ${output.img.width}px; height: ${output.img.height}px;" alt="">`;

    await page.setContent(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>${baseStyle}</style>
        </head>
        <body>
          <main class="${escapeHtml(frameClass)}" style="--frame-height: ${frameHeight}px;">
            ${screenshotMarkup}
            ${output.markers.map((marker) => `<div class="marker" style="left: ${marker.x}px; top: ${marker.y}px;">${marker.n}</div>`).join('')}
            <aside class="legend">
              <h1>${escapeHtml(output.title)}</h1>
              <ol>
                ${output.markers.map((marker) => `<li><b>${marker.n}</b><span>${escapeHtml(marker.text)}</span></li>`).join('')}
              </ol>
            </aside>
          </main>
        </body>
      </html>
    `);

    await page.locator('img').evaluateAll(async (images) => {
      await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    });

    await page.screenshot({
      path: resolve(outputDir, output.file),
      fullPage: false,
    });
    await page.close();
  }
} finally {
  await browser.close();
}
