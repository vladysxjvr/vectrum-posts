/* Vectrum Dev — page behaviour: language switcher, floating header, mobile menu, FAQ, form validation. */
(function(){
var I18N = window.I18N;
var HTML_LANG = {en:'en',pl:'pl',ru:'ru',ua:'uk'};
var ORDER = ['en','pl','ru','ua'];
var current = 'en';


function t(k){ return (I18N[current] && I18N[current][k]) || I18N.en[k] || ''; }

function apply(lang){
  if(!I18N[lang]) lang = 'en';
  current = lang;
  document.documentElement.lang = HTML_LANG[lang];
  document.querySelectorAll('[data-t]').forEach(function(el){ el.textContent = t(el.getAttribute('data-t')); });
  document.querySelectorAll('[data-h]').forEach(function(el){ el.innerHTML = t(el.getAttribute('data-h')); });
  document.getElementById('langCode').textContent = I18N[lang].lc;
  document.querySelectorAll('[data-lang]').forEach(function(b){ b.setAttribute('aria-current', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
  var mb = document.getElementById('moreBtn');
  if(mb) mb.querySelector('span').textContent = mb.getAttribute('aria-expanded') === 'true' ? t('less') : t('more');
  document.querySelectorAll('.err').forEach(function(e){ e.querySelector('span').textContent = t(e.getAttribute('data-k')); });
  try { localStorage.setItem('vd-lang', lang); } catch(e){}
}

/* Language links are rendered on the server, including the mobile navigation. */
/* dropdown */
var langBtn = document.getElementById('langBtn'), langMenu = document.getElementById('langMenu');
function closeLang(){ langMenu.hidden = true; langBtn.setAttribute('aria-expanded','false'); }
langBtn.addEventListener('click', function(e){
  e.stopPropagation();
  var open = langMenu.hidden;
  langMenu.hidden = !open; langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});
document.addEventListener('click', function(e){ if(!langMenu.hidden && !langMenu.contains(e.target)) closeLang(); });
document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeLang(); closeMenu(); } });

/* mobile menu */
var mmenu = document.getElementById('mmenu'), burger = document.getElementById('burger');
function openMenu(){ mmenu.hidden = false; burger.setAttribute('aria-expanded','true'); document.body.style.overflow = 'hidden'; document.getElementById('mClose').focus(); }
function closeMenu(){ if(mmenu.hidden) return; mmenu.hidden = true; burger.setAttribute('aria-expanded','false'); document.body.style.overflow = ''; }
burger.addEventListener('click', openMenu);
document.getElementById('mClose').addEventListener('click', function(){ closeMenu(); burger.focus(); });
mmenu.querySelectorAll('[data-close]').forEach(function(a){ a.addEventListener('click', closeMenu); });
window.addEventListener('resize', function(){ if(window.innerWidth > 900) closeMenu(); });

/* faq */
document.querySelectorAll('.faq button').forEach(function(btn){
  btn.addEventListener('click', function(){
    var item = btn.parentElement, wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq').forEach(function(f){ f.classList.remove('open'); f.querySelector('button').setAttribute('aria-expanded','false'); f.querySelector('.ans').hidden = true; });
    if(!wasOpen){ item.classList.add('open'); btn.setAttribute('aria-expanded','true'); item.querySelector('.ans').hidden = false; }
  });
});

/* read more (mobile) */
var moreBtn = document.getElementById('moreBtn'), agrid = document.getElementById('agrid');
if(moreBtn) moreBtn.addEventListener('click', function(){
  var exp = moreBtn.getAttribute('aria-expanded') === 'true';
  moreBtn.setAttribute('aria-expanded', exp ? 'false' : 'true');
  agrid.classList.toggle('clamped', exp);
  moreBtn.querySelector('span').textContent = exp ? t('more') : t('less');
  moreBtn.querySelector('svg').style.transform = exp ? '' : 'rotate(90deg)';
});

var phone = document.getElementById('phone');
/* Minimal source context: kept in memory, attached only when the visitor sends the form. */
function leadPublicPath(value){
  if(typeof value !== 'string' || value.length > 512) return null;
  return /^\/(?:$|(?:en|pl|ru|uk)\/?$|(?:en|pl|ru|uk)\/(?:projects\/(?:normobaria|vectrum-space)|services\/(?:website-development|ecommerce-development|mobile-app-development|web-design|seo))\/?)$/.test(value) ? value : null;
}
function leadReferrerOrigin(value, ownOrigin){
  try {
    var origin = new URL(value);
    if((origin.protocol === 'https:' || origin.protocol === 'http:') && !origin.username && !origin.password && origin.origin.length <= 255 && origin.origin !== ownOrigin)
      return origin.origin;
  } catch(e){}
  return null;
}
function leadSourceContext(pageUrl, referrer){
  var result = {};
  function campaign(value, limit){
    if(!value || value.length > limit || /[^\p{L}\p{M}\p{N} _.-]/u.test(value)) return null;
    return value.trim().replace(/ +/g, ' ') || null;
  }
  try {
    var page = new URL(pageUrl);
    var path = leadPublicPath(page.searchParams.get('vd_landing')) || leadPublicPath(page.pathname);
    if(path) result.landingPath = path;
    ['Source','Medium','Campaign','Content','Term'].forEach(function(key){
      var value = campaign(page.searchParams.get('utm_' + key.toLowerCase()), key === 'Source' || key === 'Medium' ? 80 : 120);
      if(value) result['utm' + key] = value;
    });
    var origin = leadReferrerOrigin(page.searchParams.get('vd_referrer'), page.origin) || leadReferrerOrigin(referrer, page.origin);
    if(origin) result.referrerOrigin = origin;
  } catch(e){}
  return Object.keys(result).length ? result : null;
}
function leadWithSource(target, page, referrer){
  var context = leadSourceContext(page.href, referrer);
  if(!context || !context.landingPath) return null;
  target.search = '';
  target.searchParams.set('vd_landing', context.landingPath);
  if(context.referrerOrigin) target.searchParams.set('vd_referrer', context.referrerOrigin);
  ['Source','Medium','Campaign','Content','Term'].forEach(function(key){
    if(context['utm' + key]) target.searchParams.set('utm_' + key.toLowerCase(), context['utm' + key]);
  });
  return target.pathname + target.search + target.hash;
}
function leadContactUrl(linkUrl, pageUrl, referrer){
  try {
    var page = new URL(pageUrl), target = new URL(linkUrl, page);
    if(!/^https?:$/.test(page.protocol) || target.origin !== page.origin || target.username || target.password
      || target.hash !== '#contacts' || !/^\/(?:$|(?:en|pl|ru|uk)\/)$/.test(target.pathname)
      || target.pathname === page.pathname) return linkUrl;
    return leadWithSource(target, page, referrer) || linkUrl;
  } catch(e){ return linkUrl; }
}
function leadLanguageUrl(linkUrl, pageUrl, referrer){
  try {
    var page = new URL(pageUrl), target = new URL(linkUrl, page);
    var from = leadPublicPath(page.pathname), to = leadPublicPath(target.pathname);
    if(!/^https?:$/.test(page.protocol) || target.origin !== page.origin || target.username || target.password || !from || !to) return linkUrl;
    var fromPage = from.replace(/^\/(?:en|pl|ru|uk)(?=\/|$)/, '') || '/';
    var toPage = to.replace(/^\/(?:en|pl|ru|uk)(?=\/|$)/, '') || '/';
    if(fromPage !== toPage) return linkUrl;
    // Only real homepage sections survive a language change; never copy arbitrary fragments.
    var sections = ['#top','#homeView','#services','#portfolio','#benefits','#contacts','#about','#faqs','#q1','#q2','#q3','#q4'];
    target.hash = fromPage === '/' && sections.indexOf(page.hash) !== -1 ? page.hash : '';
    return leadWithSource(target, page, referrer) || linkUrl;
  } catch(e){ return linkUrl; }
}
/* Carry safe source labels on navigation only; crawlable DOM links remain canonical until clicked. */
document.querySelectorAll('a[href]').forEach(function(link){
  var canonicalHref = link.getAttribute('href');
  function navigate(event){
    if(event.defaultPrevented || event.type === 'auxclick' && event.button !== 1) return;
    var attributed = link.hasAttribute('data-lang') ? leadLanguageUrl(canonicalHref, location.href, document.referrer)
      : leadContactUrl(canonicalHref, location.href, document.referrer);
    if(attributed !== canonicalHref){
      link.setAttribute('href', attributed);
      // Restore clean links if the user opens a new tab or another handler cancels navigation.
      setTimeout(function(){ link.setAttribute('href', canonicalHref); }, 0);
    }
  }
  link.addEventListener('click', navigate);
  link.addEventListener('auxclick', navigate);
});
/* form validation */
var form = document.getElementById('form');
if(form){
var sourceContext = leadSourceContext(location.href, document.referrer);
var errIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>';
function setErr(fieldId, key){
  var f = document.getElementById(fieldId), old = f.querySelector('.err');
  if(old) old.remove();
  var input = f.querySelector('input');
  if(!key){ f.classList.remove('invalid'); input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); return true; }
  f.classList.add('invalid');
  var p = document.createElement('p'); p.className = 'err'; p.id = fieldId + '-err'; p.setAttribute('data-k', key);
  p.innerHTML = errIcon + '<span></span>'; p.querySelector('span').textContent = t(key);
  f.appendChild(p);
  input.setAttribute('aria-invalid','true'); input.setAttribute('aria-describedby', p.id);
  return false;
}
function validate(){
  var ok = true;
  var n = document.getElementById('name').value.trim();
  var ph = phone.value.replace(/\D/g,'');
  var em = document.getElementById('email').value.trim();
  ok = setErr('f-name', n ? null : 'req') && ok;
  ok = setErr('f-phone', ph.length >= 7 && ph.length <= 15 ? null : 'req') && ok;
  ok = setErr('f-email', !em ? 'req' : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) ? null : 'badEmail')) && ok;
  return ok;
}
['name','phone','email'].forEach(function(id){
  document.getElementById(id).addEventListener('input', function(){ var f = document.getElementById('f-' + id); if(f.classList.contains('invalid')) validate(); });
});
var requestId = form.elements.requestId;
requestId.value = crypto.randomUUID();
var status = document.createElement('p'); status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
form.appendChild(status);
var messages = {
 en:['Your request has been received. We will contact you soon.','Could not send your request. Please try again or email sales@vectrumspace.eu.'],
 pl:['Zgłoszenie zostało zapisane. Wkrótce się skontaktujemy.','Nie udało się wysłać. Spróbuj ponownie lub napisz na sales@vectrumspace.eu.'],
 ru:['Заявка получена. Скоро свяжемся с вами.','Не удалось отправить. Повторите или напишите на sales@vectrumspace.eu.'],
 ua:['Заявку отримано. Незабаром зв’яжемося з вами.','Не вдалося надіслати. Спробуйте ще раз або напишіть на sales@vectrumspace.eu.']
};
form.addEventListener('submit', async function(e){
 e.preventDefault();
 var btn=document.getElementById('submitBtn'); if(btn.disabled) return;
 if(!validate()){ var first=form.querySelector('[aria-invalid="true"]'); if(first) first.focus(); return; }
 btn.disabled=true; status.textContent='';
 try {
  var response=await fetch('/api/public/dev/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
   id:requestId.value,name:form.elements.name.value.trim(),phone:phone.value.trim(),email:form.elements.email.value.trim(),
   message:form.elements.idea.value.trim(),website:form.elements.website.value,language:current,attribution:sourceContext
  })});
  if(!response.ok) throw new Error('Request failed');
  try { if(window.VectrumAds) window.VectrumAds.recordLead(requestId.value); } catch(_) {}
  form.reset(); requestId.value=crypto.randomUUID(); status.textContent=messages[current][0];
 } catch(e){status.textContent=messages[current][1];}
 finally {btn.disabled=false;}
});

}

