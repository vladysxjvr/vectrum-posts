/* Editor UI: tabs, text fields, background, live preview, MP4 / PNG download. */
(function () {
  const $ = id => document.getElementById(id);
  const M = window.Mediabunny, FPS = window.COMMON.fps;
  const cv = $('c'), engine = window.createEngine(cv);

  const S = {
    variant: '02-network', format: '9x16',
    h1: { text: 'Smarter Transport. Together.', marks: [] },
    h2: 'Run your transport business as one',
    line: true, pos: 'top',
    dim: 0.55, zoom: 1, panX: 0, panY: 0, anim: true,
    bg: null, // { kind, name, source, w, h, url, track?, input?, duration?, first? }
  };
  S.h1.marks = [...S.h1.text].map((_, i) => i >= 19);

  const STORE = 'vectrum-posts-v1';
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved) for (const k of ['variant', 'format', 'h1', 'h2', 'line', 'pos', 'dim', 'anim']) if (k in saved) S[k] = saved[k];
    if (!window.VARIANTS[S.variant]) S.variant = '02-network';
    if (!window.FORMATS[S.format]) S.format = '9x16';
  } catch (e) { /* storage is only a convenience */ }
  function remember() {
    try { localStorage.setItem(STORE, JSON.stringify({ variant: S.variant, format: S.format, h1: S.h1, h2: S.h2, line: S.line, pos: S.pos, dim: S.dim, anim: S.anim })); } catch (e) { /* see above */ }
  }

  // ---------- drawing ----------
  let frame = 0, playing = true, t0 = 0, dirty = true, busy = false, lastFrame = -1;

  function drawOptions(grain, source) {
    const bg = S.bg && { source: source === undefined ? bgSource() : source, w: S.bg.w, h: S.bg.h };
    return { grain, bg, zoom: S.zoom, panX: S.panX, panY: S.panY, dim: S.dim, anim: S.anim, textPos: S.pos, text: { h1: S.h1, h2: S.h2, line: S.line, pos: S.pos } };
  }
  function bgSource() {
    if (S.bg.kind === 'video' && S.bg.source.readyState < 2) return null;
    return S.bg.source;
  }
  function render(i, grain, source) {
    const info = engine.draw(i, drawOptions(grain, source));
    $('overflow').hidden = !(info && info.overflow);
  }
  function tick(now) {
    requestAnimationFrame(tick);
    if (busy) return;
    if (playing) {
      if (!t0) t0 = now - frame / FPS * 1000;
      frame = Math.floor((now - t0) / 1000 * FPS) % engine.FRAMES;
      if (frame < lastFrame && S.bg && S.bg.kind === 'video') S.bg.source.currentTime = 0; // same cycle as the export
    }
    if (frame !== lastFrame || dirty || (S.bg && S.bg.kind === 'video' && playing)) {
      render(frame, false);
      lastFrame = frame; dirty = false;
    }
  }
  function restart() { t0 = 0; frame = 0; lastFrame = -1; dirty = true; if (S.bg && S.bg.kind === 'video') S.bg.source.currentTime = 0; }
  function setPlaying(on) {
    playing = on; t0 = 0;
    $('play').textContent = on ? 'Пауза' : 'Играть';
    if (S.bg && S.bg.kind === 'video') { if (on) S.bg.source.play().catch(() => {}); else S.bg.source.pause(); }
  }

  // ---------- tabs and format ----------
  function buildSwitches() {
    $('tabs').innerHTML = ''; $('formats').innerHTML = '';
    for (const id in window.VARIANTS) {
      const b = document.createElement('button');
      b.type = 'button'; b.role = 'tab'; b.dataset.id = id; b.textContent = window.VARIANTS[id].title;
      b.onclick = () => { if (S.variant !== id) { S.variant = id; applyTemplate(); } };
      $('tabs').append(b);
    }
    for (const id in window.FORMATS) {
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.id = id; b.textContent = window.FORMATS[id].label;
      b.onclick = () => { if (S.format !== id) { S.format = id; applyTemplate(); } };
      $('formats').append(b);
    }
  }
  function syncSwitches() {
    for (const b of $('tabs').children) b.setAttribute('aria-selected', b.dataset.id === S.variant);
    for (const b of $('formats').children) b.setAttribute('aria-pressed', b.dataset.id === S.format);
    for (const b of $('positions').children) b.setAttribute('aria-pressed', b.dataset.pos === S.pos);
  }
  function applyTemplate() {
    engine.setup(S.variant, S.format);
    syncSwitches(); restart(); remember();
  }

  // ---------- H1 with accent marks ----------
  const h1 = $('h1');
  function readH1() { // the DOM is the source of truth while typing
    let text = ''; const marks = [];
    (function walk(n, acc) {
      for (const c of n.childNodes) {
        if (c.nodeType === 3) { text += c.nodeValue; for (let i = 0; i < c.nodeValue.length; i++) marks.push(acc); }
        else if (c.nodeName === 'BR') { text += '\n'; marks.push(false); }
        else walk(c, acc || (c.classList && c.classList.contains('accent')));
      }
    })(h1, false);
    return { text: text.replace(/ /g, ' '), marks };
  }
  function writeH1({ text, marks }) {
    h1.textContent = '';
    for (let from = 0, i = 1; i <= text.length; i++) {
      if (i < text.length && !!marks[i] === !!marks[from]) continue;
      const run = text.slice(from, i);
      if (marks[from]) { const s = document.createElement('span'); s.className = 'accent'; s.textContent = run; h1.append(s); }
      else h1.append(run);
      from = i;
    }
  }
  function selectionOffsets() {
    const sel = getSelection();
    if (!sel.rangeCount || !h1.contains(sel.anchorNode) || !h1.contains(sel.focusNode)) return null;
    const r = sel.getRangeAt(0), pre = document.createRange();
    pre.selectNodeContents(h1); pre.setEnd(r.startContainer, r.startOffset);
    const start = pre.toString().length;
    return { start, end: start + r.toString().length };
  }
  function selectOffsets(start, end) {
    const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT), r = document.createRange();
    let pos = 0, n, setStart = false;
    while ((n = walker.nextNode())) {
      const len = n.nodeValue.length;
      if (!setStart && start <= pos + len) { r.setStart(n, start - pos); setStart = true; }
      if (setStart && end <= pos + len) { r.setEnd(n, end - pos); break; }
      pos += len;
    }
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  $('accent').onmousedown = e => e.preventDefault(); // keep the selection in the field
  $('accent').onclick = () => {
    const o = selectionOffsets(), hint = $('accent-hint');
    if (!o || o.start === o.end) { hint.classList.add('err'); h1.focus(); return; }
    hint.classList.remove('err');
    const d = readH1(), all = d.marks.slice(o.start, o.end).every(Boolean);
    for (let i = o.start; i < o.end; i++) d.marks[i] = !all;
    S.h1 = d; writeH1(d); selectOffsets(o.start, o.end);
    dirty = true; remember();
  };
  h1.addEventListener('paste', e => { // plain text only, whatever was copied
    e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData.getData('text/plain') || '').replace(/\r/g, ''));
  });
  h1.addEventListener('input', () => { S.h1 = readH1(); dirty = true; remember(); });

  // ---------- simple fields ----------
  $('h2').oninput = e => { S.h2 = e.target.value; dirty = true; remember(); };
  $('line').onchange = e => { S.line = e.target.checked; dirty = true; remember(); };
  for (const b of $('positions').children) b.onclick = () => { S.pos = b.dataset.pos; syncSwitches(); dirty = true; remember(); };
  $('play').onclick = () => setPlaying(!playing);
  $('dim').oninput = e => { S.dim = e.target.value / 100; $('dim-out').textContent = e.target.value + '%'; dirty = true; remember(); };
  $('zoom').oninput = e => { S.zoom = e.target.value / 100; $('zoom-out').textContent = e.target.value + '%'; dirty = true; };
  $('anim').onchange = e => { S.anim = e.target.checked; dirty = true; remember(); };

  // ---------- background ----------
  const NOT_READABLE = 'Браузер не смог открыть это видео. Обычно так бывает с HEVC-роликами с iPhone: сконвертируй файл в MP4 (H.264) и загрузи снова.';

  function dropBg() {
    if (!S.bg) return;
    if (S.bg.kind === 'video') { S.bg.source.pause(); S.bg.source.removeAttribute('src'); S.bg.source.load(); }
    if (S.bg.input && S.bg.input.dispose) S.bg.input.dispose();
    URL.revokeObjectURL(S.bg.url);
    S.bg = null;
  }
  function bgUi() {
    const on = !!S.bg;
    $('clear').hidden = !on; $('bg-options').hidden = !on;
    $('pick').textContent = on ? 'Выбрать другой файл' : 'Выбрать картинку или видео';
    $('bg-name').textContent = on ? S.bg.name : 'Сейчас фирменный фон. Звук из видео в файл не попадает.';
    cv.classList.toggle('draggable', on);
    $('zoom').value = Math.round(S.zoom * 100); $('zoom-out').textContent = $('zoom').value + '%';
    syncSwitches();
  }
  function bgError(msg) { $('bg-error').textContent = msg; $('bg-error').hidden = !msg; }

  async function loadImage(file, url) {
    const img = new Image(); img.src = url;
    await img.decode();
    return { kind: 'image', name: file.name, url, source: img, w: img.naturalWidth, h: img.naturalHeight };
  }
  async function loadVideo(file, url) {
    const input = new M.Input({ formats: M.ALL_FORMATS, source: new M.BlobSource(file) });
    const track = await input.getPrimaryVideoTrack();
    if (!track || !(await track.canDecode())) throw new Error(NOT_READABLE);
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
    await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = () => rej(new Error(NOT_READABLE)); });
    if (!v.videoWidth) throw new Error(NOT_READABLE);
    return { kind: 'video', name: file.name, url, source: v, w: v.videoWidth, h: v.videoHeight, input, track, duration: await track.computeDuration(), first: await track.getFirstTimestamp() };
  }
  async function setBackgroundFile(file) {
    bgError('');
    const url = URL.createObjectURL(file);
    try {
      const bg = file.type.startsWith('video') || /\.(mp4|mov|webm|m4v)$/i.test(file.name) ? await loadVideo(file, url) : await loadImage(file, url);
      dropBg();
      S.bg = bg; S.zoom = 1; S.panX = 0; S.panY = 0; S.pos = 'bottom';
      bgUi(); restart(); setPlaying(playing);
    } catch (e) {
      URL.revokeObjectURL(url);
      bgError(e.message === NOT_READABLE ? NOT_READABLE : 'Не получилось открыть этот файл. Подойдут картинки JPG, PNG, WebP и видео MP4, MOV, WebM.');
    }
  }
  $('pick').onclick = () => $('file').click();
  $('file').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) setBackgroundFile(f); };
  $('clear').onclick = () => { dropBg(); S.pos = 'top'; bgError(''); bgUi(); dirty = true; };

  // drag the background on the preview
  let drag = null;
  cv.addEventListener('pointerdown', e => { if (S.bg && !busy) { drag = { x: e.clientX, y: e.clientY, panX: S.panX, panY: S.panY }; cv.setPointerCapture(e.pointerId); } });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    const k = engine.width / cv.getBoundingClientRect().width;
    const { dw, dh } = engine.coverSize(S.bg.w, S.bg.h, S.zoom), ox = (dw - engine.width) / 2, oy = (dh - engine.height) / 2;
    S.panX = ox > 0.5 ? Math.max(-1, Math.min(1, drag.panX + (e.clientX - drag.x) * k / ox)) : 0;
    S.panY = oy > 0.5 ? Math.max(-1, Math.min(1, drag.panY + (e.clientY - drag.y) * k / oy)) : 0;
    dirty = true;
  });
  const endDrag = () => { drag = null; };
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);

  // ---------- download ----------
  function saveBlob(blob, ext) {
    const a = document.createElement('a'), name = window.VARIANTS[S.variant].title.toLowerCase();
    a.href = URL.createObjectURL(blob); a.download = `vectrum-${name}-${S.format}.${ext}`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
  }
  function saveMessage(msg, isError) { $('save-hint').textContent = msg; $('save-hint').classList.toggle('err', !!isError); }

  function renderPng() {
    render(frame, true); dirty = true;
    return new Promise((res, rej) => cv.toBlob(b => b ? res(b) : rej(new Error('PNG')), 'image/png'));
  }
  $('png').onclick = async () => {
    try { saveBlob(await renderPng(), 'png'); } catch (e) { saveMessage('Не получилось сохранить PNG.', true); }
  };

  let cancelled = false;
  async function renderMp4(onProgress) {
    if (!('VideoEncoder' in window) || !(await M.canEncodeVideo('avc', { width: engine.width, height: engine.height }))) throw new Error('codec');
    const target = new M.BufferTarget();
    const output = new M.Output({ format: new M.Mp4OutputFormat({ fastStart: 'in-memory' }), target });
    // fixed bitrate: the default "high" preset smears the film grain and the faint network lines
    const source = new M.CanvasSource(cv, { codec: 'avc', quality: new M.Quality({ bitrate: engine.height > engine.width ? 16e6 : 12e6, bitrateMode: 'variable' }), keyFrameInterval: 2 });
    output.addVideoTrack(source, { frameRate: FPS });
    await output.start();

    let frames = null, still = null;
    if (S.bg && S.bg.kind === 'video') {
      // the cycle sets the length: a longer video is cut, a shorter one loops
      const times = [];
      for (let i = 0; i < engine.FRAMES; i++) times.push(S.bg.first + (i / FPS) % S.bg.duration);
      frames = new M.CanvasSink(S.bg.track, { poolSize: 1 }).canvasesAtTimestamps(times);
    }
    try {
      for (let i = 0; i < engine.FRAMES; i++) {
        if (cancelled) { await output.cancel(); return null; }
        if (frames) { const r = (await frames.next()).value; if (r) still = r.canvas; }
        render(i, true, frames ? still : undefined);
        await source.add(i / FPS, 1 / FPS);
        if (onProgress) onProgress((i + 1) / engine.FRAMES);
      }
    } finally {
      if (frames) await frames.return();
    }
    await output.finalize();
    return new Blob([target.buffer], { type: 'video/mp4' });
  }
  function setBusy(on) {
    busy = on; $('controls').disabled = on; $('progress').hidden = !on;
    h1.contentEditable = on ? 'false' : 'plaintext-only'; // a fieldset does not disable contenteditable
    for (const b of [...$('tabs').children, ...$('formats').children, $('play')]) b.disabled = on;
    if (S.bg && S.bg.kind === 'video') { if (on) S.bg.source.pause(); else if (playing) S.bg.source.play().catch(() => {}); }
    if (!on) restart();
  }
  $('mp4').onclick = async () => {
    cancelled = false; $('bar').style.width = '0'; $('progress-text').textContent = 'Собираю видео…'; setBusy(true); saveMessage('MP4: один цикл 10 секунд, без звука. PNG: кадр, который сейчас на превью.');
    try {
      const blob = await renderMp4(p => { $('bar').style.width = p * 100 + '%'; $('progress-text').textContent = `Собираю видео… ${Math.round(p * 100)}%`; });
      if (blob) { saveBlob(blob, 'mp4'); saveMessage(`Готово: ${(blob.size / 1048576).toFixed(1)} МБ. Файл в папке загрузок.`); }
    } catch (e) {
      console.error(e);
      saveMessage(e.message === 'codec' ? 'Этот браузер не умеет сохранять MP4. Открой страницу в Chrome или Edge на компьютере.' : 'Не получилось собрать видео. Попробуй ещё раз или обнови страницу.', true);
    }
    setBusy(false);
  };
  $('cancel').onclick = () => { cancelled = true; };

  // ---------- start ----------
  async function start() {
    buildSwitches();
    writeH1(S.h1); $('h2').value = S.h2; $('line').checked = S.line; $('anim').checked = S.anim;
    $('dim').value = Math.round(S.dim * 100); $('dim-out').textContent = $('dim').value + '%';
    bgUi(); applyTemplate();
    // canvas text needs the faces loaded up front; weights are in one variable file per script
    const sample = 'Aa ąę Яя ґ';
    await Promise.all([document.fonts.load('900 76px Raleway', sample), document.fonts.load('500 31px Raleway', sample)]).catch(() => {});
    dirty = true;
    if (!('VideoEncoder' in window)) saveMessage('Этот браузер не умеет сохранять MP4. PNG работает, а для видео открой страницу в Chrome или Edge на компьютере.', true);
    requestAnimationFrame(tick);
  }
  start();

  window.VectrumEditor = { state: S, renderMp4, renderPng, setBackgroundFile, setBusy, engine, seek(i) { setPlaying(false); frame = i; dirty = true; } };
})();
