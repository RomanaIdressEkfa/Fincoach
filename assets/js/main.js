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

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });

  /* ---------- Counters ---------- */
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, dur = 1600, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: 0.5 });
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

  /* ---------- EMI calculator ---------- */
  const fmt = (n) => Math.round(n).toLocaleString('en-IN');
  const amt = $('#amt'), rate = $('#rate'), ten = $('#ten');
  if (amt) {
  const fill = (el) => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min)) * 100 + '%');
  const calc = () => {
    const P = +amt.value, r = +rate.value / 12 / 100, n = +ten.value;
    const emi = r ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
    $('#amtVal').textContent = fmt(P);
    $('#rateVal').textContent = (+rate.value).toFixed(2);
    $('#tenVal').textContent = n;
    $('#emi').textContent = fmt(emi);
    $('#pVal').textContent = fmt(P);
    $('#iVal').textContent = fmt(emi * n - P);
    $('#tVal').textContent = fmt(emi * n);
    [amt, rate, ten].forEach(fill);
  };
  [amt, rate, ten].forEach(el => el.addEventListener('input', calc));
  calc();
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
      const pill = done
        ? '<span class="status-pill bg-green-100 text-green-700"><i class="fa-solid fa-circle-check"></i> Disbursed</span>'
        : `<span class="status-pill bg-brand-tint text-brand"><span class="live-dot !bg-brand"></span> ${STEPS[d.current][1]}</span>`;
      const pct = done ? 100 : (d.current / 4) * 100;
      return `
      <div class="grid lg:grid-cols-12 gap-6">
        <div class="lg:col-span-8 space-y-6">
          <div class="result-in bg-white rounded-[30px] border border-line p-6 md:p-9 shadow-[0_40px_80px_-50px_rgba(11,21,48,.45)]">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-5">
              <div class="flex items-center gap-4">
                <span class="w-16 h-16 rounded-2xl bg-grad text-white grid place-items-center text-2xl shadow-lg"><i class="fa-solid ${d.icon}"></i></span>
                <div>
                  <p class="text-sm font-bold text-muted">Application ID · <span class="text-ink">${id}</span></p>
                  <h3 class="font-head font-extrabold text-2xl md:text-3xl">${d.product}</h3>
                  <p class="text-muted text-sm mt-0.5">Applied on ${d.applied} · ${d.name}</p>
                </div>
              </div>
              <div class="flex flex-col md:items-end gap-2">${pill}<span class="text-xs text-muted font-semibold">Last updated: just now</span></div>
            </div>
            <div class="hstep mt-10" id="hstep">
              <div class="hstep-track"><div class="hstep-fill" data-pct="${pct}"></div></div>
              ${STEPS.map(([ic, t], i) => `
                <div class="hstep-item ${i < d.current || done ? 'done' : i === d.current ? 'current' : ''}">
                  <div class="hstep-dot"><i class="fa-solid ${i < d.current || done ? 'fa-check' : ic}"></i></div>
                  <div><p>${t}</p><small>${d.dates[i]}</small></div>
                </div>`).join('')}
            </div>
          </div>

          <div class="result-in bg-white rounded-[30px] border border-line p-6 md:p-9" style="animation-delay:.1s">
            <div class="flex items-center justify-between"><h3 class="font-head font-extrabold text-2xl">Activity</h3><span class="text-sm font-semibold text-muted">${d.activity.length} updates</span></div>
            <div class="tl mt-7">
              ${d.activity.map(([ic, t, s, when, latest]) => `
                <div class="tl-item">
                  <span class="tl-dot" ${latest ? 'style="background:var(--grad);border:0;color:#fff"' : ''}><i class="fa-solid ${ic} text-[10px]"></i></span>
                  <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                    <div><p class="font-bold">${t} ${latest ? '<span class="ml-1 text-[11px] font-bold text-brand bg-brand-tint rounded-full px-2 py-0.5 align-middle">Latest</span>' : ''}</p><p class="text-muted text-[15px] mt-0.5">${s}</p></div>
                    <span class="text-xs font-semibold text-muted whitespace-nowrap sm:mt-1">${when}</span>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <div class="lg:col-span-4 space-y-6">
          <div class="result-in bg-white rounded-[30px] border border-line p-7" style="animation-delay:.15s">
            <div class="flex items-center gap-3">
              <span class="w-14 h-14 rounded-2xl border border-line bg-white grid place-items-center p-2"><img src="${d.logo}" alt="" class="max-h-9 object-contain" /></span>
              <div><p class="text-xs font-bold text-muted uppercase tracking-wider">Lender</p><p class="font-head font-extrabold text-lg">${d.bank}</p></div>
            </div>
            <div class="mt-5">
              <div class="kv"><span>Amount</span><b>${d.amount}</b></div>
              <div class="kv"><span>Tenure</span><b>${d.tenure}</b></div>
              <div class="kv"><span>Indicative rate</span><b>${d.rate}</b></div>
              <div class="kv"><span>Applicant</span><b>${d.name}</b></div>
            </div>
          </div>

          <div class="result-in bg-ink text-white rounded-[30px] p-7 relative overflow-hidden" style="animation-delay:.2s">
            <div class="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-grad opacity-30 blur-2xl"></div>
            <p class="text-xs font-bold text-white/60 uppercase tracking-wider relative">Your advisor</p>
            <div class="flex items-center gap-3 mt-3 relative">
              <span class="w-12 h-12 rounded-full bg-grad grid place-items-center font-bold">SA</span>
              <div><p class="font-head font-extrabold text-lg">Sadia Akter</p><p class="text-sm text-[#aab3c8]">Relationship Officer</p></div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-5 relative">
              <a href="tel:+8809638229922" class="btn btn-primary !py-3 text-sm"><i class="fa-solid fa-phone"></i> Call</a>
              <a href="mailto:info@fincoachbd.com" class="btn bg-white/10 text-white !py-3 text-sm hover:bg-white/20"><i class="fa-regular fa-envelope"></i> Email</a>
            </div>
          </div>

          <div class="result-in bg-white rounded-[30px] border border-line p-7" style="animation-delay:.25s">
            <h3 class="font-head font-extrabold text-lg">Documents</h3>
            <div class="space-y-2.5 mt-4">
              ${d.docs.map(([t, ok]) => `<div class="doc-row"><span class="font-semibold text-[15px]"><i class="fa-regular fa-file-lines text-brand mr-2"></i>${t}</span>${ok ? '<i class="fa-solid fa-circle-check text-green-500"></i>' : '<span class="text-xs font-bold text-amber-600 bg-amber-50 rounded-full px-2.5 py-1">Pending</span>'}</div>`).join('')}
            </div>
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
        const fill = $('.hstep-fill', inner);
        if (fill) setTimeout(() => {
          const p = fill.dataset.pct + '%';
          if (window.matchMedia('(max-width: 767px)').matches) fill.style.height = p; else fill.style.width = p;
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

  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