/* portfolio: if a project image fails to load, show a branded cover instead of a broken image */
document.querySelectorAll('.pcard img').forEach(function(img){
  function fallback(){
    var c = document.createElement('div');
    c.className = 'cover cover-vl'; c.setAttribute('role','img'); c.setAttribute('aria-label', img.alt);
    var n = document.createElement('span'); n.className = 'cover-name'; n.textContent = img.alt;
    c.appendChild(n); img.replaceWith(c);
  }
  if(img.complete && img.naturalWidth === 0) fallback(); else img.addEventListener('error', fallback);
});

/* header: turns into a floating rounded bar once the page scrolls */
var hdr = document.getElementById('hdr');
function onScroll(){ hdr.classList.toggle('scrolled', window.scrollY > 24); }
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

/* Preserve old shared #project links; new project pages use crawlable URLs. */
function route(){
  var legacy = location.hash.slice(1);
  if(['normobaria','vectrum-space'].indexOf(legacy) !== -1){
    var language = document.documentElement.lang || 'en';
    location.replace('/' + language + '/projects/' + legacy + '/');
  }
  onScroll();
}
window.addEventListener('hashchange', route);

/* start */
var saved = null;
try { saved = localStorage.getItem('vd-lang'); } catch(e){}
apply(document.documentElement.lang === 'uk' ? 'ua' : document.documentElement.lang);
route();

