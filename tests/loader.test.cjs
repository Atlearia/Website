const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const html = readFileSync(require('node:path').join(__dirname, '../Website/index.html'), 'utf8');
const source = html.match(/<script id="loading-controller">([\s\S]*?)<\/script>/)[1];

function setup() {
  const nodes = new Map();
  const listeners = new Map();
  let now = 0;
  let watchdog;
  let timeout;
  let timeoutDelay;
  let animation;
  const document = {
    getElementById(id) {
      if (!nodes.has(id)) {
        const classes = new Set();
        nodes.set(id, {
          textContent: '', style: {}, hidden: true, attributes: {},
          duration: 0, currentTime: 0, paused: true,
          pause() {},
          addEventListener() {},
          setAttribute(key, value) { this.attributes[key] = value; },
          removeAttribute(key) { delete this.attributes[key]; },
          classList: {
            add: value => classes.add(value),
            remove: value => classes.delete(value),
            contains: value => classes.has(value),
            toggle(value, on) { if (on) classes.add(value); else classes.delete(value); }
          }
        });
      }
      return nodes.get(id);
    }
  };
  const window = {
    addEventListener: (type, callback) => listeners.set(type, callback),
    removeEventListener: type => listeners.delete(type)
  };
  vm.runInNewContext(source, {
    document, window, Date: { now: () => now }, navigator: { onLine: true },
    location: { reload() {} }, console: { error() {} }, ErrorEvent: class {},
    setInterval: callback => { watchdog = callback; return 1; }, clearInterval() {}, clearTimeout() {},
    setTimeout: (callback, delay) => { timeout = callback; timeoutDelay = delay; },
    requestAnimationFrame: callback => { animation = callback; return 1; }, cancelAnimationFrame() {}
  });
  return {
    loader: window.sceneLoader, get: id => document.getElementById(id), listeners,
    tick() { now += 21000; watchdog(); }, finish() { now += timeoutDelay; timeout(); },
    animate(ms = 16) { now += ms; animation(); },
    advance(ms) { for (let elapsed = 0; elapsed < ms; elapsed += 16) { now += Math.min(16, ms - elapsed); animation(); } },
    finishDelay() { return timeoutDelay; }
  };
}

test('download percentage works before video metadata arrives', () => {
  const { loader, get, advance } = setup();
  loader.progress(25, 100);
  advance(250);
  assert.equal(get('loader-percent').textContent, '22%');
  assert.equal(get('progress-fill').style.transform, 'scaleX(0.225)');
});

test('unknown download size stays indeterminate without inventing a percentage', () => {
  const { loader, get } = setup();
  loader.progress(1048576, 0);
  assert.equal(get('loader-percent').textContent, '…');
  assert.equal(get('loader-status').textContent, 'Loading…');
  assert.equal(get('loader-progress').attributes['aria-valuenow'], undefined);
});

test('download completion shows preparation until the scene is ready', () => {
  const { loader, get, finish, advance } = setup();
  loader.progress(100, 100);
  advance(1000);
  assert.equal(get('loader-status').textContent, 'Almost ready…');
  assert.equal(get('loader-percent').textContent, '90%');
  assert.equal(get('loader-progress').classList.contains('indeterminate'), false);
  loader.preparing();
  advance(100);
  assert.equal(get('loader-status').textContent, 'Almost ready…');
  assert.equal(get('loader-percent').textContent, '95%');
  let calls = 0;
  loader.complete(() => calls++);
  loader.complete(() => calls++);
  finish();
  assert.equal(calls, 1);
  assert.equal(get('loader-percent').textContent, '100%');
  assert.equal(get('loader').classList.contains('hidden'), true);
});

test('a video with no metadata cannot trap a ready scene', () => {
  const { loader, get, finish } = setup();
  loader.complete(() => {});
  finish();
  assert.equal(get('loader').classList.contains('hidden'), true);
});

test('a buffered video gets a bounded finish, even if playback never advances', () => {
  const { loader, get, finish, finishDelay } = setup();
  const video = get('loader-tree-video');
  video.readyState = 4;
  let pauses = 0;
  video.pause = () => pauses++;
  loader.complete(() => {});
  assert.equal(pauses, 0, 'do not freeze the tree immediately at scene readiness');
  assert.equal(finishDelay(), 1600, 'entry must never depend on a video ended event');
  finish();
  assert.equal(get('loader').classList.contains('hidden'), true);
  assert.equal(pauses, 1);
});

