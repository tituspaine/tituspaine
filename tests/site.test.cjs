const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const home = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const legal = fs.readFileSync(path.join(__dirname, '../legal-access/index.html'), 'utf8');
const experiments = fs.readFileSync(path.join(__dirname, '../experiments/index.html'), 'utf8');
const html = home + legal + experiments;
const css = fs.readFileSync(path.join(__dirname, '../editorial.css'), 'utf8') + fs.readFileSync(path.join(__dirname, '../interactive.css'), 'utf8');
const inline = value => [...value.matchAll(/<script(?![^>]*type="application\/ld\+json")(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x => x[1]).filter(Boolean);
const scripts = [fs.readFileSync(path.join(__dirname, '../site.js'), 'utf8'), ...inline(experiments), ...inline(legal)];

function dom() {
  const nodes = new Map();
  const document = { activeElement: null, getElementById: id => nodes.get(id), createElement: tag => new Element(tag) };
  class Element {
    constructor(tag = 'div', id) {
      this.tag = tag; this.children = []; this.attributes = {}; this.dataset = {}; this.events = {}; this.textContent = ''; this.disabled = false; this.inert = false;
      const classes = new Set();
      this.classList = { add: (...items) => items.forEach(x => classes.add(x)), remove: (...items) => items.forEach(x => classes.delete(x)), contains: c => classes.has(c) };
      Object.defineProperty(this, 'className', { set(value) { classes.clear(); value.split(/\s+/).forEach(x => classes.add(x)); } });
      const properties = new Map();
      this.style = { setProperty: (k,v) => properties.set(k,v), removeProperty: k => properties.delete(k), getPropertyValue: k => properties.get(k) };
      if (id) nodes.set(id, this);
    }
    appendChild(child) { child.parent = this; this.children.push(child); }
    setAttribute(k,v) { this.attributes[k] = String(v); }
    getAttribute(k) { return this.attributes[k] ?? null; }
    addEventListener(k,fn) { this.events[k] = fn; }
    focus() { document.activeElement = this; }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    closest(selector) { return selector === 'button,a' && ['button','a'].includes(this.tag) ? this : this.parent?.closest(selector) ?? null; }
    setPointerCapture() {}
    querySelectorAll(selector) {
      const matches = node => selector.startsWith('.') ? node.classList.contains(selector.slice(1)) : selector === '[data-next]' ? 'next' in node.dataset : selector === '[data-side]' ? 'side' in node.dataset : selector.startsWith('[data-sq=') ? node.dataset.sq === selector.match(/"([^"]+)"/)[1] : selector.startsWith('#') ? nodes.get(selector.slice(1)) === node : false;
      return this.children.flatMap(child => [...(matches(child) ? [child] : []), ...child.querySelectorAll(selector)]);
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
    set innerHTML(value) {
      this.children = [];
      for (const match of value.matchAll(/<button\b([^>]*)>([^<]*)<\/button>/g)) {
        const attributes = match[1], id = attributes.match(/id="([^"]+)"/)?.[1];
        const node = new Element('button', id); node.textContent = match[2];
        const side = attributes.match(/data-side="([^"]+)"/)?.[1]; if(side) node.dataset.side = side;
        this.appendChild(node);
      }
    }
  }
  return { nodes, document, Element };
}

test('all three inline programs compile', () => {
  assert.equal(scripts.length, 3);
  for (const script of scripts) assert.doesNotThrow(() => new vm.Script(script));
});

