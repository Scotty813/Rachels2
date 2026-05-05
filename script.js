(function () {
  "use strict";

  const SPECIALS = {
    0: {
      label: "Sunday Funday",
      items: [
        "$2 domestic beers",
        "$3 wells until 6pm",
        "Free pool until 8pm",
        "Kitchen open late",
      ],
    },
    1: {
      label: "Manic Monday",
      items: [
        "Happy hour 3–6pm",
        "Free pool 3–8pm",
        "APA league 9-ball 7pm",
        "Darts tournament 8pm",
      ],
    },
    2: {
      label: "Taco Tuesday",
      items: [
        "$1 beef or chicken tacos",
        "Happy hour 3–6pm",
        "Free pool 3–8pm",
        "9-ball cash tourney 8pm",
      ],
    },
    3: {
      label: "League Night",
      items: [
        "APA 8-ball league 7pm",
        "Happy hour 3–6pm",
        "Free pool 3–8pm",
        "Sports on every screen",
      ],
    },
    4: {
      label: "Wing Night",
      items: [
        "99¢ wings all night",
        "Happy hour 3–6pm",
        "Free pool 3–8pm",
        "Bartender's pick shots",
      ],
    },
    5: {
      label: "BOGO Drinks",
      items: [
        "BOGO drinks until 8pm (restrictions apply)",
        "Free pool 3–8pm",
        "8-ball cash tourney 8pm",
      ],
    },
    6: {
      label: "Saturday Late",
      items: [
        "Happy hour 3–6pm",
        "Free pool 3–8pm",
        "Sports on every screen",
        "Open till 3am",
      ],
    },
  };

  const DAY_LONG = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const today = new Date().getDay();

  // Open status — open 3pm–3am every day
  const hour = new Date().getHours();
  const isOpen = hour >= 15 || hour < 3;

  const pill = document.querySelector("[data-open-pill]");
  const pillText = document.querySelector("[data-open-text]");
  const pillDot = pill && pill.querySelector(".pulse-dot");
  if (pill && pillText && pillDot) {
    pillText.textContent = isOpen ? "Open now" : "Closed — opens 3pm";
    pillDot.classList.toggle("closed", !isOpen);
  }

  // Tonight strip — populate with today's specials
  const tonightLabel = document.querySelector("[data-tonight-label]");
  const tonightItems = document.querySelector("[data-tonight-items]");
  const t = SPECIALS[today];
  if (tonightLabel && t) tonightLabel.textContent = t.label;
  if (tonightItems && t) {
    tonightItems.innerHTML = "";
    t.items.forEach((item, i) => {
      const chip = document.createElement("span");
      chip.className =
        "tonight__chip " + (i === 0 ? "deal" : i === 1 ? "pool" : "");
      const pip = document.createElement("span");
      pip.className = "pip";
      pip.setAttribute("aria-hidden", "true");
      const strong = document.createElement("strong");
      strong.textContent = item;
      chip.appendChild(pip);
      chip.appendChild(strong);
      tonightItems.appendChild(chip);
    });
  }

  // Highlight today's column in The Week
  document.querySelectorAll(".week__col[data-day]").forEach((col) => {
    if (Number(col.getAttribute("data-day")) === today) {
      col.classList.add("active");
      const day = col.querySelector(".week__day");
      if (day) day.textContent = DAY_LONG[today] + " · tonight";
    }
  });

  // Highlight today's row in the hours table
  document.querySelectorAll("[data-hours] .row[data-day]").forEach((row) => {
    if (Number(row.getAttribute("data-day")) === today) {
      row.classList.add("today");
      const dt = row.querySelector("dt");
      if (dt) dt.textContent = DAY_LONG[today] + " · today";
    }
  });

  // Week slider — horizontal carousel on >=1101px
  const weekTrack = document.querySelector("[data-week]");
  const weekPrev = document.querySelector("[data-week-prev]");
  const weekNext = document.querySelector("[data-week-next]");
  if (weekTrack && weekPrev && weekNext) {
    const mq = window.matchMedia("(min-width: 1101px)");

    const updateButtons = () => {
      const max = weekTrack.scrollWidth - weekTrack.clientWidth;
      weekPrev.disabled = weekTrack.scrollLeft <= 1;
      weekNext.disabled = weekTrack.scrollLeft >= max - 1;
    };

    weekPrev.addEventListener("click", () => {
      weekTrack.scrollTo({ left: 0, behavior: "smooth" });
    });
    weekNext.addEventListener("click", () => {
      weekTrack.scrollTo({
        left: weekTrack.scrollWidth - weekTrack.clientWidth,
        behavior: "smooth",
      });
    });
    weekTrack.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);

    const sync = () => {
      const active = mq.matches;
      weekPrev.hidden = !active;
      weekNext.hidden = !active;
      if (active) {
        // Bring today's card into view on first activation
        const todayCol = weekTrack.querySelector(".week__col.active");
        if (todayCol) {
          weekTrack.scrollLeft = Math.max(
            0,
            todayCol.offsetLeft - weekTrack.offsetLeft,
          );
        }
        updateButtons();
      }
    };
    sync();
    if (mq.addEventListener) mq.addEventListener("change", sync);
    else if (mq.addListener) mq.addListener(sync);
  }

  // Footer year
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  const topbar = document.querySelector(".topbar");
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const getScrollOffset = () => {
    const topbarHeight = topbar
      ? Math.ceil(topbar.getBoundingClientRect().height)
      : 0;
    return topbarHeight + 12;
  };
  const syncScrollOffset = () => {
    document.documentElement.style.setProperty(
      "--scroll-offset",
      getScrollOffset() + "px",
    );
  };
  const getHashTarget = (hash) => {
    if (!hash || hash === "#") return null;
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (e) {
      return null;
    }
  };
  const scrollToHash = (hash, options = {}) => {
    const target = getHashTarget(hash);
    if (!target) return false;

    syncScrollOffset();
    const offset = getScrollOffset();
    const targetTop =
      hash === "#top"
        ? 0
        : Math.max(
            0,
            target.getBoundingClientRect().top + window.pageYOffset - offset,
          );
    const behavior = prefersReducedMotion()
      ? "auto"
      : options.behavior || "smooth";

    window.scrollTo({ top: targetTop, behavior });
    if (options.updateHash !== false && window.location.hash !== hash) {
      window.history.pushState(
        null,
        "",
        window.location.pathname + window.location.search + hash,
      );
    }
    return true;
  };

  syncScrollOffset();
  window.addEventListener("resize", syncScrollOffset);
  window.addEventListener("hashchange", () => {
    scrollToHash(window.location.hash, { behavior: "auto", updateHash: false });
  });
  window.addEventListener("load", () => {
    const correctHashScroll = () => {
      if (window.location.hash) {
        scrollToHash(window.location.hash, {
          behavior: "auto",
          updateHash: false,
        });
      }
    };
    window.requestAnimationFrame(correctHashScroll);
    window.setTimeout(correctHashScroll, 300);
  });

  let closeFloatingNav = () => {};

  // Floating nav menu — always visible on mobile (topbar nav is hidden there);
  // on larger screens, appears once "The Week" section reaches the top of the viewport.
  const navFab = document.querySelector("[data-nav-fab]");
  const navFabToggle = document.querySelector("[data-nav-fab-toggle]");
  const navFabMenu = document.getElementById("nav-fab-menu");
  const navFabTop = document.querySelector("[data-nav-fab-top]");
  const weekSection = document.getElementById("week");
  if (navFab && navFabToggle && navFabMenu && weekSection) {
    navFab.hidden = false;
    let visible = false;
    const openMenu = () => {
      navFabMenu.hidden = false;
      // force a reflow so the transition runs from the hidden→shown state
      void navFabMenu.offsetWidth;
      navFab.classList.add("is-open");
      navFabToggle.setAttribute("aria-expanded", "true");
      navFabToggle.setAttribute("aria-label", "Close menu");
    };
    const closeMenu = () => {
      if (!navFab.classList.contains("is-open")) return;
      navFab.classList.remove("is-open");
      navFabToggle.setAttribute("aria-expanded", "false");
      navFabToggle.setAttribute("aria-label", "Open menu");
      // hide after the transition so it's removed from the a11y tree
      window.setTimeout(() => {
        if (!navFab.classList.contains("is-open")) navFabMenu.hidden = true;
      }, 200);
    };
    closeFloatingNav = closeMenu;
    const toggleMenu = () => {
      if (navFab.classList.contains("is-open")) closeMenu();
      else openMenu();
    };
    const setVisible = (v) => {
      if (v === visible) return;
      visible = v;
      navFab.classList.toggle("is-visible", v);
      if (!v) closeMenu();
    };

    const mobileMq = window.matchMedia("(max-width: 760px)");

    if ("IntersectionObserver" in window) {
      const sentinel = document.createElement("span");
      sentinel.setAttribute("aria-hidden", "true");
      sentinel.style.cssText =
        "display:block;width:1px;height:1px;pointer-events:none;";
      weekSection.before(sentinel);

      let lastEntry = null;
      const evaluate = () => {
        if (mobileMq.matches) {
          setVisible(true);
          return;
        }
        if (!lastEntry) return;
        setVisible(
          !lastEntry.isIntersecting && lastEntry.boundingClientRect.top < 0,
        );
      };

      const observer = new IntersectionObserver(([entry]) => {
        lastEntry = entry;
        evaluate();
      });
      observer.observe(sentinel);

      if (mobileMq.addEventListener)
        mobileMq.addEventListener("change", evaluate);
      else if (mobileMq.addListener) mobileMq.addListener(evaluate);
      evaluate();
    } else {
      const onScroll = () => {
        if (mobileMq.matches) {
          setVisible(true);
          return;
        }
        setVisible(weekSection.getBoundingClientRect().top <= 0);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

    navFabToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });
    navFabMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closeMenu());
    });
    if (navFabTop) {
      navFabTop.addEventListener("click", () => {
        scrollToHash("#top", { updateHash: false });
        closeMenu();
      });
    }
    document.addEventListener("click", (e) => {
      if (!navFab.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  document
    .querySelectorAll('a[href^="#"]:not(.skip-link)')
    .forEach((anchor) => {
      const hash = anchor.getAttribute("href");
      if (!getHashTarget(hash)) return;

      anchor.addEventListener("click", (e) => {
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }

        e.preventDefault();
        scrollToHash(hash);
        closeFloatingNav();
      });
    });
})();
