/* FinCoach — interactions */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Sticky header shadow + back-to-top ---------- */
  const header = $('#siteHeader');
  const toTop = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Loans mega menu (hover on desktop, click to toggle) ---------- */
  const loansLi = $('#loansMenu');
  const loansBtn = $('#loansBtn');
  const mega = $('#megaLoans');
  let closeTimer;
  const setMega = (open) => {
    loansLi.classList.toggle('open', open);
    mega.classList.toggle('open', open);
    loansBtn.setAttribute('aria-expanded', open);
  };
  const openMega = () => { clearTimeout(closeTimer); setMega(true); };
  const closeMegaSoon = () => { closeTimer = setTimeout(() => setMega(false), 160); };
  [loansLi, mega].forEach(el => {
    el.addEventListener('mouseenter', openMega);
    el.addEventListener('mouseleave', closeMegaSoon);
  });
  const canHover = window.matchMedia('(hover: hover)').matches;
  loansBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearTimeout(closeTimer);
    setMega(canHover ? true : !mega.classList.contains('open'));
  });
  document.addEventListener('click', (e) => { if (!mega.contains(e.target)) setMega(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMega(false); });
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => { if (Math.abs(window.scrollY - lastY) > 60) { setMega(false); lastY = window.scrollY; } }, { passive: true });
  mega.addEventListener('mouseenter', () => { lastY = window.scrollY; });
  $$('a', mega).forEach(a => a.addEventListener('click', () => setMega(false)));

  /* ---------- Mobile drawer ---------- */
  const drawer = $('#drawer'), backdrop = $('#drawerBackdrop');
  const setDrawer = (open) => {
    drawer.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    document.body.classList.toggle('nav-hidden', open);
  };
  $('#menuOpen').addEventListener('click', () => setDrawer(true));
  $('#menuClose').addEventListener('click', () => setDrawer(false));
  backdrop.addEventListener('click', () => setDrawer(false));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setDrawer(false)));
  { const file = location.pathname.split('/').pop() || 'index.html', here = file + location.search;
    $$('a[href]', drawer).forEach((l) => { const h = l.getAttribute('href'); if (h === here || (!h.includes('?') && h === file)) l.classList.add('is-current'); }); }

  /* ---------- Mobile bottom nav: highlight current page ---------- */
  const mNav = $('.mobile-nav');
  if (mNav) {
    const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
    const setActive = () => {
      const key = page === 'index' && location.hash === '#products' ? 'loans' : page;
      $$('a', mNav).forEach(a => a.classList.toggle('active', a.dataset.nav === key));
    };
    setActive();
    window.addEventListener('hashchange', setActive);
    // On the homepage, "Loans" scrolls in-page instead of reloading
    if (page === 'index') $$('a[data-nav="loans"]', mNav).forEach(a => a.setAttribute('href', '#products'));
  }

  /* ---------- Accordions (drawer + FAQ) ---------- */
  $$('.acc-head').forEach(btn => btn.addEventListener('click', () => {
    const acc = btn.closest('.acc');
    const group = acc.parentElement.id === 'faqList' ? $$('.acc', acc.parentElement) : [];
    const willOpen = !acc.classList.contains('open');
    group.forEach(a => a.classList.remove('open'));
    acc.classList.toggle('open', willOpen);
  }));

  /* ---------- Partner marquee: duplicate for seamless loop ---------- */
  const track = $('#marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Scroll animations: AOS (falls back to IntersectionObserver) ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.AOS) {
    const CARD = '.feature, .c-card, .value, .offer, .blog-card, .t-card, .price-card, .faq, .partner';
    $$('.reveal').forEach((el) => {
      el.classList.remove('reveal');
      if (el.hasAttribute('data-aos')) return;
      let effect = 'fade-up';
      if (el.matches(CARD)) effect = 'zoom-in-up';
      else if (el.matches('.eyebrow, .crumb')) effect = 'fade-down';
      else if (el.matches('.vm-card, .auth-shell, .search-card, .map-wrap') || el.classList.contains('panel')) effect = 'fade-up';
      el.setAttribute('data-aos', effect);
      // Stagger siblings that animate together (cards in a grid, list items…)
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal') || c.hasAttribute('data-aos'));
      const idx = sibs.indexOf(el);
      if (idx > 0) el.setAttribute('data-aos-delay', String(Math.min(idx, 5) * 80));
    });
    AOS.init({ duration: 850, easing: 'ease-out-cubic', once: true, offset: 40, disable: reduceMotion });
    window.addEventListener('load', () => AOS.refresh());
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
  }

  /* ---------- Counters ---------- */
  // Counts up every time the number scrolls into view (resets when it leaves)
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      const el = en.target;
      if (!en.isIntersecting) { el.dataset.run = ''; el.textContent = '0'; return; }
      if (el.dataset.run) return;
      el.dataset.run = '1';
      const end = +el.dataset.count, dur = 2200, t0 = performance.now();
      const tick = (t) => {
        if (!el.dataset.run) return;
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- Testimonials slider ---------- */
  const tTrack = $('#tTrack'), dotsWrap = $('#tDots');
  if (tTrack) {
  const slides = $$('.t-slide', tTrack);
  let tIndex = 0;
  const perView = () => (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1);
  const maxIndex = () => Math.max(0, slides.length - perView());
  const renderDots = () => {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const d = document.createElement('button');
      d.className = 't-dot' + (i === tIndex ? ' active' : '');
      d.setAttribute('aria-label', `Slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  };
  const goTo = (i) => {
    tIndex = (i + maxIndex() + 1) % (maxIndex() + 1);
    tTrack.style.transform = `translateX(-${tIndex * (100 / perView())}%)`;
    renderDots();
  };
  $('#tPrev').addEventListener('click', () => goTo(tIndex - 1));
  $('#tNext').addEventListener('click', () => goTo(tIndex + 1));
  window.addEventListener('resize', () => goTo(Math.min(tIndex, maxIndex())));
  let auto = setInterval(() => goTo(tIndex + 1), 5000);
  tTrack.addEventListener('mouseenter', () => clearInterval(auto));
  tTrack.addEventListener('mouseleave', () => { auto = setInterval(() => goTo(tIndex + 1), 5000); });
  goTo(0);
  }

  /* ---------- Loan plan tabs ---------- */
  const plans = {
    personal: [
      { t: 'Personal Loan', r: '9.0%', l: ['Up to ৳20 Lakh', 'Tenure 12–60 months', 'No security required', 'Approval in 3–7 days'] },
      { t: 'Home Loan', r: '8.5%', l: ['Up to ৳2 Crore', 'Tenure up to 25 years', 'Buy, build or renovate', 'Dedicated relationship manager'] },
      { t: 'Car &amp; Bike Loan', r: '9.5%', l: ['Up to 70% financing', 'New &amp; reconditioned', 'Tenure 12–72 months', 'Quick documentation'] }
    ],
    business: [
      { t: 'SME Working Capital', r: '10.5%', l: ['Up to ৳50 Lakh', 'Revolving limit', 'Collateral-free options', 'Women entrepreneur offers'] },
      { t: 'SME Term Loan', r: '9.75%', l: ['Up to ৳3 Crore', 'Tenure up to 7 years', 'Machinery &amp; expansion', 'Dedicated SME advisor'] },
      { t: 'Business Credit Card', r: '0%', l: ['Up to 50 days interest-free', 'Expense tracking', 'Annual fee waiver', 'Airport lounge access'] }
    ]
  };
  $$('#planTabs .tab-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('#planTabs .tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    plans[btn.dataset.plan].forEach((p, i) => {
      const n = i + 1;
      $(`[data-p="t${n}"]`).innerHTML = p.t;
      const r = $(`[data-p="r${n}"]`);
      r.firstChild.textContent = p.r;
      $(`[data-p="l${n}"]`).innerHTML = p.l.map(x => `<li class="flex gap-3"><i class="fa-solid fa-circle-check text-brand mt-0.5"></i>${x}</li>`).join('');
    });
  }));

  /* ---------- EMI calculator (Groww style, tenure in months) ---------- */
  const fmt = (n) => Math.round(n).toLocaleString('en-IN');
  const amt = $('#amt'), rate = $('#rate'), ten = $('#ten');
  if (amt) {
    const amtIn = $('#amtIn'), rateIn = $('#rateIn'), tenIn = $('#tenIn'), arc = $('#emiArc');
    const fill = (el) => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min)) * 100 + '%');
    const clamp = (v, el) => Math.min(Math.max(v, +el.min), +el.max);
    const calc = (from) => {
      const P = +amt.value, r = +rate.value / 12 / 100, n = +ten.value;
      const emi = r ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
      const total = emi * n, interest = total - P;
      if (from !== amtIn) amtIn.value = fmt(P);
      if (from !== rateIn) rateIn.value = (+rate.value).toFixed(1);
      if (from !== tenIn) tenIn.value = n;
      $('#emi').textContent = emi.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      $('#pVal').textContent = fmt(P); $('#iVal').textContent = fmt(interest); $('#tVal').textContent = fmt(total);
      const tt = $('#tenTxt'); if (tt) tt.textContent = n;
      const share = total ? interest / total : 0;
      if (arc) arc.setAttribute('stroke-dasharray', (share * 100).toFixed(1) + ' 100');
      $('#emiPct').textContent = Math.round(share * 100) + '%';
      [amt, rate, ten].forEach(fill);
    };
    [amt, rate, ten].forEach(el => el.addEventListener('input', () => calc()));
    const bind = (box, range, parse) => {
      box.addEventListener('input', () => {
        const v = parse(box.value);
        if (!isNaN(v) && v > 0) { range.value = clamp(v, range); calc(box); }
        if (box === amtIn) { const d = box.value.replace(/\D/g, ''); box.value = d ? fmt(+d) : ''; }
      });
      box.addEventListener('blur', () => calc());
    };
    bind(amtIn, amt, (s) => +s.replace(/\D/g, ''));
    bind(rateIn, rate, (s) => parseFloat(s));
    bind(tenIn, ten, (s) => parseInt(s, 10));
    calc();
    // Loan-type chips set a typical rate
    $$('[data-emi-rate]').forEach(b => b.addEventListener('click', () => {
      $$('[data-emi-rate]').forEach(x => x.classList.toggle('active', x === b));
      rate.value = b.dataset.emiRate;
      rate.dispatchEvent(new Event('input', { bubbles: true }));
    }));
  }

  /* ---------- Hero slider (text + image) ---------- */
  const hsTexts = $('#hsTexts');
  if (hsTexts) {
    const texts = $$('.hs-text', hsTexts), frames = $$('.hs-frame', $('#hsMedia')), navWrap = $('#hsNav'), dots = $$('button', navWrap);
    const DUR = 6000; let idx = 0, timer, paused = false;
    navWrap.style.setProperty('--hs-dur', DUR + 'ms');
    const show = (i) => {
      idx = (i + texts.length) % texts.length;
      [texts, frames, dots].forEach(list => list.forEach((el, k) => el.classList.toggle('is-active', k === idx)));
      texts.forEach((el, k) => el.setAttribute('aria-hidden', k === idx ? 'false' : 'true'));
      dots.forEach(d => { const s = d.firstElementChild; s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; });
    };
    const start = () => { clearInterval(timer); timer = setInterval(() => { if (!paused && !document.hidden) show(idx + 1); }, DUR); };
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));
    const hero = $('#hero');
    hero.addEventListener('mouseenter', () => { paused = true; navWrap.classList.add('paused'); });
    hero.addEventListener('mouseleave', () => { paused = false; navWrap.classList.remove('paused'); });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) start();
  }

  /* ---------- Testimonial (Wallex style) ---------- */
  const twTexts = $('#twTexts');
  if (twTexts) {
    const items = $$('.tw-item', twTexts), photos = $$('#twPhotos img'); let t = 0;
    const showT = (i) => {
      t = (i + items.length) % items.length;
      items.forEach((el, k) => { el.classList.toggle('is-active', k === t); el.setAttribute('aria-hidden', k === t ? 'false' : 'true'); });
      photos.forEach((el, k) => el.classList.toggle('is-active', k === t));
      $$('#twNames > *').forEach((el, k) => el.classList.toggle('is-active', k === t));
    };
    $('#twPrev').addEventListener('click', () => showT(t - 1));
    $('#twNext').addEventListener('click', () => showT(t + 1));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { if (!document.hidden) showT(t + 1); }, 7000);
  }

  /* ---------- Blog slider (Prev / Next) ---------- */
  const blTrack = $('#blTrack');
  if (blTrack) {
    const stepB = () => { const c = $('.bl3-card', blTrack); return c ? c.offsetWidth + 20 : 340; };
    $('#blPrev').addEventListener('click', () => blTrack.scrollBy({ left: -stepB(), behavior: 'smooth' }));
    $('#blNext').addEventListener('click', () => {
      if (blTrack.scrollLeft + blTrack.clientWidth >= blTrack.scrollWidth - 4) blTrack.scrollTo({ left: 0, behavior: 'smooth' });
      else blTrack.scrollBy({ left: stepB(), behavior: 'smooth' });
    });
  }

  /* ---------- App QR code ---------- */
  const qrEl = $('#appQr');
  if (qrEl && window.QRCode) new QRCode(qrEl, { text: 'https://fincoach.com.bd/', width: 240, height: 240, colorDark: '#0b1530', colorLight: '#ffffff' });

  /* ---------- Product card slider ---------- */
  const scTrack = $('#scTrack');
  if (scTrack) {
    const bar = $('#scBar');
    const step = () => { const c = $('.ol-card, .sc-card', scTrack); return c ? c.offsetWidth + 20 : 320; };
    const atEnd = () => scTrack.scrollLeft + scTrack.clientWidth >= scTrack.scrollWidth - 4;
    const go = (dir) => {
      if (dir > 0 && atEnd()) scTrack.scrollTo({ left: 0, behavior: 'smooth' });
      else scTrack.scrollBy({ left: dir * step(), behavior: 'smooth' });
    };
    $('#scPrev').addEventListener('click', () => go(-1));
    $('#scNext').addEventListener('click', () => go(1));
    const updateBar = () => {
      if (!bar) return;
      const max = scTrack.scrollWidth - scTrack.clientWidth;
      const vis = scTrack.clientWidth / scTrack.scrollWidth;
      bar.style.width = Math.max(vis * 100, 12) + '%';
      bar.style.transform = `translateX(${max > 0 ? (scTrack.scrollLeft / max) * ((1 / Math.max(vis, .12)) - 1) * 100 : 0}%)`;
    };
    scTrack.addEventListener('scroll', updateBar, { passive: true });
    window.addEventListener('resize', updateBar);
    updateBar();
    // Gentle autoplay, paused on hover / touch / focus
    let paused = false;
    ['mouseenter', 'touchstart', 'focusin'].forEach(ev => scTrack.addEventListener(ev, () => { paused = true; }, { passive: true }));
    ['mouseleave', 'focusout'].forEach(ev => scTrack.addEventListener(ev, () => { paused = false; }));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { if (!paused && !document.hidden) go(1); }, 4500);
  }

  /* ---------- Steps visual ---------- */
  const visuals = [
    `<p class="text-sm font-bold text-muted">Step 1 of 4</p>
     <h4 class="font-head font-extrabold text-2xl mt-1">What do you need?</h4>
     <div class="grid grid-cols-2 gap-3 mt-5">
       ${[['fa-user', 'Personal', 1], ['fa-car', 'Car & Bike', 0], ['fa-house', 'Home', 0], ['fa-credit-card', 'Credit Card', 0]].map(([i, t, a]) =>
        `<div class="rounded-2xl border ${a ? 'border-brand bg-brand-tint' : 'border-line'} p-4"><i class="fa-solid ${i} text-brand text-lg"></i><p class="font-bold mt-2">${t}</p></div>`).join('')}
     </div>
     <button class="btn btn-primary w-full mt-6">Continue <i class="fa-solid fa-arrow-right"></i></button>`,
    `<p class="text-sm font-bold text-muted">Step 2 of 4</p>
     <h4 class="font-head font-extrabold text-2xl mt-1">Create your free account</h4>
     <div class="space-y-3 mt-5">
       <div class="rounded-xl border border-line bg-[#f7f8fa] px-4 py-3 text-muted"><i class="fa-regular fa-user mr-2"></i>Full name</div>
       <div class="rounded-xl border border-line bg-[#f7f8fa] px-4 py-3 text-muted"><i class="fa-solid fa-mobile-screen mr-2"></i>+880 1XXX-XXXXXX</div>
       <div class="rounded-xl border border-brand bg-white px-4 py-3 text-ink font-semibold"><i class="fa-solid fa-key mr-2 text-brand"></i>OTP: • • • • • •</div>
     </div>
     <button class="btn btn-primary w-full mt-6">Sign up — it's free</button>`,
    `<p class="text-sm font-bold text-muted">Step 3 of 4</p>
     <h4 class="font-head font-extrabold text-2xl mt-1">Upload documents</h4>
     <div class="space-y-3 mt-5">
       ${[['NID (front & back)', 1], ['Salary certificate', 1], ['Bank statement (6 mo)', 0]].map(([t, d]) =>
        `<div class="flex items-center justify-between rounded-xl border border-line px-4 py-3"><span class="font-semibold"><i class="fa-regular fa-file-lines text-brand mr-2"></i>${t}</span>${d ? '<i class="fa-solid fa-circle-check text-green-500"></i>' : '<span class="text-xs font-bold text-brand">Upload</span>'}</div>`).join('')}
     </div>
     <div class="mt-5 h-2 rounded-full bg-brand-tint"><div class="h-full w-2/3 rounded-full bg-grad"></div></div>
     <p class="text-sm text-muted mt-2">67% complete</p>`,
    `<div class="text-center">
       <div class="mx-auto w-20 h-20 rounded-full bg-grad text-white grid place-items-center text-3xl shadow-lg"><i class="fa-solid fa-check"></i></div>
       <h4 class="font-head font-extrabold text-2xl mt-5">Congratulations!</h4>
       <p class="text-muted mt-1">Your loan has been approved</p>
       <p class="font-head font-extrabold text-4xl mt-4 text-grad">৳ 6,50,000</p>
       <div class="grid grid-cols-2 gap-3 mt-5 text-left">
         <div class="rounded-xl bg-[#f7f8fa] p-3"><p class="text-xs text-muted">Rate</p><p class="font-bold">9.0% p.a.</p></div>
         <div class="rounded-xl bg-[#f7f8fa] p-3"><p class="text-xs text-muted">Tenure</p><p class="font-bold">36 months</p></div>
       </div>
     </div>`
  ];
  const stepEls = $$('#steps .step'), stepVisual = $('#stepVisual');
  if (stepVisual) {
  let sIdx = 0, sTimer;
  const showStep = (i) => {
    sIdx = i;
    stepEls.forEach((s, k) => s.classList.toggle('active', k === i));
    stepVisual.style.opacity = 0; stepVisual.style.transform = 'translateY(10px)';
    setTimeout(() => {
      stepVisual.innerHTML = visuals[i];
      stepVisual.style.opacity = 1; stepVisual.style.transform = 'none';
    }, 180);
  };
  stepVisual.style.transition = 'opacity .3s ease, transform .3s ease';
  const autoSteps = () => { clearInterval(sTimer); sTimer = setInterval(() => showStep((sIdx + 1) % 4), 4000); };
  stepEls.forEach((s, i) => s.addEventListener('click', () => { showStep(i); autoSteps(); }));
  showStep(0); autoSteps();
  }

  /* ---------- Video modal (About page) ---------- */
  const vModal = $('#videoModal');
  if (vModal) {
    const frame = $('iframe', vModal);
    const setVideo = (open) => {
      vModal.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      frame.src = open ? frame.dataset.src : '';
    };
    $$('[data-video]').forEach(b => b.addEventListener('click', () => setVideo(true)));
    $$('[data-video-close]', vModal).forEach(b => b.addEventListener('click', () => setVideo(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && vModal.classList.contains('open')) setVideo(false); });
  }

  /* ---------- Topic chips (Contact page) ---------- */
  $$('.chip-group').forEach(group => {
    const hidden = $('input[type=hidden]', group.closest('form'));
    $$('.chip', group).forEach(chip => chip.addEventListener('click', () => {
      $$('.chip', group).forEach(c => c.classList.toggle('active', c === chip));
      if (hidden) hidden.value = chip.dataset.value;
    }));
  });

  /* ---------- Front-end-only forms: show success state ---------- */
  $$('form[data-demo]').forEach(form => form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = $('[data-ok]', form);
    const btn = $('button[type=submit]', form);
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending…'; }
    setTimeout(() => {
      form.reset();
      if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.label; }
      if (ok) ok.classList.remove('hidden');
      $$('.chip', form).forEach((c, i) => c.classList.toggle('active', i === 0));
    }, 900);
  }));

  /* ---------- Copy to clipboard ---------- */
  $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch (_) { /* ignore */ }
    const old = b.innerHTML;
    b.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
    setTimeout(() => { b.innerHTML = old; }, 1500);
  }));

  /* =========================================================
     TRACK APPLICATION (track.html) — front-end demo data
     ========================================================= */
  const trackForm = $('#trackForm');
  if (trackForm) {
    const input = $('#trackInput'), err = $('#trackErr'), icon = $('#trackIcon');
    const seg = $('#trackSeg'), segPill = $('.seg-pill', seg), segBtns = $$('button', seg);
    const result = $('#trackResult'), inner = $('#trackResultInner');
    let mode = 'id';

    const moveSegPill = (btn) => { segPill.style.left = btn.offsetLeft + 'px'; segPill.style.width = btn.offsetWidth + 'px'; };
    const setMode = (m) => {
      mode = m;
      segBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === m));
      moveSegPill(segBtns.find(b => b.dataset.mode === m));
      input.value = '';
      input.placeholder = m === 'id' ? 'e.g. FC-2026-08814' : 'e.g. 01712-345678';
      input.setAttribute('aria-label', m === 'id' ? 'Application ID' : 'Mobile number');
      input.inputMode = m === 'id' ? 'text' : 'numeric';
      icon.className = (m === 'id' ? 'fa-solid fa-magnifying-glass' : 'fa-solid fa-mobile-screen') + ' absolute left-5 top-1/2 -translate-y-1/2 text-[#9aa3b5] text-lg';
      err.classList.add('hidden');
    };
    segBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    window.addEventListener('load', () => moveSegPill(segBtns[0]));
    window.addEventListener('resize', () => moveSegPill(segBtns.find(b => b.classList.contains('active'))));
    moveSegPill(segBtns[0]);

    const STEPS = [
      ['fa-paper-plane', 'Submitted'], ['fa-file-circle-check', 'Verified'], ['fa-building-columns', 'Bank review'],
      ['fa-thumbs-up', 'Approved'], ['fa-sack-dollar', 'Disbursed']
    ];
    const DB = {
      'FC-2026-08814': {
        name: 'Rafiq Ahmed', product: 'Personal Loan', icon: 'fa-user', bank: 'IPDC Finance PLC.', logo: 'assets/img/partners/p1.png',
        amount: '৳ 6,50,000', tenure: '36 months', rate: '9.0% p.a.', applied: '02 Nov 2026', current: 2,
        dates: ['02 Nov, 10:24 AM', '03 Nov, 02:10 PM', 'In progress', 'Expected 10 Nov', '—'],
        activity: [
          ['fa-building-columns', 'Application forwarded to IPDC Finance', 'Credit team is assessing your eligibility.', '05 Nov 2026 · 11:40 AM', true],
          ['fa-file-circle-check', 'Documents verified', 'NID, salary certificate and bank statement verified.', '03 Nov 2026 · 02:10 PM'],
          ['fa-phone', 'Advisor call completed', 'Your FinCoach advisor confirmed your requirements.', '02 Nov 2026 · 04:55 PM'],
          ['fa-paper-plane', 'Application submitted', 'We received your Personal Loan application.', '02 Nov 2026 · 10:24 AM']
        ],
        docs: [['NID (front & back)', 1], ['Salary certificate', 1], ['Bank statement (6 months)', 1], ['Passport-size photo', 0]]
      },
      'FC-2026-07120': {
        name: 'Farhana Rahman', product: 'Home Loan', icon: 'fa-house', bank: 'City Bank PLC.', logo: 'assets/img/partners/p2.jpg',
        amount: '৳ 45,00,000', tenure: '20 years', rate: '8.5% p.a.', applied: '12 Sep 2026', current: 5,
        dates: ['12 Sep', '15 Sep', '22 Sep', '02 Oct', '09 Oct'],
        activity: [
          ['fa-sack-dollar', 'Loan disbursed', 'Funds released to the seller account as instructed.', '09 Oct 2026 · 12:15 PM', true],
          ['fa-thumbs-up', 'Loan approved', 'City Bank approved your Home Loan at 8.5% p.a.', '02 Oct 2026 · 03:30 PM'],
          ['fa-building-columns', 'Bank review started', 'Property valuation and credit assessment completed.', '22 Sep 2026 · 10:05 AM'],
          ['fa-paper-plane', 'Application submitted', 'We received your Home Loan application.', '12 Sep 2026 · 09:12 AM']
        ],
        docs: [['NID (front & back)', 1], ['Income documents', 1], ['Property papers', 1], ['Valuation report', 1]]
      }
    };

    const showErr = (msg) => {
      err.querySelector('span').textContent = msg; err.classList.remove('hidden');
      input.classList.remove('error'); void input.offsetWidth; input.classList.add('error');
    };

    const skeleton = () => `
      <div class="grid lg:grid-cols-12 gap-6">
        <div class="lg:col-span-8 bg-white rounded-[30px] border border-line p-8 space-y-5">
          <div class="skeleton h-8 w-1/2"></div><div class="skeleton h-4 w-1/3"></div>
          <div class="skeleton h-28 w-full mt-6"></div><div class="skeleton h-40 w-full"></div>
        </div>
        <div class="lg:col-span-4 bg-white rounded-[30px] border border-line p-8 space-y-4">
          <div class="skeleton h-6 w-1/2"></div><div class="skeleton h-4 w-full"></div><div class="skeleton h-4 w-full"></div><div class="skeleton h-4 w-3/4"></div>
        </div>
      </div>`;

    const notFound = (q) => `
      <div class="result-in max-w-3xl mx-auto bg-white rounded-[30px] border border-line p-10 text-center shadow-[0_40px_80px_-50px_rgba(11,21,48,.45)]">
        <span class="mx-auto w-20 h-20 rounded-3xl bg-brand-tint text-brand grid place-items-center text-3xl"><i class="fa-solid fa-magnifying-glass"></i></span>
        <h3 class="mt-6 font-head font-extrabold text-3xl">No application found</h3>
        <p class="text-muted mt-2 max-w-md mx-auto">We couldn't find an application for <b class="text-ink">${q}</b>. Please double-check the ID or try your registered mobile number.</p>
        <div class="flex flex-wrap justify-center gap-3 mt-7">
          <a href="contact.html" class="btn btn-dark"><i class="fa-solid fa-headset"></i> Contact support</a>
          <a href="login.html" class="btn btn-ghost">Log in to dashboard</a>
        </div>
      </div>`;

    const render = (id, d) => {
      const done = d.current >= 5;
      const pct = done ? 100 : Math.round((d.current / 4) * 100);
      const stepNo = done ? 5 : d.current + 1;
      const statusTxt = done ? 'Disbursed' : STEPS[d.current][1];
      const NEXT = [
        ['Verifying your details', "We're checking your details and documents. This usually takes less than a day."],
        ['Preparing for the lender', 'Your verified application is being prepared and sent to ' + d.bank + '.'],
        [d.bank + ' is reviewing', 'The credit team is assessing your eligibility. Most decisions arrive within 3–7 working days.'],
        ['Sign your offer', 'Your loan is approved — review and sign the offer letter to receive your funds.'],
        ['Funds on the way', 'Your loan is being disbursed to your account.']
      ];
      const nx = done ? ['All done!', 'Your loan has been disbursed. Repayments start next month — you can track them in your dashboard.'] : NEXT[d.current];
      const eta = done ? 'Completed ' + d.dates[4] : d.dates[Math.min(d.current + 1, 4)];
      const docsDone = d.docs.filter(x => x[1]).length;
      const C = (2 * Math.PI * 52).toFixed(1);
      const stat = (ic, k, v) => `<div class="tr-stat"><i class="fa-solid ${ic}"></i><span><small>${k}</small><b>${v}</b></span></div>`;
      const steps = STEPS.map(([ic, t], i) => {
        const st = i < d.current || done ? 'done' : i === d.current ? 'current' : '';
        return `<div class="tr-step ${st}"><span class="tr-node"><i class="fa-solid ${st === 'done' ? 'fa-check' : ic}"></i></span><p>${t}</p><small>${d.dates[i]}</small></div>`;
      }).join('');
      const events = d.activity.map(([ic, t, s, when, latest]) => {
        const [date, time] = when.split(' · ');
        return `<div class="tr-ev ${latest ? 'is-latest' : ''}">
          <div class="tr-when"><b>${date.replace(/ \d{4}$/, '')}</b><span>${time || ''}</span></div>
          <div class="tr-rail"><span class="tr-dot"><i class="fa-solid ${ic}"></i></span></div>
          <div class="tr-box"><p class="font-bold">${t}${latest ? ' <span class="tr-new">Latest</span>' : ''}</p><p class="text-muted text-[15px] mt-0.5">${s}</p></div>
        </div>`;
      }).join('');
      const docs = d.docs.map(([t, ok]) => `<div class="tr-doc ${ok ? '' : 'is-pending'}"><span class="tr-doc-ic"><i class="fa-regular ${ok ? 'fa-file-lines' : 'fa-file'}"></i></span><span class="flex-1 font-semibold text-[15px]">${t}</span>${ok ? '<i class="fa-solid fa-circle-check text-green-500"></i>' : '<button type="button" class="tr-upload"><i class="fa-solid fa-arrow-up-from-bracket"></i> Upload</button>'}</div>`).join('');
      return `
      <div class="space-y-6">
        <div class="result-in tr-hero">
          <span class="tr-glow tr-glow-1"></span><span class="tr-glow tr-glow-2"></span>
          <div class="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <span class="tr-id"><i class="fa-solid fa-hashtag"></i>${id}<button type="button" class="tr-copy" data-copy="${id}" aria-label="Copy application ID"><i class="fa-regular fa-copy"></i></button></span>
                <span class="tr-status ${done ? 'is-done' : ''}">${done ? '<i class="fa-solid fa-circle-check"></i>' : '<span class="live-dot"></span>'}${statusTxt}</span>
              </div>
              <div class="flex items-center gap-4 mt-5">
                <span class="tr-ic"><i class="fa-solid ${d.icon}"></i></span>
                <div>
                  <h3 class="font-head font-extrabold text-[1.9rem] md:text-[2.4rem] leading-tight">${d.product}</h3>
                  <p class="text-white/65 text-sm mt-1">Applied ${d.applied} · ${d.name} · Updated just now</p>
                </div>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
                ${stat('fa-sack-dollar', 'Amount', d.amount)}${stat('fa-calendar-days', 'Tenure', d.tenure)}${stat('fa-percent', 'Rate', d.rate)}
                <div class="tr-stat"><span class="tr-logo"><img src="${d.logo}" alt="" /></span><span><small>Lender</small><b>${d.bank.replace(' PLC.', '')}</b></span></div>
              </div>
            </div>
            <div class="tr-ring">
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <defs><linearGradient id="trGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2545b" /><stop offset="1" stop-color="#d63bbd" /></linearGradient></defs>
                <circle cx="60" cy="60" r="52" class="tr-ring-bg" />
                <circle cx="60" cy="60" r="52" class="tr-ring-fg" data-pct="${pct}" stroke-dasharray="0 ${C}" />
              </svg>
              <div class="tr-ring-txt"><b>${pct}%</b><span>Step ${stepNo} of 5</span></div>
            </div>
          </div>
          <div class="tr-steps relative">
            <div class="tr-line"><span class="tr-line-fill" data-pct="${pct}"></span></div>
            ${steps}
          </div>
        </div>

        <div class="result-in tr-next" style="animation-delay:.08s">
          <span class="tr-next-ic"><i class="fa-solid ${done ? 'fa-champagne-glasses' : 'fa-wand-magic-sparkles'}"></i></span>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold uppercase tracking-wider text-brand">What happens next</p>
            <p class="font-head font-extrabold text-lg mt-0.5">${nx[0]}</p>
            <p class="text-muted text-[15px]">${nx[1]}</p>
          </div>
          <span class="tr-eta"><i class="fa-regular fa-clock"></i> ${eta}</span>
        </div>

        <div class="grid lg:grid-cols-12 gap-6">
          <div class="lg:col-span-8 result-in tr-card lg:self-start" style="animation-delay:.14s">
            <div class="flex items-center justify-between">
              <h3 class="font-head font-extrabold text-2xl">Activity</h3>
              <span class="tr-count">${d.activity.length} updates</span>
            </div>
            <div class="tr-tl mt-7">${events}</div>
          </div>

          <div class="lg:col-span-4 space-y-6">
            <div class="result-in tr-card" style="animation-delay:.2s">
              <p class="text-xs font-bold uppercase tracking-wider text-muted">Your advisor</p>
              <div class="flex items-center gap-3 mt-4">
                <span class="tr-ava">SA<i></i></span>
                <div><p class="font-head font-extrabold text-lg leading-tight">Sadia Akter</p><p class="text-sm text-muted">Relationship Officer · Online</p></div>
              </div>
              <div class="grid grid-cols-3 gap-2 mt-5">
                <a href="tel:+8809638229922" class="tr-act tr-act-main"><i class="fa-solid fa-phone"></i>Call</a>
                <a href="mailto:info@fincoachbd.com" class="tr-act"><i class="fa-regular fa-envelope"></i>Email</a>
                <a href="https://wa.me/8809638229922" target="_blank" rel="noopener" class="tr-act"><i class="fa-brands fa-whatsapp"></i>Chat</a>
              </div>
            </div>

            <div class="result-in tr-card" style="animation-delay:.26s">
              <div class="flex items-center justify-between">
                <h3 class="font-head font-extrabold text-lg">Documents</h3>
                <span class="text-sm font-bold ${docsDone === d.docs.length ? 'text-green-600' : 'text-ink'}">${docsDone} of ${d.docs.length} uploaded</span>
              </div>
              <div class="tr-bar mt-3"><span style="width:${(docsDone / d.docs.length) * 100}%"></span></div>
              <div class="space-y-2.5 mt-5">${docs}</div>
            </div>

            <a href="faq.html" class="result-in tr-help" style="animation-delay:.32s">
              <span class="tr-next-ic tr-help-ic"><i class="fa-regular fa-circle-question"></i></span>
              <span class="flex-1"><b class="block">Questions about your application?</b><span class="text-sm text-muted">Read our FAQs</span></span>
              <i class="fa-solid fa-arrow-right text-muted"></i>
            </a>
          </div>
        </div>
      </div>`;
    };

    const runSearch = (q) => {
      q = q.trim();
      let key;
      if (mode === 'id') {
        key = q.toUpperCase().replace(/\s+/g, '');
        if (!key) return showErr('Please enter your Application ID.');
        if (!/^FC-\d{4}-\d{4,6}$/.test(key)) return showErr('Application IDs look like FC-2026-08814.');
      } else {
        const digits = q.replace(/\D/g, '').replace(/^880/, '0');
        if (!/^01\d{9}$/.test(digits)) return showErr('Enter a valid 11-digit mobile number, e.g. 01712345678.');
        key = 'FC-2026-08814';
      }
      err.classList.add('hidden');
      const btn = $('#trackBtn');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Searching…';
      result.classList.remove('hidden');
      inner.innerHTML = skeleton();
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        btn.disabled = false; btn.innerHTML = 'Track Now <i class="fa-solid fa-arrow-right"></i>';
        const d = DB[key];
        inner.innerHTML = d ? render(key, d) : notFound(q);
        setTimeout(() => {
          const ring = $('.tr-ring-fg', inner), line = $('.tr-line-fill', inner);
          if (ring) { const C = 2 * Math.PI * 52; ring.setAttribute('stroke-dasharray', (C * ring.dataset.pct / 100).toFixed(1) + ' ' + C.toFixed(1)); }
          if (line) line.style.setProperty('--w', line.dataset.pct + '%');
          $$('[data-copy]', inner).forEach(b => b.addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(b.dataset.copy); } catch (_) { /* ignore */ }
            b.innerHTML = '<i class="fa-solid fa-check"></i>'; setTimeout(() => { b.innerHTML = '<i class="fa-regular fa-copy"></i>'; }, 1500);
          }));
        }, 120);
      }, 1100);
    };

    trackForm.addEventListener('submit', (e) => { e.preventDefault(); runSearch(input.value); });
    $$('[data-demo-id]').forEach(b => b.addEventListener('click', () => { setMode('id'); input.value = b.dataset.demoId; runSearch(b.dataset.demoId); }));
    const qp = new URLSearchParams(location.search).get('id');
    if (qp) { input.value = qp; runSearch(qp); }
  }

  /* =========================================================
     LOGIN / REGISTER (login.html) — front-end only
     ========================================================= */
  const authTabs = $('#authTabs');
  if (authTabs) {
    const panes = $$('.auth-pane');
    const tabsWrap = $('#authTabsWrap');
    const title = $('#authTitle'), sub = $('#authSub'), crumb = $('#crumbLabel');
    const COPY = {
      login: ['Welcome <span class="text-grad">back</span>', 'Log in to manage your applications, compare offers and track every update.', 'Login'],
      register: ['Create your <span class="text-grad">free account</span>', 'Join FinCoach in under a minute — compare, apply and track from one place.', 'Register'],
      forgot: ['Forgot your <span class="text-grad">password?</span>', "No worries — we'll help you get back into your account.", 'Reset password'],
      otp: ['Almost <span class="text-grad">there</span>', 'Verify your mobile number to keep your account secure.', 'Verification'],
      success: ['Welcome to <span class="text-grad">FinCoach</span>', "You're signed in and ready to go.", 'Success']
    };
    let otpFrom = 'register', resendTimer;
    const slider = $('#authSlider'), boxLogin = $('#boxLogin'), boxReg = $('#boxRegister');
    let side = 'login';

    const show = (name) => {
      // Which side of the sliding card does this pane live on?
      if (name === 'login' || name === 'forgot') side = 'login';
      else if (name === 'register') side = 'register';
      else if (name === 'otp') side = otpFrom === 'register' ? 'register' : 'login';
      const box = side === 'register' ? boxReg : boxLogin;
      const pane = $('#pane-' + name);
      if (pane.parentElement !== box) box.appendChild(pane);
      $$('.auth-pane', box).forEach(p => p.classList.toggle('active', p === pane));
      slider.classList.toggle('active', side === 'register');

      const isTab = name === 'login' || name === 'register';
      tabsWrap.classList.toggle('hidden', !isTab);
      if (isTab) {
        authTabs.classList.toggle('reg', name === 'register');
        $$('button', authTabs).forEach(b => b.classList.toggle('active', b.dataset.tab === name));
        history.replaceState(null, '', name === 'register' ? '#register' : location.pathname);
      }
      const c = COPY[name];
      title.innerHTML = c[0]; sub.textContent = c[1]; crumb.textContent = c[2];
      const mbT = $('#mbTitle'), mbS = $('#mbSub');
      if (mbT) {
        const reg = side === 'register';
        mbT.textContent = reg ? 'Welcome aboard!' : 'Hello, Friend!';
        mbS.textContent = reg ? 'Create your free account in under a minute.' : 'Compare, apply & track loans from 6+ Banks and FIs — free.';
      }
      $$('.form-err').forEach(e => e.classList.add('hidden'));
      if (name === 'otp') { startResend(); setTimeout(() => $('#otpBoxes input').focus(), 50); }
    };

    $$('button', authTabs).forEach(b => b.addEventListener('click', () => show(b.dataset.tab)));
    $$('[data-tab-link]').forEach(b => b.addEventListener('click', () => show(b.dataset.tabLink)));
    $$('[data-goto]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.goto === 'otp-login') { otpFrom = 'login'; $('#otpPhone').textContent = 'your registered mobile'; show('otp'); }
      else show(b.dataset.goto);
    }));
    $('[data-otp-back]').addEventListener('click', () => show(otpFrom === 'forgot' ? 'forgot' : otpFrom));
    if (location.hash === '#register') show('register');

    // Show / hide password
    $$('.pw-toggle').forEach(t => t.addEventListener('click', () => {
      const inp = t.parentElement.querySelector('input');
      const showPw = inp.type === 'password';
      inp.type = showPw ? 'text' : 'password';
      t.innerHTML = `<i class="fa-regular ${showPw ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
      t.setAttribute('aria-label', showPw ? 'Hide password' : 'Show password');
    }));

    // Password strength
    const pw = $('#rgPw'), bars = $$('#pwStrength span'), hint = $('#pwHint');
    pw.addEventListener('input', () => {
      const v = pw.value;
      let s = 0;
      if (v.length >= 8) s++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      if (!v) s = 0;
      const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
      const labels = ['Weak', 'Fair', 'Good', 'Strong'];
      bars.forEach((b, i) => { b.style.background = i < s ? colors[s - 1] : '#eef0f4'; });
      hint.innerHTML = v ? `Strength: <b style="color:${colors[Math.max(s, 1) - 1]}">${labels[Math.max(s, 1) - 1]}</b>` : 'Use 8+ characters with a mix of letters, numbers &amp; symbols.';
    });

    // Digits only for phone fields
    $$('input[type=tel]').forEach(i => i.addEventListener('input', () => { i.value = i.value.replace(/\D/g, '').slice(0, 11); }));
    const fmtPhone = (v) => { const d = v.replace(/\D/g, '').replace(/^0/, ''); return '+880 ' + d.slice(0, 4) + '-' + d.slice(4); };

    const busy = (form, on) => {
      const btn = $('button[type=submit]', form);
      btn.disabled = on;
      btn.innerHTML = on ? '<i class="fa-solid fa-circle-notch fa-spin"></i> Please wait…' : btn.dataset.label;
    };
    const valid = (form) => {
      const ok = $$('input[required]', form).every(i => i.type === 'checkbox' ? i.checked : i.value.trim() && i.checkValidity());
      $('.form-err', form)?.classList.toggle('hidden', ok);
      return ok;
    };

    $('#pane-login').addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target; if (!valid(f)) return;
      busy(f, true);
      setTimeout(() => {
        busy(f, false);
        $('#successTitle').textContent = 'Welcome back!';
        $('#successSub').textContent = "You're logged in. Pick up right where you left off.";
        show('success');
      }, 1000);
    });
    $('#pane-register').addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target; if (!valid(f)) return;
      busy(f, true);
      setTimeout(() => { busy(f, false); otpFrom = 'register'; $('#otpPhone').textContent = fmtPhone($('#rgPhone').value); show('otp'); }, 900);
    });
    $('#pane-forgot').addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target; if (!valid(f)) return;
      busy(f, true);
      setTimeout(() => { busy(f, false); otpFrom = 'forgot'; $('#otpPhone').textContent = fmtPhone($('#fgPhone').value); show('otp'); }, 900);
    });

    // OTP boxes
    const boxes = $$('#otpBoxes input');
    boxes.forEach((b, i) => {
      b.addEventListener('input', () => {
        b.value = b.value.replace(/\D/g, '').slice(-1);
        b.classList.toggle('filled', !!b.value);
        if (b.value && boxes[i + 1]) boxes[i + 1].focus();
      });
      b.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !b.value && boxes[i - 1]) { boxes[i - 1].focus(); boxes[i - 1].value = ''; boxes[i - 1].classList.remove('filled'); }
        if (e.key === 'ArrowLeft' && boxes[i - 1]) boxes[i - 1].focus();
        if (e.key === 'ArrowRight' && boxes[i + 1]) boxes[i + 1].focus();
      });
      b.addEventListener('paste', (e) => {
        const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
        if (!digits) return;
        e.preventDefault();
        boxes.forEach((x, k) => { x.value = digits[k] || ''; x.classList.toggle('filled', !!x.value); });
        boxes[Math.min(digits.length, 5)].focus();
      });
    });
    const startResend = () => {
      const btn = $('#resendBtn');
      const OTP_SECONDS = 180; // 3 minutes
      const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      let t = OTP_SECONDS;
      clearInterval(resendTimer);
      btn.disabled = true; btn.innerHTML = `Resend in <span id="resendT">${mmss(t)}</span>`;
      resendTimer = setInterval(() => {
        t--;
        if (t <= 0) { clearInterval(resendTimer); btn.disabled = false; btn.textContent = 'Resend code'; }
        else $('#resendT').textContent = mmss(t);
      }, 1000);
    };
    $('#resendBtn').addEventListener('click', startResend);
    $('#pane-otp').addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target;
      const full = boxes.every(b => b.value);
      $('.form-err', f).classList.toggle('hidden', full);
      if (!full) return;
      busy(f, true);
      setTimeout(() => {
        busy(f, false);
        boxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });
        clearInterval(resendTimer);
        if (otpFrom === 'register') { $('#successTitle').textContent = "You're all set!"; $('#successSub').textContent = 'Your FinCoach account is ready. Start comparing offers now.'; }
        else if (otpFrom === 'forgot') { $('#successTitle').textContent = 'Code verified!'; $('#successSub').textContent = "You can now set a new password and log in."; }
        else { $('#successTitle').textContent = 'Welcome back!'; $('#successSub').textContent = "You're logged in with OTP."; }
        show('success');
      }, 900);
    });
  }

  /* ---------- Login / Register popup (all pages) ---------- */
  const lm = $('#loginModal');
  if (lm) {
    const tabsEl = $('#lmTabs'), title = $('#lmTitle'), sub = $('#lmSub');
    let lastFocus = null;
    const showPane = (name) => {
      $$('.lm-pane', lm).forEach(p => p.classList.toggle('active', p.id === 'lm' + name[0].toUpperCase() + name.slice(1)));
      tabsEl.classList.toggle('hidden', name === 'done');
      tabsEl.classList.toggle('reg', name === 'register');
      $$('button', tabsEl).forEach(b => b.classList.toggle('active', b.dataset.lmTab === name));
      if (name === 'login') { title.textContent = 'Log in to your account'; sub.textContent = 'Track applications and manage your offers.'; }
      if (name === 'register') { title.textContent = 'Create your free account'; sub.textContent = 'Compare, apply and track — in under a minute.'; }
      $$('.lm-err', lm).forEach(e => e.classList.add('hidden'));
    };
    const openLm = (tab = 'login') => {
      lastFocus = document.activeElement;
      showPane(tab);
      lm.classList.add('open'); lm.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lm-lock');
      if (typeof setDrawer === 'function') setDrawer(false);
      setTimeout(() => { const f = $('.lm-pane.active input', lm); if (f) f.focus(); }, 80);
    };
    const closeLm = () => {
      lm.classList.remove('open'); lm.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lm-lock');
      if (lastFocus) lastFocus.focus();
    };
    $$('[data-login-open]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); openLm(b.dataset.loginOpen === 'register' ? 'register' : 'login'); }));
    $$('[data-lm-close]', lm).forEach(b => b.addEventListener('click', closeLm));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lm.classList.contains('open')) closeLm(); });
    $$('button', tabsEl).forEach(b => b.addEventListener('click', () => showPane(b.dataset.lmTab)));
    $$('.lm-eye', lm).forEach(t => t.addEventListener('click', () => {
      const inp = t.parentElement.querySelector('input'); const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      t.innerHTML = `<i class="fa-regular ${show ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
    }));
    $$('input[type=tel]', lm).forEach(i => i.addEventListener('input', () => { i.value = i.value.replace(/\D/g, '').slice(0, 11); }));
    const submitLm = (form, doneTitle, doneSub) => form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = $$('input[required]', form).every(i => i.type === 'checkbox' ? i.checked : i.value.trim() && i.checkValidity());
      $('.lm-err', form).classList.toggle('hidden', ok);
      if (!ok) return;
      const btn = $('button[type=submit]', form), label = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Please wait…';
      setTimeout(() => {
        btn.disabled = false; btn.innerHTML = label; form.reset();
        $('#lmDoneTitle').textContent = doneTitle; $('#lmDoneSub').textContent = doneSub;
        title.textContent = ''; sub.textContent = '';
        showPane('done');
      }, 900);
    });
    submitLm($('#lmLogin'), 'Welcome back!', "You're logged in. Pick up where you left off.");
    submitLm($('#lmRegister'), "You're all set!", 'Your free FinCoach account is ready.');
  }

  /* ---------- Hero scroll effect: laptop flattens, phone & card drift ---------- */
  const heroSec = $('#hero');
  if (heroSec && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const laptop = $('#heroLaptop'), phone = $('#heroPhone'), card = $('#heroCard'), arc = $('.hero-arc', heroSec);
    const waveF = $('.wave-front', heroSec), waveB = $('.wave-back', heroSec);
    const updateHero = () => {
      const h = heroSec.offsetHeight || 1;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > h * 1.3) return;
      const p = Math.min(Math.max(y / (h * 0.6), 0), 1); // 0 at top → 1 as the hero scrolls away
      if (laptop) laptop.style.transform = `perspective(1600px) rotateX(${(1 - p) * 6}deg) scale(${0.96 + p * 0.04})`;
      if (phone) phone.style.transform = `translateY(${p * -70}px)`;
      if (card) card.style.transform = `translateY(${p * -110}px) rotate(${p * 4}deg)`;
      if (arc) arc.style.transform = `scale(${1 + p * 0.05})`;
      if (waveF) waveF.style.transform = `translateX(${p * 14}px)`;
      if (waveB) waveB.style.transform = `translateX(${p * -14}px)`;
    };
    window.addEventListener('scroll', updateHero, { passive: true });
    window.addEventListener('resize', updateHero);
    updateHero();
  }

  /* =========================================================
     APPLY NOW wizard (apply.html) — front-end demo
     ========================================================= */
  const apForm = $('#applyForm');
  if (apForm) {
    const steps = $$('.ap-step', apForm), bars = $$('.ap-progress span', apForm);
    const back = $('#apBack'), next = $('#apNext'), err = $('.ap-err', apForm);
    const money = (n) => Math.round(n).toLocaleString('en-IN');
    const digits = (s) => +String(s).replace(/\D/g, '') || 0;
    const amtIn = $('#apAmount'), amtRange = $('#apAmtRange'), tenSel = $('#apTenure');
    let cur = 1;

    const PRODUCT = { personal: 'Personal Loan', auto: 'Auto Loan', home: 'Home Loan', card: 'Credit Card', sme: 'SME Loan', other: 'Personal Loan' };
    const ICON = { personal: 'fa-user', auto: 'fa-car', home: 'fa-house', card: 'fa-credit-card', sme: 'fa-store', other: 'fa-ellipsis' };
    const BASE = { personal: 9, auto: 9.5, home: 8.5, card: 9, sme: 10.5, other: 9 };
    const emiOf = (P, rate, n) => { const r = rate / 12 / 100; return r ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n; };
    const typeVal = () => $('input[name=type]:checked', apForm).value;

    // Pre-select loan type from ?type=
    const qType = new URLSearchParams(location.search).get('type');
    if (qType) {
      const map = { consolidation: 'personal', emergency: 'personal', education: 'personal', travel: 'personal', deposit: 'other' };
      const r = $('input[name=type][value="' + (map[qType] || qType) + '"]', apForm);
      if (r) r.checked = true;
    }

    // Live summary panel
    const fill = (el) => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min)) * 100 + '%');
    const updSummary = () => {
      const t = typeVal(), P = digits(amtIn.value), n = +tenSel.value, rate = BASE[t];
      $('#sumType').textContent = PRODUCT[t];
      $('#sumIc').innerHTML = '<i class="fa-solid ' + ICON[t] + '"></i>';
      $('#sumRate').textContent = rate.toFixed(1);
      $('#sumAmt').textContent = money(P);
      $('#sumTen').textContent = n >= 120 ? (n / 12) + ' years' : n + ' months';
      const e = P ? emiOf(P, rate, n) : 0;
      $('#sumEmi').textContent = money(e);
      $('#sumTot').textContent = money(e * n);
      $$('#apQuick button').forEach(b => b.classList.toggle('active', +b.dataset.amt === P));
      fill(amtRange);
    };
    amtIn.addEventListener('input', () => { const d = digits(amtIn.value); amtIn.value = d ? money(d) : ''; if (d) amtRange.value = Math.min(Math.max(d, +amtRange.min), +amtRange.max); updSummary(); });
    amtRange.addEventListener('input', () => { amtIn.value = money(+amtRange.value); updSummary(); });
    $$('#apQuick button').forEach(b => b.addEventListener('click', () => { amtIn.value = money(+b.dataset.amt); amtRange.value = b.dataset.amt; updSummary(); }));
    $$('#apTen button').forEach(b => b.addEventListener('click', () => { tenSel.value = b.dataset.ten; $$('#apTen button').forEach(x => x.classList.toggle('active', x === b)); updSummary(); }));
    $$('input[name=type]', apForm).forEach(r => r.addEventListener('change', updSummary));
    $('#apIncome').addEventListener('input', (e) => { const d = digits(e.target.value); e.target.value = d ? money(d) : ''; });
    $('#apPhone').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11); });
    updSummary();

    const show = (n) => {
      cur = n;
      steps.forEach(s => s.classList.toggle('active', +s.dataset.step === n));
      bars.forEach((b, k) => b.classList.toggle('on', k < n));
      $$('.ap5-steps li').forEach(li => { const k = +li.dataset.sn; li.classList.toggle('is-active', k === n); li.classList.toggle('is-done', k < n); });
      $$('.ap5-check li').forEach(li => li.classList.toggle('is-done', +li.dataset.chk < n || (n === 3 && li.dataset.done === '1')));
      $('#apNum').textContent = n;
      back.classList.toggle('hidden', n === 1);
      next.innerHTML = n === 3 ? 'See my offers <i class="fa-solid fa-magnifying-glass"></i>' : 'Continue <i class="fa-solid fa-arrow-right"></i>';
      err.classList.add('hidden');
    };
    const validate = () => {
      const step = steps[cur - 1];
      let ok = true;
      $$('input[required], select[required]', step).forEach(el => {
        let good = el.type === 'checkbox' ? el.checked : el.value.trim() !== '' && el.checkValidity();
        if (el.id === 'apAmount') good = digits(el.value) >= 10000;
        if (el.id === 'apIncome') good = digits(el.value) >= 5000;
        if (el.id === 'apPhone') good = /^01\d{9}$/.test(el.value);
        el.classList.toggle('is-invalid', !good);
        if (!good) ok = false;
      });
      err.classList.toggle('hidden', ok);
      return ok;
    };
    back.addEventListener('click', () => show(cur - 1));

    const LENDERS = [
      { logo: 'assets/img/partners/p1.png', name: 'IPDC Finance', add: 0, max: 2000000, fee: '1%', days: '3–5 days' },
      { logo: 'assets/img/partners/p5.jpg', name: 'NCC Bank', add: 0.5, max: 2500000, fee: '1%', days: '5–7 days' },
      { logo: 'assets/img/partners/p2.jpg', name: 'City Bank', add: 0.75, max: 3000000, fee: '0.5%', days: '3–7 days' },
      { logo: 'assets/img/partners/p3.jpg', name: 'IDLC Finance', add: 1.25, max: 2000000, fee: '1%', days: '5–7 days' },
      { logo: 'assets/img/partners/p6.jpg', name: 'Mutual Trust Bank', add: 1.5, max: 1500000, fee: '0.75%', days: '5–10 days' },
      { logo: 'assets/img/partners/p4.jpg', name: 'National Finance', add: 2, max: 1000000, fee: '1.5%', days: '7–10 days' }
    ];

    const renderResults = () => {
      const type = typeVal(), P = digits(amtIn.value), n = +tenSel.value, income = digits($('#apIncome').value);
      $('#resSummary').innerHTML = 'For a <b class="text-ink">' + PRODUCT[type] + '</b> of <b class="text-ink">৳' + money(P) + '</b> over <b class="text-ink">' + n + ' months</b>.';
      const order = { high: 0, good: 1, fair: 2 };
      const rows = LENDERS.map(l => {
        const rate = BASE[type] + l.add, emi = emiOf(P, rate, n), ratio = income ? emi / income : 1;
        const fit = P > l.max ? 'fair' : ratio <= 0.35 ? 'high' : ratio <= 0.5 ? 'good' : 'fair';
        return { ...l, rate, emi, fit };
      }).sort((a, b) => order[a.fit] - order[b.fit] || a.rate - b.rate);
      const FIT = { high: ['el-high', 'fa-circle-check', 'High chance', 92], good: ['el-good', 'fa-thumbs-up', 'Good chance', 74], fair: ['el-fair', 'fa-circle-info', 'Fair chance', 48] };
      $('#resCount').textContent = rows.length;
      $('#resRows').innerHTML = rows.map((x, k) => {
        const [cls, ic, txt, pct] = FIT[x.fit];
        return '<article class="ap5-offer' + (k === 0 ? ' is-best' : '') + '">' +
          (k === 0 ? '<span class="ap5-best"><i class="fa-solid fa-crown"></i> Best match</span>' : '') +
          '<div class="ap5-o-lender"><span class="ap5-o-logo"><img src="' + x.logo + '" alt="" /></span><div><b>' + x.name + '</b><small>' + PRODUCT[type] + '</small></div></div>' +
          '<div class="ap5-o-cell"><small>Interest rate</small><b class="ap5-o-rate">' + x.rate.toFixed(2) + '%</b></div>' +
          '<div class="ap5-o-cell"><small>Monthly EMI</small><b>৳' + money(x.emi) + '</b></div>' +
          '<div class="ap5-o-cell"><small>Max amount</small><b>৳' + money(x.max) + '</b></div>' +
          '<div class="ap5-o-cell ap5-o-fit"><small>Approval</small><span class="el-pill ' + cls + '"><i class="fa-solid ' + ic + '"></i> ' + txt + '</span><span class="ap5-o-bar"><i style="width:' + pct + '%"></i></span></div>' +
          '<div class="ap5-o-cta"><a href="login.html" data-login-open="register" class="btn ' + (k === 0 ? 'btn-primary' : 'btn-dark') + ' !py-3 !px-6">Apply <i class="fa-solid fa-arrow-right"></i></a><small>Fee ' + x.fee + ' · ' + x.days + '</small></div>' +
        '</article>';
      }).join('');
      const opener = $('.nav-text-btn[data-login-open]');
      $$('#resRows [data-login-open]').forEach(b => b.addEventListener('click', (e) => { if (opener) { e.preventDefault(); opener.click(); } }));
      $$('.ap5-check li').forEach(li => li.classList.add('is-done'));
      const sec = $('#results');
      sec.classList.remove('hidden');
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    apForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;
      if (cur < 3) { show(cur + 1); $('#applyBox').scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      next.disabled = true; next.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Finding your offers…';
      setTimeout(() => { next.disabled = false; show(3); renderResults(); }, 1100);
    });
    $('#apEdit').addEventListener('click', () => { show(1); $('#applyBox').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  }

  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