test('legal cards hide inactive controls and restore keyboard focus on progression', () => {
  const { nodes, document, Element } = dom();
  const deck = new Element('div', 'legalDeck');
  for (const id of ['legalPrev','legalNext','legalProgress','legalCount']) new Element('div', id);
  const cards = Array.from({ length: 5 }, () => { const c = new Element('article'); c.classList.add('legal-card'); deck.appendChild(c); return c; });
  for (const card of cards.slice(0,2)) for(let i=0;i<2;i++) { const b = new Element('button'); b.dataset.next = ''; card.appendChild(b); }
  new vm.Script(scripts[2]).runInNewContext({ document });
  assert.deepEqual(cards.map(c => c.inert), [false,true,true,true,true]);
  assert.deepEqual(cards.map(c => c.getAttribute('aria-hidden')), ['false','true','true','true','true']);
  cards[0].children[0].focus(); cards[0].children[0].events.click();
  assert.equal(document.activeElement, deck);
  assert.deepEqual(cards.map(c => c.inert), [true,false,true,true,true]);
  assert.equal(nodes.get('legalCount').textContent, '02 / 05');
  let prevented = false;
  deck.events.keydown({ key: 'ArrowRight', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(nodes.get('legalCount').textContent, '03 / 05');
});

test('legal drag uses unitless distance with dimensionally valid CSS transforms', () => {
  const { nodes, document, Element } = dom();
  const deck = new Element('div', 'legalDeck');
  for (const id of ['legalPrev','legalNext','legalProgress','legalCount']) new Element('div', id);
  const cards = Array.from({ length: 5 }, () => { const c = new Element('article'); c.classList.add('legal-card'); deck.appendChild(c); return c; });
  new vm.Script(scripts[2]).runInNewContext({ document });
  deck.events.pointerdown({ target: deck, clientX: 200, pointerId: 1 });
  deck.events.pointermove({ clientX: 100 });
  assert.equal(cards[0].style.getPropertyValue('--drag'), '-100');
  assert.match(css, /translate3d\(calc\(var\(--drag\) \* 1px\),0,0\)/);
  deck.events.pointerup();
  assert.equal(nodes.get('legalCount').textContent, '02 / 05');
});

function chess() {
  const { nodes, document, Element } = dom();
  for (const id of ['chessBoard','chessStatus','chessControls','chessOverlay','chessCard','playChess']) new Element('div', id);
  const modes = ['easy','medium','hard','legendary'].map(level => { const node = new Element('button'); node.dataset.level=level; return node; });
  document.querySelectorAll = selector => selector === '.chess-mode' ? modes : [];
  const frames = [], timers = new Map(); let nextTimer = 0, moves = 0;
  class Chess {
    get(sq) { return sq === 'e2' ? { color: 'w', type: 'p' } : null; }
    turn() { return 'w'; }
    in_check() { return false; }
    game_over() { return false; }
    moves() { moves++; return []; }
  }
  new vm.Script(scripts[1]).runInNewContext({ document, Chess, requestAnimationFrame: fn => frames.push(fn), setTimeout: fn => { timers.set(++nextTimer,fn); return nextTimer; }, clearTimeout: id => timers.delete(id) });
  return { nodes, modes, frames, timers, get moves() { return moves; } };
}

test('chess preview is not keyboard noise and active play exposes labels, difficulty state, and restart', () => {
  const c = chess(), board = c.nodes.get('chessBoard');
  assert.equal(board.children.length, 64);
  assert.ok(board.children.every(square => square.disabled));
  c.modes[0].onclick();
  c.nodes.get('playChess').onclick();
  c.nodes.get('chessControls').querySelectorAll('[data-side]')[0].onclick();
  assert.ok(c.modes.every(mode => mode.disabled));
  assert.equal(c.modes[0].getAttribute('aria-pressed'), 'true');
  assert.equal(board.querySelector('[data-sq="e2"]').getAttribute('aria-label'), 'e2: White pawn');
  assert.ok(c.nodes.get('newChessGame'));
  c.nodes.get('newChessGame').onclick();
  assert.ok(c.modes.every(mode => !mode.disabled));
  assert.match(c.nodes.get('chessStatus').textContent, /CHOOSE YOUR SIDE/);
});

test('new game cancels a queued computer turn before it can touch reset state', () => {
  const c = chess();
  c.nodes.get('playChess').onclick();
  c.nodes.get('chessControls').querySelectorAll('[data-side]')[1].onclick();
  assert.equal(c.frames.length, 1);
  c.nodes.get('newChessGame').onclick();
  c.frames[0]();
  assert.equal(c.timers.size, 0);
  assert.equal(c.moves, 0);
});

test('status and reduced-motion semantics are present', () => {
  assert.match(html, /id="chessStatus"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(css, /prefers-reduced-motion:reduce\)\{\*\{animation:none!important;transition:none!important/);
});

const pagePaths = ['index.html','work/index.html','about/index.html','legal-access/index.html','experiments/index.html'];
test('every page has one H1, canonical, matched mobile routes, and the new portrait metadata', () => {
 for (const file of pagePaths) {
  const page = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  assert.equal((page.match(/<h1\b/g)||[]).length, 1, file);
  assert.match(page, /rel="canonical" href="https:\/\/tituspaine.com/);
  assert.match(page, /property="og:image" content="https:\/\/tituspaine.com\/assets\/titus-paine-portrait.jpg"/);
  assert.match(page, /name="twitter:image" content="https:\/\/tituspaine.com\/assets\/titus-paine-portrait.jpg"/);
  assert.doesNotMatch(page, /titus-headshot.png|user-scalable=no|maximum-scale=1/);
  const menus=[...page.matchAll(/<nav[^>]*>([\s\S]*?)<\/nav>/g)].map(m=>[...m[1].matchAll(/href="([^"]+)"/g)].map(x=>x[1]));
  assert.equal(menus.length,2,file); assert.deepEqual(menus[0],menus[1],file);
  for(const route of ['/work/','/about/','/legal-access/','/experiments/','mailto:contact@tituspaine.com'])assert.ok(menus[0].includes(route),file+route);
 }
});
test('all local navigation, scripts, stylesheets and images resolve', () => {
 for (const file of pagePaths) {
  const page=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  for(const [,url] of page.matchAll(/(?:href|src)="(\/[^\"]*)"/g)){
   const clean=url.split('#')[0].split('?')[0];const target=path.join(__dirname,'..',clean.endsWith('/')?clean+'index.html':clean);
   assert.ok(fs.existsSync(target),file+' -> '+url);
  }
 }
});
test('homepage is focused and interactions live on their real destinations', () => {
 assert.match(home,/id="chessBoard"/); assert.doesNotMatch(home,/id="legalDeck"/); assert.ok(home.indexOf('id="chess"')>home.indexOf('id="contact"')); assert.match(home,/dctpa-preview.jpg/); assert.doesNotMatch(home,/→/);
 assert.match(experiments,/id="chessBoard"/);assert.match(legal,/id="legalDeck"/);
 assert.match(css,/\.intro-portrait img\{width:100%;height:auto;aspect-ratio:/);
 assert.match(home,/<img[^>]*alt="Titus Paine"[^>]*width="1145"[^>]*height="1374"/);
 assert.ok(fs.statSync(path.join(__dirname,'../assets/titus-paine-portrait.jpg')).size<300000);
});

test('chess pieces explicitly request text presentation rather than emoji', () => {
 assert.ok(experiments.includes(String.raw`sp.textContent=glyph[p]+'\uFE0E';`));
});

test('home chess uses the same tested program and engine as experiments',()=>{assert.deepEqual(inline(home),inline(experiments)); assert.match(home,/chess.js\/0.10.3/);});

test('editorial overrides follow interactive base styles on every interactive page',()=>{for(const page of [home,legal,experiments])assert.ok(page.indexOf('href="/interactive.css"')<page.indexOf('href="/editorial.css"'));});

test('removed decorative arrows leave no positional last-child selectors',()=>{assert.doesNotMatch(css,/\.route-strip a span:last-child|\.work-line>span:last-child|\.experiment-list>a>span:last-child/);});
