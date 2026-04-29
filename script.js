(function () {
  'use strict';

  const SPECIALS = {
    0: { label: 'Sunday Funday', items: ['$2 domestic beers', '$3 wells until 6pm', 'Free pool until 8pm', 'Kitchen open late'] },
    1: { label: 'Manic Monday',  items: ['Happy hour 3–6pm', 'Free pool 3–8pm', 'Darts tournament 8pm', 'APA league 9-ball 7pm'] },
    2: { label: 'Taco Tuesday',  items: ['$1 beef or chicken tacos', 'Happy hour 3–6pm', 'Free pool 3–8pm', '9-ball cash tourney 8pm'] },
    3: { label: 'League Night',  items: ['APA 8-ball league 7pm', 'Happy hour 3–6pm', 'Free pool 3–8pm', 'Sports on every screen'] },
    4: { label: '75¢ Wings',     items: ['75¢ wings all night', 'Happy hour 3–6pm', 'Free pool 3–8pm', "Bartender's pick shots"] },
    5: { label: 'BOGO Drinks',   items: ['BOGO drinks until 8pm*', 'Free pool 3–8pm', '8-ball cash tourney 8pm', '*restrictions apply'] },
    6: { label: 'Saturday Late', items: ['Happy hour 3–6pm', 'Free pool 3–8pm', 'Sports on every screen', 'Open till 3am'] }
  };

  const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const today = new Date().getDay();

  // Open status — open 3pm–3am every day
  const hour = new Date().getHours();
  const isOpen = hour >= 15 || hour < 3;

  const pill = document.querySelector('[data-open-pill]');
  const pillText = document.querySelector('[data-open-text]');
  const pillDot = pill && pill.querySelector('.pulse-dot');
  if (pill && pillText && pillDot) {
    pillText.textContent = isOpen ? 'Open now' : 'Closed — opens 3pm';
    pillDot.classList.toggle('closed', !isOpen);
  }

  // Tonight strip — populate with today's specials
  const tonightLabel = document.querySelector('[data-tonight-label]');
  const tonightItems = document.querySelector('[data-tonight-items]');
  const t = SPECIALS[today];
  if (tonightLabel && t) tonightLabel.textContent = t.label;
  if (tonightItems && t) {
    tonightItems.innerHTML = '';
    t.items.forEach((item, i) => {
      const chip = document.createElement('span');
      chip.className = 'tonight__chip ' + (i === 0 ? 'deal' : i === 1 ? 'pool' : '');
      const pip = document.createElement('span');
      pip.className = 'pip';
      pip.setAttribute('aria-hidden', 'true');
      const strong = document.createElement('strong');
      strong.textContent = item;
      chip.appendChild(pip);
      chip.appendChild(strong);
      tonightItems.appendChild(chip);
    });
  }

  // Highlight today's column in The Week
  document.querySelectorAll('.week__col[data-day]').forEach((col) => {
    if (Number(col.getAttribute('data-day')) === today) {
      col.classList.add('active');
      const day = col.querySelector('.week__day');
      if (day) day.textContent = DAY_LONG[today] + ' · tonight';
    }
  });

  // Highlight today's row in the hours table
  document.querySelectorAll('[data-hours] .row[data-day]').forEach((row) => {
    if (Number(row.getAttribute('data-day')) === today) {
      row.classList.add('today');
      const dt = row.querySelector('dt');
      if (dt) dt.textContent = DAY_LONG[today] + ' · today';
    }
  });

  // Footer year
  const yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();

  // Scroll-to-top button — show once "The Week" section reaches the top of the viewport
  const toTop = document.querySelector('[data-to-top]');
  const weekSection = document.getElementById('week');
  if (toTop && weekSection) {
    toTop.hidden = false;
    let visible = false;
    const setVisible = (v) => {
      if (v === visible) return;
      visible = v;
      toTop.classList.toggle('is-visible', v);
    };
    const onScroll = () => {
      setVisible(weekSection.getBoundingClientRect().top <= 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    toTop.addEventListener('click', () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
})();