test('stalls expose retry and fresh download activity recovers', () => {
  const { loader, get, tick, advance } = setup();
  loader.downloadStarted();
  tick();
  assert.equal(get('loader-retry').hidden, false);
  assert.match(get('loader-status').textContent, /longer than usual/);
  loader.progress(50, 100);
  advance(500);
  assert.equal(get('loader-retry').hidden, true);
  assert.equal(get('loader-percent').textContent, '45%');
});

test('progress never resets when totals disappear or late download events arrive', () => {
  const { loader, get, advance } = setup();
  loader.progress(80, 100);
  advance(800);
  assert.equal(get('loader-percent').textContent, '72%');
  loader.progress(85, 0);
  assert.equal(get('loader-percent').textContent, '72%');
  loader.progress(90, 200);
  assert.equal(get('loader-percent').textContent, '72%');
  loader.decoding();
  advance(200);
  loader.progress(95, 100);
  assert.equal(get('loader-percent').textContent, '90%');
  loader.preparing();
  advance(100);
  loader.decoding();
  assert.equal(get('loader-percent').textContent, '95%');
  assert.equal(get('loader-progress').classList.contains('indeterminate'), false);
});

test('failure remains visible despite late progress, animation or completion', () => {
  const { loader, get, animate } = setup();
  loader.fail(new Error('Download failed'));
  loader.progress(50, 100);
  loader.complete(() => assert.fail('must not enter a failed scene'));
  animate();
  assert.equal(get('loader-percent').textContent, 'Load failed');
  assert.equal(get('loader-retry').hidden, false);
  assert.equal(get('loader').classList.contains('hidden'), false);
});

test('blocked analytics and unrelated runtime errors cannot fail a healthy scene', () => {
  const { loader, get, listeners, finish, advance } = setup();
  const onError = listeners.get('error');
  onError({ target: { tagName: 'SCRIPT', src: 'https://static.cloudflareinsights.com/beacon.min.js' } });
  onError({ message: 'Unrelated script threw', error: new Error('Optional script failed') });
  loader.progress(50, 100);
  advance(500);
  assert.equal(get('loader-percent').textContent, '45%');
  loader.complete(() => {});
  finish();
  assert.equal(get('loader').classList.contains('hidden'), true);
});

test('scene script failures surface an actionable error, decorative media failures do not', () => {
  const { get, listeners } = setup();
  const onError = listeners.get('error');
  onError({ target: { tagName: 'VIDEO' } });
  assert.notEqual(get('loader-percent').textContent, 'Load failed');
  onError({ target: { tagName: 'SCRIPT', id: 'scene-module' } });
  assert.equal(get('loader-percent').textContent, 'Load failed');
});


test('a sparse 20-to-100 burst paints intermediate values with bar and number synchronized', () => {
  const { loader, get, advance, animate } = setup();
  loader.progress(20, 90);
  advance(250);
  assert.equal(get('loader-percent').textContent, '20%');
  loader.decoding();
  loader.preparing();
  let calls = 0;
  loader.complete(() => calls++);
  assert.equal(get('loader-percent').textContent, '20%', 'new target must not jump the displayed number');
  let previous = 20;
  const values = [];
  for (let i = 0; i < 65; i++) {
    animate();
    const value = Number.parseInt(get('loader-percent').textContent);
    const scale = Number(get('progress-fill').style.transform.match(/scaleX\((.+)\)/)[1]);
    assert.ok(scale * 100 >= value - 1e-8 && scale * 100 < value + 1 + 1e-8);
    assert.ok(value >= previous && value - previous <= 2, 'no skipped stretch of progress');
    values.push(value);
    previous = value;
  }
  assert.ok(values.some(value => value > 40 && value < 60));
  assert.equal(previous, 100);
  assert.equal(calls, 1);
  assert.equal(get('loader').classList.contains('hidden'), true);
});

test('smoothing stops at real progress and cannot finish an unready scene', () => {
  const { loader, get, advance } = setup();
  loader.progress(20, 90);
  advance(5000);
  assert.equal(get('loader-percent').textContent, '20%');
  loader.preparing();
  advance(5000);
  assert.equal(get('loader-percent').textContent, '95%');
  assert.equal(get('loader').classList.contains('hidden'), false);
});

test('a long main-thread pause does not cause a jump on the next animation frame', () => {
  const { loader, get, advance, animate } = setup();
  loader.progress(20, 90);
  advance(250);
  loader.preparing();
  animate(3000);
  assert.equal(get('loader-percent').textContent, '25%');
});