/* intro overlap: hero darkens and recedes as Services slides over it */
var introHero = document.querySelector('.intro-stack .hero'), introSvc = document.getElementById('services'), introTick = false;
function introProgress(){
  introTick = false;
  if(!introHero || !introSvc || introHero.offsetParent === null) return;
  var vh = window.innerHeight, top = introSvc.getBoundingClientRect().top;
  var p = Math.min(1, Math.max(0, (vh - top) / vh));
  introHero.style.setProperty('--p', p.toFixed(3));
}
window.addEventListener('scroll', function(){ if(!introTick){ introTick = true; requestAnimationFrame(introProgress); } }, {passive:true});
window.addEventListener('resize', introProgress);
introProgress();
window.addEventListener('hashchange', function(){ requestAnimationFrame(introProgress); });

/* scroll reveal: elements with .reveal fade in once they enter the screen */
(function(){
  document.documentElement.classList.add('js-reveal');
  // single blocks that fade in on their own
  var SINGLE = ['#services .h2','#services .lead','#benefits .h2','#contacts .h2','#contacts .sub','#contacts .form',
    '#about .h2','#about .intro','#about .about-q','#about .more','.faqs','section:not(.hero) > .wrap > .h2.center',
    '.fbot','.proj .back','.proj-head','.proj-body','.proj-h','.proj-cta'];
  // groups whose children appear as a wave: delay = column index in the current row x 90ms
  var GROUPS = ['#services .grid3','#benefits .grid3','.pgrid','#about .agrid','.faqs','.feats','.gallery','.fgrid4'];
  SINGLE.forEach(function(sel){ document.querySelectorAll(sel).forEach(function(el){ if(!el.matches('.faqs')) el.classList.add('reveal'); }); });
  GROUPS.forEach(function(sel){ document.querySelectorAll(sel).forEach(function(g){ [].forEach.call(g.children, function(c){ c.classList.add('reveal'); }); }); });
  function stagger(){
    GROUPS.forEach(function(sel){ document.querySelectorAll(sel).forEach(function(g){
      var kids = [].slice.call(g.children), rows = {};
      kids.forEach(function(c){
        if(c.getAttribute('data-visible') === 'true' || c.offsetParent === null) return;
        var top = Math.round(c.getBoundingClientRect().top + window.scrollY);
        var col = (rows[top] = (rows[top] === undefined ? 0 : rows[top] + 1));
        c.style.setProperty('--reveal-delay', (col * 90) + 'ms');
      });
    }); });
  }
  stagger();
  var pending = [].slice.call(document.querySelectorAll('.reveal')), ticking = false;
  // reveal anything whose top has entered the lower 92% of the screen (or that we already scrolled past)
  function check(){
    ticking = false;
    var limit = window.innerHeight * 0.92;
    // at the very bottom of the page, show whatever is left (e.g. the footer line)
    if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) limit = Infinity;
    pending = pending.filter(function(el){
      if(el.offsetParent === null) return true;
      if(el.getBoundingClientRect().top < limit){ el.setAttribute('data-visible','true'); return false; }
      return true;
    });
    if(!pending.length) window.removeEventListener('scroll', onScroll);
  }
  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(check); } }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', function(){ stagger(); onScroll(); });
  window.addEventListener('hashchange', function(){ setTimeout(function(){ stagger(); check(); }, 50); });
  requestAnimationFrame(check);
  if(document.fonts) document.fonts.ready.then(function(){ stagger(); onScroll(); });
  if(moreBtn) moreBtn.addEventListener('click', function(){ stagger(); onScroll(); });
})();


})();
