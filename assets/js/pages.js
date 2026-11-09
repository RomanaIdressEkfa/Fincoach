/* FinCoach — content pages (loan product, FAQ search, EMI schedule, blog filter).
   Loaded BEFORE main.js so accordions / scroll animations bind to rendered content. */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=900&q=75&auto=format&fit=crop`;
  const faqItem = (q, a, open) => `
      <div class="reveal faq acc${open ? ' open' : ''}">
        <button class="acc-head w-full flex items-center justify-between gap-4 p-6 text-left"><span class="font-head font-extrabold text-lg">${q}</span><span class="acc-chev"><i class="fa-solid fa-plus"></i></span></button>
        <div class="acc-body"><div><p class="px-6 pb-6 text-muted">${a}</p></div></div>
      </div>`;

  /* =========================================================
     LOAN PRODUCT PAGE (loan.html?type=…)
     ========================================================= */
  const LOANS = {
    personal: {
      name: 'Personal Loan', icon: 'fa-user', img: '1556157382-97eda2d62296', apply: 'personal',
      title: 'Money for the things that matter', rate: '9.0%', max: '৳20 Lakh', tenure: '12–60 mo', speed: '3–7 days',
      lead: 'Weddings, education, travel or a big purchase — compare unsecured personal loans from leading banks and FIs and apply online.',
      features: [['fa-shield-halved', 'No collateral', 'Unsecured loans — no property or security needed.'], ['fa-percent', 'Competitive rates', 'Rates from 9.0% p.a., compared side by side.'], ['fa-calendar-check', 'Flexible tenure', 'Repay over 12 to 60 months.'], ['fa-bolt', 'Fast decisions', 'Most lenders decide within 3–7 working days.']],
      elig: ['Bangladeshi citizen aged 22–60', 'Salaried for at least 1 year, or self-employed for 2+ years', 'Minimum monthly income of ৳25,000', 'Active bank account with salary/income credits'],
      docs: ['NID (front & back) and 2 passport-size photos', 'Salary certificate or trade licence', 'Last 6 months of bank statements', 'TIN certificate (for larger amounts)'],
      faq: [['How much can I borrow?', 'Most partner banks offer personal loans from ৳50,000 up to ৳20 Lakh, depending on your income and credit history.'], ['Do I need a guarantor?', 'Some lenders ask for a personal guarantor for larger amounts. Your offer will show the exact requirement.'], ['Can I repay early?', 'Yes. Early settlement is usually allowed; some lenders charge a small fee, which we show before you apply.']]
    },
    auto: {
      name: 'Auto Loan', icon: 'fa-car', img: '1519085360753-af0119f7cbe7', apply: 'auto',
      title: 'Drive home your dream car or bike', rate: '9.5%', max: '70% of price', tenure: '12–72 mo', speed: '5–7 days',
      lead: 'Finance a new or reconditioned car or bike with competitive auto loans from Bangladesh\'s leading banks.',
      features: [['fa-car-side', 'New & reconditioned', 'Finance brand-new or reconditioned vehicles.'], ['fa-percent', 'Rates from 9.5%', 'Compare auto loan rates in one place.'], ['fa-hand-holding-dollar', 'Up to 70% funding', 'Pay a smaller down payment.'], ['fa-calendar-check', 'Up to 6 years', 'Comfortable EMIs over up to 72 months.']],
      elig: ['Bangladeshi citizen aged 22–65', 'Salaried, business owner or self-employed', 'Minimum monthly income of ৳40,000', 'Able to pay the down payment (usually 30%)'],
      docs: ['NID and passport-size photos', 'Income proof (salary certificate / trade licence)', 'Last 6 months of bank statements', 'Vehicle quotation from the dealer'],
      faq: [['Can I finance a reconditioned car?', 'Yes, most partner banks finance reconditioned cars, usually up to a certain vehicle age.'], ['Is insurance required?', 'Yes. Comprehensive insurance is normally required for the loan period.'], ['How much down payment do I need?', 'Typically 30% of the vehicle price, depending on the lender and vehicle.']]
    },
    home: {
      name: 'Home Loan', icon: 'fa-house', img: '1494790108377-be9c29b29330', apply: 'home',
      title: 'Your dream home, one step closer', rate: '8.5%', max: '৳2 Crore', tenure: 'Up to 25 yrs', speed: '7–15 days',
      lead: 'Buy a flat, build on your land or renovate — compare long-tenure home loans with low rates.',
      features: [['fa-building', 'Buy, build or renovate', 'Home loans for every stage of your home journey.'], ['fa-percent', 'Rates from 8.5%', 'Some of the lowest rates in the market.'], ['fa-calendar-days', 'Up to 25 years', 'Smaller EMIs with long tenures.'], ['fa-user-tie', 'Dedicated advisor', 'Help from application to handover.']],
      elig: ['Bangladeshi citizen or NRB aged 25–65', 'Stable income for at least 2 years', 'Clear title and approved plan for the property', 'Ability to pay the equity (usually 30%)'],
      docs: ['NID, photos and TIN certificate', 'Income documents and 12 months of bank statements', 'Property papers (deed, mutation, approved plan)', 'Valuation and legal vetting reports'],
      faq: [['How much of the property price can I borrow?', 'Usually up to 70% of the property value, subject to your repayment capacity.'], ['Can NRBs apply?', 'Yes, several partner banks offer home loans to non-resident Bangladeshis.'], ['How long does approval take?', 'Typically 7–15 working days, including property valuation and legal checks.']]
    },
    card: {
      name: 'Credit Card', icon: 'fa-credit-card', img: '1563013544-824ae1b704d3', apply: 'card',
      title: 'The right card, rewards included', rate: '0%', max: 'Fee in yr 1', tenure: '50 days free', speed: '5–10 days',
      lead: 'Compare cards with cashback, reward points, lounge access and first-year fee waivers from leading banks.',
      features: [['fa-gift', 'Rewards & cashback', 'Earn on everyday spending.'], ['fa-plane', 'Lounge access', 'Travel cards with airport lounge access.'], ['fa-calendar-check', 'Up to 50 days free', 'Interest-free period on purchases.'], ['fa-tags', 'Fee waivers', 'First-year annual fee waivers on many cards.']],
      elig: ['Bangladeshi citizen aged 21+', 'Minimum monthly income of ৳30,000', 'Salaried, business owner or professional', 'Valid TIN for limits above a certain amount'],
      docs: ['NID and passport-size photos', 'Salary certificate or trade licence', 'Last 3–6 months of bank statements', 'TIN certificate'],
      faq: [['What credit limit will I get?', 'Limits depend on your income and the bank — usually 1.5 to 3 times your monthly income.'], ['Is there an annual fee?', 'Many cards waive the first-year fee. Ongoing fees are shown on each offer.'], ['Can I get a card without a TIN?', 'Some entry-level cards don\'t need a TIN; higher limits usually do.']]
    },
    sme: {
      name: 'SME Loan', icon: 'fa-store', img: '1556742049-0cfed4f6a45d', apply: 'sme',
      title: 'Finance that fuels your business', rate: '10.5%', max: '৳3 Crore', tenure: 'Up to 7 yrs', speed: '7–15 days',
      lead: 'Working capital, term loans and women-entrepreneur offers to help your small business grow.',
      features: [['fa-coins', 'Working capital', 'Revolving limits to manage cash flow.'], ['fa-industry', 'Term loans', 'Finance machinery and expansion.'], ['fa-person-dress', 'Women entrepreneurs', 'Special offers with lower rates.'], ['fa-user-tie', 'SME advisor', 'Help preparing your financing proposal.']],
      elig: ['Business operating for at least 2 years', 'Valid trade licence and TIN', 'Business bank account with regular transactions', 'Owner aged 22–65'],
      docs: ['Trade licence, TIN and owner\'s NID', '12 months of business bank statements', 'Financial statements or sales records', 'Partnership deed / MoA (if applicable)'],
      faq: [['Do I need collateral?', 'Collateral-free options are available for smaller amounts; larger loans may need security.'], ['Can FinCoach help with my proposal?', 'Yes. Our advisory team helps businesses prepare financing proposals.'], ['Are there offers for women entrepreneurs?', 'Yes, several partner banks offer special SME rates for women-led businesses.']]
    },
    consolidation: {
      name: 'Debt Consolidation Loan', icon: 'fa-layer-group', img: '1607863680198-23d4b2565df0', apply: 'personal',
      title: 'One payment instead of many', rate: '9.5%', max: '৳20 Lakh', tenure: '12–60 mo', speed: '3–7 days',
      lead: 'Combine credit card bills and other debts into a single monthly payment with a clear end date.',
      features: [['fa-layer-group', 'One EMI', 'Replace many bills with one payment.'], ['fa-percent', 'Lower interest', 'Often cheaper than card interest.'], ['fa-flag-checkered', 'Clear end date', 'Know exactly when you\'ll be debt-free.'], ['fa-chart-line', 'Build credit', 'On-time payments help your record.']],
      elig: ['Bangladeshi citizen aged 22–60', 'Stable monthly income of ৳30,000+', 'Existing debts in good standing', 'Active bank account'],
      docs: ['NID and photos', 'Income proof', 'Statements of existing loans/cards', 'Last 6 months of bank statements'],
      faq: [['Will it lower my monthly payment?', 'Often yes, by combining high-interest debts into one lower-rate loan over a fixed tenure.'], ['Can I include credit card debt?', 'Yes, card balances are the most common debts people consolidate.'], ['Does it close my credit cards?', 'Not automatically — it pays off the balance. Keeping cards open is your choice.']]
    },
    emergency: {
      name: 'Emergency Loan', icon: 'fa-umbrella', img: '1500648767791-00dcc994a43e', apply: 'personal',
      title: 'Quick cash when life happens', rate: '10.0%', max: '৳5 Lakh', tenure: '6–36 mo', speed: '1–3 days',
      lead: 'Cover medical bills, urgent repairs or the unexpected with fast-decision loans.',
      features: [['fa-bolt', 'Fast decisions', 'Some lenders decide within 1–3 days.'], ['fa-file-circle-check', 'Simple documents', 'Minimal paperwork.'], ['fa-shield-halved', 'No collateral', 'Unsecured loans.'], ['fa-calendar-check', 'Short tenures', 'Repay over 6 to 36 months.']],
      elig: ['Bangladeshi citizen aged 22–60', 'Regular monthly income', 'Active bank account', 'Good repayment history'],
      docs: ['NID and photo', 'Income proof', 'Last 3 months of bank statements'],
      faq: [['How fast can I get the money?', 'Some partner lenders disburse within 1–3 working days after approval.'], ['What can I use it for?', 'Medical costs, urgent repairs or any unexpected expense.'], ['Is the rate higher?', 'Rates are similar to personal loans; each offer shows the exact rate.']]
    },
    education: {
      name: 'Education Loan', icon: 'fa-graduation-cap', img: '1580489944761-15a19d654956', apply: 'personal',
      title: 'Invest in your future', rate: '9.0%', max: '৳30 Lakh', tenure: '12–84 mo', speed: '5–10 days',
      lead: 'Tuition, admission and study-abroad costs with flexible repayment options.',
      features: [['fa-school', 'Local & abroad', 'Study in Bangladesh or overseas.'], ['fa-percent', 'Rates from 9.0%', 'Compare education loan rates.'], ['fa-hourglass-half', 'Flexible repayment', 'Options that fit student life.'], ['fa-users', 'Parent co-applicant', 'Apply with a parent or guardian.']],
      elig: ['Student with confirmed admission', 'Parent/guardian co-applicant with stable income', 'Bangladeshi citizen', 'Active bank account'],
      docs: ['Admission/offer letter', 'NID of co-applicant and student ID', 'Income proof of co-applicant', 'Fee structure from the institution'],
      faq: [['Can I study abroad with this loan?', 'Yes, several banks finance study-abroad costs including tuition and living expenses.'], ['Who repays the loan?', 'Usually the parent or guardian co-applicant.'], ['Is there a grace period?', 'Some lenders offer a moratorium during studies — check each offer.']]
    },
    travel: {
      name: 'Travel Loan', icon: 'fa-plane-departure', img: '1438761681033-6461ffad8d80', apply: 'personal',
      title: 'Travel now, pay in easy instalments', rate: '9.5%', max: '৳10 Lakh', tenure: '6–36 mo', speed: '3–7 days',
      lead: 'Plan Umrah, Hajj or a family holiday and spread the cost over easy monthly payments.',
      features: [['fa-kaaba', 'Umrah & Hajj', 'Dedicated pilgrimage financing.'], ['fa-umbrella-beach', 'Family holidays', 'Domestic and international trips.'], ['fa-percent', 'Rates from 9.5%', 'Compare offers side by side.'], ['fa-calendar-check', 'Short tenures', '6 to 36 months.']],
      elig: ['Bangladeshi citizen aged 22–60', 'Monthly income of ৳30,000+', 'Valid passport', 'Active bank account'],
      docs: ['NID, passport and photos', 'Income proof', 'Travel package quotation', 'Last 6 months of bank statements'],
      faq: [['Can I finance Hajj or Umrah?', 'Yes, several partner banks offer dedicated pilgrimage loans.'], ['Does it cover flights and hotels?', 'Yes, it can cover your full travel package.'], ['How soon should I apply?', 'Ideally 3–4 weeks before booking.']]
    },
    deposit: {
      name: 'Deposit Schemes', icon: 'fa-piggy-bank', img: '1607863680198-23d4b2565df0', apply: 'other',
      title: 'Grow your savings, safely', rate: 'Up to 11%', max: 'From ৳500/mo', tenure: '1–10 yrs', speed: 'Same day',
      lead: 'Compare FDR and DPS rates from leading banks and FIs and open a scheme online.',
      features: [['fa-chart-line', 'Best rates', 'Compare FDR and DPS returns.'], ['fa-calendar-days', 'Flexible tenures', 'From 1 to 10 years.'], ['fa-coins', 'Start small', 'Monthly DPS from ৳500.'], ['fa-building-columns', 'Trusted banks', 'Only licensed institutions.']],
      elig: ['Bangladeshi citizen aged 18+', 'Valid NID', 'Bank account for monthly deposits (DPS)'],
      docs: ['NID and photos', 'Nominee\'s NID and photo', 'TIN certificate (for larger deposits)'],
      faq: [['What is the difference between FDR and DPS?', 'FDR is a one-time lump-sum deposit; DPS is a monthly savings plan.'], ['Are deposits safe?', 'We only list licensed banks and FIs regulated by Bangladesh Bank.'], ['Is tax deducted?', 'Yes, source tax applies to interest as per government rules.']]
    }
  };

  const lpTitle = $('[data-l="title"]');
  if (lpTitle) {
    const type = new URLSearchParams(location.search).get('type');
    const key = LOANS[type] ? type : 'personal';
    const L = LOANS[key];
    document.title = `${L.name} — FinCoach`;
    const lower = L.name.toLowerCase();
    const set = { name: L.name, title: L.title, lead: L.lead, rate: L.rate, max: L.max, tenure: L.tenure, speed: L.speed, nameLower: lower };
    $$('[data-l]').forEach((el) => { const k = el.dataset.l; if (set[k] != null) el.textContent = set[k]; });
    $$('[data-l-icon]').forEach((el) => { el.className = `fa-solid ${L.icon}`; });
    const img = $('[data-l-img]'); img.src = IMG(L.img); img.alt = L.name;
    $$('[data-l-apply]').forEach((a) => { a.href = `apply.html?type=${L.apply}`; });
    $('#lpFeatures').innerHTML = L.features.map(([i, t, d], n) => `
      <div class="reveal lp2-feat"><span class="lp2-feat-n">0${n + 1}</span><span class="lp2-feat-ic"><i class="fa-solid ${i}"></i></span><h3>${t}</h3><p>${d}</p></div>`).join('');
    // Eligibility checker (tick items, ring fills)
    const eligEl = $('#lpElig');
    eligEl.innerHTML = L.elig.map((s) => `<li><button type="button" class="el2-item" aria-pressed="false"><span class="el2-box"><i class="fa-solid fa-check"></i></span>${esc(s)}</button></li>`).join('');
    const ringFg = $('#elRingFg'), cnt = $('#elCount'), res = $('#elResult'), msg = $('#elMsg');
    const updElig = () => {
      const items = $$('.el2-item', eligEl), on = items.filter((b) => b.getAttribute('aria-pressed') === 'true').length, tot = items.length;
      const C = 2 * Math.PI * 27;
      if (ringFg) ringFg.setAttribute('stroke-dasharray', `${(C * on / tot).toFixed(1)} ${C.toFixed(1)}`);
      if (cnt) cnt.textContent = `${on}/${tot}`;
      if (!res) return;
      const ok = on === tot;
      res.classList.toggle('is-ok', ok);
      res.firstElementChild.innerHTML = `<i class="fa-solid ${ok ? 'fa-check' : on ? 'fa-hourglass-half' : 'fa-regular fa-hand-pointer'}"></i>`.replace('fa-solid fa-regular', 'fa-regular');
      msg.innerHTML = ok ? `You're likely eligible! <a href="apply.html?type=${L.apply}">Check your offers →</a>` : on ? `${tot - on} more to go — keep ticking.` : 'Tick each point that applies to you.';
    };
    $$('.el2-item', eligEl).forEach((b) => b.addEventListener('click', () => { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); updElig(); }));
    updElig();

    // Documents as icon tiles
    const docIc = (s) => /NID|passport|ID/i.test(s) ? 'fa-id-card' : /photo/i.test(s) ? 'fa-camera' : /salary|income|trade|licen|proof/i.test(s) ? 'fa-file-invoice-dollar'
      : /statement|bank/i.test(s) ? 'fa-building-columns' : /TIN|tax/i.test(s) ? 'fa-receipt' : /property|deed|plan|valuation/i.test(s) ? 'fa-house-circle-check'
      : /quotation|package|vehicle|admission|offer/i.test(s) ? 'fa-file-signature' : 'fa-file-lines';
    $('#lpDocs').innerHTML = L.docs.map((s) => `<div class="el2-doc"><i class="fa-solid ${docIc(s)}"></i><span>${esc(s)}</span></div>`).join('');
    $('#faqList').innerHTML = L.faq.map(([q, a], k) => faqItem(esc(q), esc(a), k === 0)).join('');
    $('#lpOthers').innerHTML = Object.entries(LOANS).filter(([k]) => k !== key).slice(0, 8).map(([k, o]) => `
      <a href="loan.html?type=${k}" class="reveal lp2-other"><span class="lp2-other-ic"><i class="fa-solid ${o.icon}"></i></span><b>${o.name}</b><small>from ${o.rate}</small><i class="fa-solid fa-arrow-right lp2-other-go"></i></a>`).join('');

    // Partner rate comparison table
    const base = parseFloat(L.rate);
    const numeric = !isNaN(base) && base > 0 && !/up to/i.test(L.rate);
    const LENDERS = [
      ['assets/img/partners/p1.png', 'IPDC Finance', 0, '1%'], ['assets/img/partners/p5.jpg', 'NCC Bank', 0.5, '1%'],
      ['assets/img/partners/p2.jpg', 'City Bank', 0.75, '0.5%'], ['assets/img/partners/p3.jpg', 'IDLC Finance', 1, '1%'],
      ['assets/img/partners/p6.jpg', 'Mutual Trust Bank', 1.25, '0.75%']
    ];
    // Offer cards (bento) with sorting
    const og = $('#lpOffers');
    if (og) {
      const money = (n) => Math.round(n).toLocaleString('en-IN');
      const emiOf = (r) => { const m = r / 12 / 100, n = 36, P = 500000; return (P * m * Math.pow(1 + m, n)) / (Math.pow(1 + m, n) - 1); };
      const offers = LENDERS.map(([logo, name, add, fee]) => ({ logo, name, fee, feeN: parseFloat(fee), rate: numeric ? base + add : null }));
      const card = (o, best) => {
        const rateTxt = o.rate != null ? o.rate.toFixed(2) + '%' : esc(L.rate);
        const emi = o.rate != null ? '৳' + money(emiOf(o.rate)) : '—';
        return `<article class="of-card ${best ? 'of-best' : ''}">
          ${best ? '<span class="of-ribbon"><i class="fa-solid fa-crown"></i> Best offer for you</span>' : ''}
          <div class="of-head"><span class="of-logo"><img src="${o.logo}" alt="" /></span><div><p class="of-name">${o.name}</p><p class="of-sub">${esc(L.name)}</p></div></div>
          <div class="of-rate"><b>${rateTxt}</b>${o.rate != null ? '<span>p.a.</span>' : ''}</div>
          <div class="of-meta"><div><small>Monthly EMI</small><b>${emi}</b></div><div><small>Processing fee</small><b>${o.fee}</b></div></div>
          ${best ? `<ul class="of-perks"><li><i class="fa-solid fa-check"></i>Up to ${esc(L.max)}</li><li><i class="fa-solid fa-check"></i>Tenure ${esc(L.tenure)}</li><li><i class="fa-solid fa-check"></i>Decision in ${esc(L.speed)}</li></ul>` : ''}
          <div class="of-foot"><a href="loan.html?type=${key}#faqList" class="of-link">Details</a><a href="apply.html?type=${L.apply}" class="btn ${best ? 'btn-white' : 'btn-primary'} !py-2.5 !px-5 text-sm">Apply${best ? ' now' : ''} <i class="fa-solid fa-arrow-right"></i></a></div>
        </article>`;
      };
      const draw = (by) => {
        const list = [...offers].sort((a, b) => by === 'fee' ? a.feeN - b.feeN || (a.rate || 0) - (b.rate || 0) : (a.rate || 0) - (b.rate || 0) || a.feeN - b.feeN);
        og.innerHTML = list.map((o, i) => card(o, i === 0)).join('');
      };
      $$('.of-sort button').forEach((b) => b.addEventListener('click', () => { $$('.of-sort button').forEach((x) => x.classList.toggle('active', x === b)); draw(b.dataset.sort); }));
      draw('rate');
      const dt = $('#lpDate'); if (dt) dt.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    const rt = $('#lpRates');
    if (rt) {
      rt.innerHTML = LENDERS.map(([logo, name, add, fee], k) => `
        <tr class="${k === 0 ? 'is-best' : ''}">
          <td data-th="Lender"><div class="flex items-center gap-3"><span class="lp2-tlogo"><img src="${logo}" alt="" /></span><span><b>${name}</b>${k === 0 ? '<span class="lp2-best">Best rate</span>' : ''}</span></div></td>
          <td data-th="Interest rate"><b class="lp2-rate">${numeric ? (base + add).toFixed(2) + '%' : esc(L.rate)}</b>${numeric ? ' <small>p.a.</small>' : ''}</td>
          <td data-th="Max amount">${esc(L.max)}</td>
          <td data-th="Tenure">${esc(L.tenure)}</td>
          <td data-th="Processing fee">${fee}</td>
          <td><a href="apply.html?type=${L.apply}" class="btn ${k === 0 ? 'btn-primary' : 'btn-ghost'} !py-2.5 !px-5 text-sm">Apply</a></td>
        </tr>`).join('');
      const dt = $('#lpDate'); if (dt) dt.textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // Quick EMI widget in hero
    const qa = $('#lpcAmt'), qt = $('#lpcTen');
    if (qa) {
      const r0 = numeric ? base : 9;
      $('#lpcRate').textContent = r0.toFixed(1);
      if (!numeric) $('#lpCalc').classList.add('hidden');
      const money = (n) => Math.round(n).toLocaleString('en-IN');
      const fill = (el) => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min)) * 100 + '%');
      const upd = () => {
        const P = +qa.value, n = +qt.value, r = r0 / 12 / 100;
        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        $('#lpcAmtV').textContent = money(P); $('#lpcTenV').textContent = n; $('#lpcEmi').textContent = money(emi);
        fill(qa); fill(qt);
      };
      [qa, qt].forEach((el) => el.addEventListener('input', upd));
      upd();
    }
  }

  /* =========================================================
     FAQ PAGE — search + category filter
     ========================================================= */
  const faqSearch = $('#faqSearch');
  if (faqSearch) {
    const items = $$('#faqAll .faq'), chips = $$('#faqCats .chip'), empty = $('#faqEmpty');
    let cat = 'all';
    const apply = () => {
      const q = faqSearch.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((it) => {
        const ok = (cat === 'all' || it.dataset.cat === cat) && (!q || it.textContent.toLowerCase().includes(q));
        it.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      empty.classList.toggle('hidden', shown > 0);
    };
    faqSearch.addEventListener('input', apply);
    chips.forEach((c) => c.addEventListener('click', () => { cat = c.dataset.cat; chips.forEach((x) => x.classList.toggle('active', x === c)); apply(); }));
    // v2 extras: result count, heading, popular searches, Ctrl+K
    const shownEl = $('#faqShown'), head = $('#faqHeading');
    const refresh = () => {
      if (shownEl) shownEl.textContent = items.filter((it) => it.style.display !== 'none').length;
      if (head) { const a = chips.find((c) => c.classList.contains('active')); head.textContent = faqSearch.value.trim() ? 'Search results' : (a ? a.querySelector('b') ? a.querySelector('b').textContent : a.textContent : 'All questions'); }
    };
    faqSearch.addEventListener('input', refresh);
    chips.forEach((c) => c.addEventListener('click', refresh));
    $$('.fq2-pop button').forEach((b) => b.addEventListener('click', () => { faqSearch.value = b.dataset.q; faqSearch.dispatchEvent(new Event('input')); $('#faqAll').scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); faqSearch.focus(); } });
    refresh();
  }

  /* Blog search + empty state */
  const blogSearch = $('#blogSearch');
  if (blogSearch) {
    const posts = $$('#blogGrid .blog-card'), empty = $('#blogEmpty');
    let bcat = 'all';
    const run = () => {
      const q = blogSearch.value.trim().toLowerCase(); let n = 0;
      posts.forEach((p) => { const ok = (bcat === 'all' || p.dataset.cat === bcat) && (!q || p.textContent.toLowerCase().includes(q)); p.style.display = ok ? '' : 'none'; if (ok) n++; });
      if (empty) empty.classList.toggle('hidden', n > 0);
    };
    blogSearch.addEventListener('input', run);
    $$('#blogCats .chip').forEach((c) => c.addEventListener('click', () => { bcat = c.dataset.cat; setTimeout(run, 0); }));
  }

  /* Blog post: reading progress + active TOC */
  const readBar = $('#readBar');
  if (readBar) {
    const art = $('.ps2-article, .lg2-article'), links = $$('#postToc a'), heads = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const onScroll = () => {
      const r = art.getBoundingClientRect(), total = art.offsetHeight - window.innerHeight * .6;
      readBar.style.width = Math.min(Math.max(-r.top / Math.max(total, 1), 0), 1) * 100 + '%';
      let cur = heads[0];
      heads.forEach((h) => { if (h.getBoundingClientRect().top < 160) cur = h; });
      links.forEach((a) => a.classList.toggle('active', cur && a.getAttribute('href') === '#' + cur.id));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* =========================================================
     EMI PAGE — repayment schedule (yearly / monthly)
     ========================================================= */
  const sched = $('#schedBody');
  if (sched) {
    let mode = 'year';
    const fmt = (n) => Math.round(n).toLocaleString('en-IN');
    const render = () => {
      const P = +$('#amt').value, n = +$('#ten').value, r = +$('#rate').value / 12 / 100;
      const emi = r ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
      let bal = P; const rows = [];
      let acc = { p: 0, i: 0 };
      for (let m = 1; m <= n; m++) {
        const int = bal * r, prin = emi - int; bal = Math.max(bal - prin, 0);
        acc.p += prin; acc.i += int;
        if (mode === 'month' || m % 12 === 0 || m === n) {
          rows.push([mode === 'month' ? `Month ${m}` : `Year ${Math.ceil(m / 12)}`, acc.p, acc.i, acc.p + acc.i, bal]);
          acc = { p: 0, i: 0 };
        }
      }
      sched.innerHTML = rows.map(([l, p, i, t, b]) => `<tr><td>${l}</td><td>৳${fmt(p)}</td><td>৳${fmt(i)}</td><td>৳${fmt(t)}</td><td>৳${fmt(b)}</td></tr>`).join('');
    };
    document.addEventListener('input', (e) => { if (e.target.closest('#calculator')) setTimeout(render, 0); });
    $$('#schedTabs button').forEach((b) => b.addEventListener('click', () => {
      mode = b.dataset.mode; $$('#schedTabs button').forEach((x) => x.classList.toggle('active', x === b)); render();
    }));
    window.addEventListener('load', render);
    setTimeout(render, 0);
  }

  /* =========================================================
     BLOG — category filter
     ========================================================= */
  const blogGrid = $('#blogGrid');
  if (blogGrid) {
    const posts = $$('.blog-card', blogGrid), chips = $$('#blogCats .chip');
    chips.forEach((c) => c.addEventListener('click', () => {
      chips.forEach((x) => x.classList.toggle('active', x === c));
      posts.forEach((p) => { p.style.display = c.dataset.cat === 'all' || p.dataset.cat === c.dataset.cat ? '' : 'none'; });
    }));
  }
})();
