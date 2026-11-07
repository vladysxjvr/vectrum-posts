/* Editor UI: tabs, text fields and formatting, background, sound, live preview, MP4 / PNG download. */
(function () {
  const $ = id => document.getElementById(id);
  const M = window.Mediabunny, FPS = window.COMMON.fps, TK = window.TOKENS;
  const cv = $('c'), engine = window.createEngine(cv);

  const BRAND_COLORS = [
    ['Белый', TK.textPrimary], ['Светло-серый', TK.textSub], ['Серый', TK.textSecondary],
    ['Синий Vectrum', TK.accentMain], ['Голубой', TK.statusBlueText], ['Индиго', TK.wwwBlue], ['Лавандовый', TK.markerTone],
  ];

  const S = {
    variant: '02-network', format: '9x16',
    h1: { text: 'Smarter Transport. Together.', styles: [] },
    h2: { text: 'Run your transport business as one', styles: [] },
    line: true, pos: 'top',
    dim: 0.55, zoom: 1, panX: 0, panY: 0, anim: true,
    bg: null, // { kind, name, source, w, h, url, file?, track?, input?, duration?, first?, hasAudio? }
    melody: null, // { name, url, el, buffer }
    muted: true,
  };
  S.h1.styles = [...S.h1.text].map((_, i) => i >= 19 ? { c: TK.accentMain } : null);

  const STORE = 'vectrum-posts-v1';
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (saved) for (const k of ['variant', 'format', 'h1', 'h2', 'line', 'pos', 'dim', 'anim']) if (k in saved) S[k] = saved[k];
    if (typeof S.h2 === 'string') S.h2 = { text: S.h2, styles: [] }; // saved by the first version
    if (S.h1.marks) S.h1 = { text: S.h1.text, styles: S.h1.marks.map(m => m ? { c: TK.accentMain } : null) };
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
  function rewindMedia() { // video and melody follow the same cycle as the export
    if (S.bg && S.bg.kind === 'video') S.bg.source.currentTime = 0;
    if (S.melody) S.melody.el.currentTime = 0;
  }
  function tick(now) {
    requestAnimationFrame(tick);
    if (busy) return;
    if (playing) {
      if (!t0) t0 = now - frame / FPS * 1000;
      frame = Math.floor((now - t0) / 1000 * FPS) % engine.FRAMES;
      if (frame < lastFrame) rewindMedia();
    }
    if (frame !== lastFrame || dirty || (S.bg && S.bg.kind === 'video' && playing)) {
      render(frame, false);
      lastFrame = frame; dirty = false;
    }
  }
  function restart() { t0 = 0; frame = 0; lastFrame = -1; dirty = true; rewindMedia(); }
  function setPlaying(on) {
    playing = on; t0 = 0;
    $('play').textContent = on ? 'Пауза' : 'Играть';
    if (S.bg && S.bg.kind === 'video') { if (on) S.bg.source.play().catch(() => {}); else S.bg.source.pause(); }
    syncSound();
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

  // ---------- text fields with per-character styles ----------
  const FIELDS = window.TextLayer.FIELDS, fieldKeys = ['h1', 'h2'];
  let active = 'h1';
  const lastSel = { h1: null, h2: null }; // survives the focus moving to the colour picker

  function readField(el) { // the DOM is the source of truth while typing
    let text = ''; const styles = [];
    (function walk(n, st) {
      for (const c of n.childNodes) {
        if (c.nodeType === 3) { text += c.nodeValue; for (let i = 0; i < c.nodeValue.length; i++) styles.push(st); }
        else if (c.nodeName === 'BR') { text += '\n'; styles.push(null); }
        else walk(c, c.dataset && c.dataset.s ? JSON.parse(c.dataset.s) : st);
      }
    })(el, null);
    return { text: text.replace(/ /g, ' '), styles };
  }
  function writeField(el, { text, styles }) {
    el.textContent = '';
    for (let from = 0, i = 1; i <= text.length; i++) {
      const a = JSON.stringify(styles[from] || null);
      if (i < text.length && JSON.stringify(styles[i] || null) === a) continue;
      const run = text.slice(from, i), st = styles[from];
      if (st) {
        const s = document.createElement('span'); s.dataset.s = a; s.textContent = run;
        if (st.c) s.style.color = st.c;
        if (st.b !== undefined) s.style.fontWeight = st.b ? 800 : 400;
        if (st.i) s.style.fontStyle = 'italic';
        if (st.u) s.style.textTransform = 'uppercase';
        el.append(s);
      } else el.append(run);
      from = i;
    }
  }
  function selectionOffsets(el) {
    const sel = getSelection();
    if (!sel.rangeCount || !el.contains(sel.anchorNode) || !el.contains(sel.focusNode)) return null;
    const r = sel.getRangeAt(0), pre = document.createRange();
    pre.selectNodeContents(el); pre.setEnd(r.startContainer, r.startOffset);
    const start = pre.toString().length;
    return { start, end: start + r.toString().length };
  }
  function selectOffsets(el, start, end) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), r = document.createRange();
    let pos = 0, n, begun = false;
    while ((n = walker.nextNode())) {
      const len = n.nodeValue.length;
      if (!begun && start <= pos + len) { r.setStart(n, start - pos); begun = true; }
      if (begun && end <= pos + len) { r.setEnd(n, end - pos); break; }
      pos += len;
    }
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  // the selected characters, or the whole field when nothing is selected
  function targetRange(d) {
    const live = document.activeElement === $(active) && selectionOffsets($(active));
    if (live) lastSel[active] = live; // selectionchange is asynchronous and may not have fired yet
    const o = lastSel[active];
    return o && o.start < o.end && o.end <= d.text.length ? o : { start: 0, end: d.text.length };
  }
  function applyStyle(change, keepFocus = true) {
    const el = $(active), d = readField(el), { start, end } = targetRange(d);
    for (let i = start; i < end; i++) {
      const st = { ...(d.styles[i] || {}) }; change(st, i);
      d.styles[i] = Object.keys(st).length ? st : null;
    }
    S[active] = d; writeField(el, d);
    const o = lastSel[active];
    if (keepFocus && o && o.start < o.end && o.end <= d.text.length) selectOffsets(el, o.start, o.end);
    dirty = true; remember(); syncToolbar();
  }
  const isBold = (st, def) => st && st.b !== undefined ? st.b : def;
  function toggle(flag) { // on for all if any is off, otherwise off for all
    const d = readField($(active)), { start, end } = targetRange(d), def = FIELDS[active].bold;
    const value = st => flag === 'b' ? isBold(st, def) : !!(st && st[flag]);
    const allOn = end > start && d.styles.slice(start, end).every(value);
    applyStyle(st => {
      if (flag !== 'b') { if (allOn) delete st[flag]; else st[flag] = true; return; }
      if (!allOn === def) delete st.b; else st.b = !allOn;
    });
  }
  function syncToolbar() {
    const d = S[active], { start, end } = targetRange(d), part = d.styles.slice(start, end), def = FIELDS[active].bold;
    const on = (b, v) => $(b).setAttribute('aria-pressed', end > start && [...Array(end - start).keys()].every(n => v(part[n])));
    on('fmt-bold', st => isBold(st, def));
    on('fmt-italic', st => !!(st && st.i));
    on('fmt-upper', st => !!(st && st.u));
  }
  function buildBrandColors() {
    for (const [name, color] of BRAND_COLORS) {
      const b = document.createElement('button'), dot = document.createElement('i');
      b.type = 'button'; b.className = 'swatch'; dot.style.background = color;
      b.append(dot, name);
      b.onmousedown = e => e.preventDefault(); // keep the selection in the field
      b.onclick = () => { applyStyle(st => { st.c = color; }); showBrand(false); };
      $('brand-pop').append(b);
    }
  }
  function showBrand(on) { $('brand-pop').hidden = !on; $('brand-btn').setAttribute('aria-expanded', on); }

  for (const k of fieldKeys) {
    const el = $(k);
    el.addEventListener('focus', () => { active = k; syncToolbar(); });
    el.addEventListener('input', () => { S[k] = readField(el); dirty = true; remember(); syncToolbar(); });
    el.addEventListener('paste', e => { // plain text only, whatever was copied
      e.preventDefault();
      document.execCommand('insertText', false, (e.clipboardData.getData('text/plain') || '').replace(/\r/g, ''));
    });
  }
  document.addEventListener('selectionchange', () => {
    const el = $(active), o = selectionOffsets(el);
    if (o && document.activeElement === el) { lastSel[active] = o; syncToolbar(); }
  });
  document.addEventListener('pointerdown', e => { // a click outside drops the remembered selection and the colour list
    if (!e.target.closest('#toolbar') && !e.target.closest('.editable')) { lastSel[active] = null; syncToolbar(); }
    if (!e.target.closest('.pop-wrap')) showBrand(false);
  });
  for (const b of $('toolbar').querySelectorAll('button')) b.onmousedown = e => e.preventDefault();
  $('fmt-bold').onclick = () => toggle('b');
  $('fmt-italic').onclick = () => toggle('i');
  $('fmt-upper').onclick = () => toggle('u');
  $('fmt-clear').onclick = () => applyStyle(st => { for (const k in st) delete st[k]; });
  $('brand-btn').onclick = () => showBrand($('brand-pop').hidden);
  $('custom-color').oninput = e => applyStyle(st => { st.c = e.target.value; }, false); // no refocus: it would close the picker
  $('custom-color').onchange = e => applyStyle(st => { st.c = e.target.value; });

  // ---------- simple fields ----------
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
    $('bg-name').textContent = on ? S.bg.name : 'Сейчас фирменный фон.';
    cv.classList.toggle('draggable', on);
    $('zoom').value = Math.round(S.zoom * 100); $('zoom-out').textContent = $('zoom').value + '%';
    syncSwitches(); soundUi();
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
    const audio = await input.getPrimaryAudioTrack();
    return { kind: 'video', name: file.name, url, file, source: v, w: v.videoWidth, h: v.videoHeight, input, track, hasAudio: !!audio, duration: await track.computeDuration(), first: await track.getFirstTimestamp() };
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
  $('clear').onclick = () => { dropBg(); S.pos = 'top'; bgError(''); bgUi(); syncSound(); dirty = true; };

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

  // ---------- sound: a melody wins over the video's own track ----------
  const RATE = 48000;
  const soundSource = () => S.melody ? 'melody' : S.bg && S.bg.hasAudio ? 'video' : null;
  const soundOn = () => !S.muted && !!soundSource();

  function syncSound() {
    const src = soundSource(), audible = !S.muted && !busy;
    if (S.bg && S.bg.kind === 'video') S.bg.source.muted = !(audible && src === 'video');
    if (S.melody) { if (audible && playing) S.melody.el.play().catch(() => {}); else S.melody.el.pause(); }
  }
  function soundUi() {
    const src = soundSource(), b = $('mute');
    b.disabled = !src;
    b.textContent = soundOn() ? 'Со звуком' : 'Без звука';
    b.setAttribute('aria-pressed', !soundOn());
    $('audio-clear').hidden = !S.melody;
    $('audio-pick').textContent = S.melody ? 'Выбрать другую мелодию' : 'Выбрать мелодию';
    $('audio-name').textContent = src === 'melody' ? S.melody.name + (S.bg && S.bg.hasAudio ? '. Звук из видео не используется.' : '')
      : src === 'video' ? 'Можно оставить звук из видео или загрузить мелодию.'
      : 'Звука пока нет. Загрузи мелодию или видео со звуком.';
    saveMessage();
    syncSound();
  }
  function audioError(msg) { $('audio-error').textContent = msg; $('audio-error').hidden = !msg; }
  async function decodeAudio(file) {
    return new OfflineAudioContext(2, 1, RATE).decodeAudioData(await file.arrayBuffer());
  }
  function dropMelody() {
    if (!S.melody) return;
    S.melody.el.pause(); URL.revokeObjectURL(S.melody.url);
    S.melody = null;
  }
  async function setMelodyFile(file) {
    audioError('');
    try {
      const buffer = await decodeAudio(file), url = URL.createObjectURL(file);
      const el = new Audio(url); el.loop = true;
      dropMelody();
      S.melody = { name: file.name, url, el, buffer }; S.muted = false;
      soundUi(); rewindMedia();
    } catch (e) {
      audioError('Не получилось открыть этот файл. Подойдут MP3, M4A, AAC, WAV, OGG, FLAC.');
    }
  }
  $('audio-pick').onclick = () => $('audio-file').click();
  $('audio-file').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) setMelodyFile(f); };
  $('audio-clear').onclick = () => { dropMelody(); S.muted = true; audioError(''); soundUi(); };
  $('mute').onclick = () => { S.muted = !S.muted; soundUi(); };

  // the sound of one cycle: looped when shorter, cut when longer, with soft edges so the loop does not click
  async function buildSoundtrack(seconds) {
    const melody = soundSource() === 'melody', buffer = melody ? S.melody.buffer : await decodeAudio(S.bg.file);
    const off = new OfflineAudioContext(2, RATE * seconds, RATE);
    const src = off.createBufferSource(), gain = off.createGain();
    src.buffer = buffer; src.loop = true;
    if (!melody && S.bg.duration < buffer.duration) src.loopEnd = S.bg.duration; // keep step with the looping video
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(1, 0.03);
    gain.gain.setValueAtTime(1, seconds - 0.25);
    gain.gain.linearRampToValueAtTime(0, seconds);
    src.connect(gain); gain.connect(off.destination); src.start(0);
    return off.startRendering();
  }

  // ---------- download ----------
  function saveBlob(blob, ext) {
    const a = document.createElement('a'), name = window.VARIANTS[S.variant].title.toLowerCase();
    a.href = URL.createObjectURL(blob); a.download = `vectrum-${name}-${S.format}.${ext}`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
  }
  function saveMessage(msg, isError) {
    $('save-hint').textContent = msg || `MP4: один цикл 10 секунд, ${soundOn() ? 'со звуком' : 'без звука'}. PNG: кадр, который сейчас на превью.`;
    $('save-hint').classList.toggle('err', !!isError);
  }

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
    const withSound = soundOn(), quality = new M.Quality({ bitrate: 192e3 });
    if (withSound && !(await M.canEncodeAudio('aac', { numberOfChannels: 2, sampleRate: RATE, quality }))) throw new Error('audio-codec');
    const soundtrack = withSound ? await buildSoundtrack(engine.FRAMES / FPS) : null;

    const target = new M.BufferTarget();
    const output = new M.Output({ format: new M.Mp4OutputFormat({ fastStart: 'in-memory' }), target });
    // fixed bitrate: the default "high" preset smears the film grain and the faint network lines
    const source = new M.CanvasSource(cv, { codec: 'avc', quality: new M.Quality({ bitrate: engine.height > engine.width ? 16e6 : 12e6, bitrateMode: 'variable' }), keyFrameInterval: 2 });
    output.addVideoTrack(source, { frameRate: FPS });
    const audioSource = withSound ? new M.AudioBufferSource({ codec: 'aac', quality }) : null;
    if (audioSource) output.addAudioTrack(audioSource);
    await output.start();
    // not awaited before the frames: the muxer interleaves both tracks and needs video to move on
    const audioDone = audioSource ? audioSource.add(soundtrack).then(() => audioSource.close()) : null;

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
    if (audioDone) await audioDone;
    await output.finalize();
    return new Blob([target.buffer], { type: 'video/mp4' });
  }
  function setBusy(on) {
    busy = on; $('controls').disabled = on; $('progress').hidden = !on;
    for (const k of fieldKeys) $(k).contentEditable = on ? 'false' : 'plaintext-only'; // a fieldset does not disable contenteditable
    for (const b of [...$('tabs').children, ...$('formats').children, $('play')]) b.disabled = on;
    if (S.bg && S.bg.kind === 'video') { if (on) S.bg.source.pause(); else if (playing) S.bg.source.play().catch(() => {}); }
    syncSound();
    if (!on) restart();
  }
  const FAIL_MESSAGE = {
    codec: 'Этот браузер не умеет сохранять MP4. Открой страницу в Chrome или Edge на компьютере.',
    'audio-codec': 'Этот браузер не умеет сохранять звук в MP4. Открой страницу в Chrome или Edge на компьютере или скачай видео без звука.',
  };
  $('mp4').onclick = async () => {
    cancelled = false; $('bar').style.width = '0'; $('progress-text').textContent = 'Собираю видео…'; setBusy(true); saveMessage();
    try {
      const blob = await renderMp4(p => { $('bar').style.width = p * 100 + '%'; $('progress-text').textContent = `Собираю видео… ${Math.round(p * 100)}%`; });
      if (blob) { saveBlob(blob, 'mp4'); saveMessage(`Готово: ${(blob.size / 1048576).toFixed(1)} МБ. Файл в папке загрузок.`); }
    } catch (e) {
      console.error(e);
      saveMessage(FAIL_MESSAGE[e.message] || 'Не получилось собрать видео. Попробуй ещё раз или обнови страницу.', true);
    }
    setBusy(false);
  };
  $('cancel').onclick = () => { cancelled = true; };

  // ---------- start ----------
  async function start() {
    buildSwitches(); buildBrandColors();
    writeField($('h1'), S.h1); writeField($('h2'), S.h2); $('line').checked = S.line; $('anim').checked = S.anim;
    $('dim').value = Math.round(S.dim * 100); $('dim-out').textContent = $('dim').value + '%';
    syncToolbar(); bgUi(); applyTemplate();
    // canvas text needs the faces loaded up front; weights are in one variable file per script
    const sample = 'Aa ąę Яя ґ';
    await Promise.all(['', 'italic '].map(s => document.fonts.load(s + '900 76px Raleway', sample))).catch(() => {});
    dirty = true;
    if (!('VideoEncoder' in window)) saveMessage('Этот браузер не умеет сохранять MP4. PNG работает, а для видео открой страницу в Chrome или Edge на компьютере.', true);
    requestAnimationFrame(tick);
  }
  start();

  window.VectrumEditor = { state: S, renderMp4, renderPng, setBackgroundFile, setMelodyFile, setBusy, engine, seek(i) { setPlaying(false); frame = i; dirty = true; } };
})();
