// Slow, eased scrolling for in-page links (nav, hero buttons)
(function () {
  // Duration in milliseconds. Bigger number = slower scroll.
  var MIN_DURATION = 900;
  var MAX_DURATION = 1800;

  // Set to false if you want the slow scroll even when your
  // computer has "reduce motion" turned on.
  var RESPECT_REDUCED_MOTION = true;

  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  var frame = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function stop() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  function scrollToY(targetY) {
    var startY = window.scrollY;
    var distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    // Longer trips take longer, within the min/max limits
    var duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.abs(distance) * 0.6));
    var startTime = null;

    stop();

    function step(now) {
      if (startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      frame = progress < 1 ? requestAnimationFrame(step) : null;
    }

    frame = requestAnimationFrame(step);
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) return;

    var hash = link.getAttribute("href");
    if (hash.length < 2) return; // ignore placeholder "#" links

    var target = document.querySelector(hash);
    if (!target) return;

    if (RESPECT_REDUCED_MOTION && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // let the browser jump normally
    }

    event.preventDefault();

    // Stop CSS smooth scrolling from fighting the script
    root.style.scrollBehavior = "auto";

    var offset = header ? header.offsetHeight : 0;
    var y = target.getBoundingClientRect().top + window.scrollY - offset;
    scrollToY(Math.max(0, y));

    history.pushState(null, "", hash);
  });

  // If you grab the page while it is scrolling, stop and give control back
  ["wheel", "touchstart", "keydown"].forEach(function (name) {
    window.addEventListener(name, stop, { passive: true });
  });





document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bg-music");
  const toggle = document.getElementById("music-toggle");
  const status = document.getElementById("music-status");
  const progress = document.getElementById("music-progress");
  const currentTime = document.getElementById("music-current-time");
  const duration = document.getElementById("music-duration");
  const volume = document.getElementById("music-volume");

  if (!audio || !toggle) return;

  audio.volume = 0.5;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  const updatePlayer = () => {
    const playing = !audio.paused;

    toggle.textContent = playing ? "Ⅱ" : "▶";
    toggle.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    toggle.setAttribute("aria-pressed", String(playing));

    if (status) {
      status.textContent = playing ? "NOW PLAYING" : "PAUSED";
    }
  };

  toggle.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        if (status) status.textContent = "PLAYBACK UNAVAILABLE";
        console.error("Unable to play music:", error);
      }
    } else {
      audio.pause();
    }

    updatePlayer();
  });

  audio.addEventListener("timeupdate", () => {
    if (progress && Number.isFinite(audio.duration) && audio.duration > 0) {
      progress.value = (audio.currentTime / audio.duration) * 100;
    }

    if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", () => {
    if (duration) duration.textContent = formatTime(audio.duration);
  });

  if (progress) {
    progress.addEventListener("input", () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = (Number(progress.value) / 100) * audio.duration;
      }
    });
  }

  if (volume) {
    volume.addEventListener("input", () => {
      audio.volume = Number(volume.value);
    });
  }

  audio.addEventListener("play", updatePlayer);
  audio.addEventListener("pause", updatePlayer);
  audio.addEventListener("error", () => {
    if (status) status.textContent = "AUDIO FILE NOT FOUND";
  });

  updatePlayer();
});

/* ==========================================================
   DRAG MUSIC PLAYER
   Drag using the player header, on desktop or mobile.
   ========================================================== */
(() => {
  const player = document.querySelector(".music-player");
  const handle = player?.querySelector(".music-player__header");

  if (!player || !handle) return;

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;

  handle.addEventListener("pointerdown", (event) => {
    // Only drag with the primary mouse button.
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const rect = player.getBoundingClientRect();

    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    originX = rect.left;
    originY = rect.top;

    // Switch from right/bottom positioning to left/top.
    player.style.left = `${rect.left}px`;
    player.style.top = `${rect.top}px`;
    player.style.right = "auto";
    player.style.bottom = "auto";

    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  handle.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const maxX = window.innerWidth - player.offsetWidth;
    const maxY = window.innerHeight - player.offsetHeight;

    const x = Math.max(
      0,
      Math.min(maxX, originX + event.clientX - startX)
    );

    const y = Math.max(
      0,
      Math.min(maxY, originY + event.clientY - startY)
    );

    player.style.left = `${x}px`;
    player.style.top = `${y}px`;
  });

  const stopDragging = () => {
    dragging = false;
  };

  handle.addEventListener("pointerup", stopDragging);
  handle.addEventListener("pointercancel", stopDragging);

  window.addEventListener("resize", () => {
    if (!player.style.left || !player.style.top) return;

    const rect = player.getBoundingClientRect();

    player.style.left = `${Math.max(
      0,
      Math.min(window.innerWidth - player.offsetWidth, rect.left)
    )}px`;

    player.style.top = `${Math.max(
      0,
      Math.min(window.innerHeight - player.offsetHeight, rect.top)
    )}px`;
  });
})();
/* ==========================================================
   PASTE AT THE VERY BOTTOM OF script.js (after the last "})();")
   - Resize handle (drag, touch, or arrow keys)
   - Minimize button
   - Remembers size / collapsed state
   - Back-to-top button (your CSS already styles it)
   ========================================================== */
(() => {
  const player = document.querySelector(".music-player");
  const header = player?.querySelector(".music-player__header");
  if (!player || !header) return;

  const BASE = 220;       // width where --ps = 1
  const MIN = 150;
  const MAX = 360;
  const KEY = "jj-player";

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ---------- saved state ---------- */
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        width: parseFloat(player.style.width) || BASE,
        collapsed: player.classList.contains("is-collapsed"),
      }));
    } catch (e) {}
  };

  /* ---------- sizing ---------- */
  const setWidth = (w) => {
    const max = Math.max(MIN, Math.min(MAX, window.innerWidth - 24));
    w = clamp(w, MIN, max);
    player.style.width = `${w}px`;
    player.style.setProperty("--ps", (w / BASE).toFixed(3));
    return w;
  };

  // Keep the whole player on screen (after resizing, rotating, etc.)
  const fitInViewport = () => {
    if (!player.style.left || !player.style.top) return; // still anchored right/bottom
    const r = player.getBoundingClientRect();
    player.style.left = `${clamp(r.left, 0, Math.max(0, window.innerWidth - r.width))}px`;
    player.style.top = `${clamp(r.top, 0, Math.max(0, window.innerHeight - r.height))}px`;
  };

  // Switch from right/bottom anchoring to left/top (same trick the drag code uses)
  const anchorTopLeft = () => {
    const r = player.getBoundingClientRect();
    player.style.left = `${r.left}px`;
    player.style.top = `${r.top}px`;
    player.style.right = "auto";
    player.style.bottom = "auto";
    return r;
  };

  /* ---------- resize handle ---------- */
  const grip = document.createElement("div");
  grip.className = "music-player__resize";
  grip.tabIndex = 0;
  grip.setAttribute("role", "slider");
  grip.setAttribute("aria-label", "Resize music player");
  grip.setAttribute("aria-valuemin", MIN);
  grip.setAttribute("aria-valuemax", MAX);
  player.appendChild(grip);

  const syncAria = () =>
    grip.setAttribute("aria-valuenow", Math.round(player.getBoundingClientRect().width));

  let resizing = false;
  let startX = 0;
  let startW = 0;
  let left = 0;

  grip.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const r = anchorTopLeft();
    resizing = true;
    startX = e.clientX;
    startW = r.width;
    left = r.left;
    grip.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  });

  grip.addEventListener("pointermove", (e) => {
    if (!resizing) return;
    // Don't grow past the right edge of the screen
    const room = window.innerWidth - left;
    setWidth(Math.min(startW + (e.clientX - startX), room));
    fitInViewport();
    syncAria();
  });

  const endResize = () => {
    if (!resizing) return;
    resizing = false;
    save();
  };
  grip.addEventListener("pointerup", endResize);
  grip.addEventListener("pointercancel", endResize);

  // Keyboard: arrow keys resize, Home resets
  grip.addEventListener("keydown", (e) => {
    const w = player.getBoundingClientRect().width;
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = w + 10;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = w - 10;
    if (e.key === "Home") next = BASE;
    if (next === null) return;
    e.preventDefault();
    anchorTopLeft();
    setWidth(next);
    fitInViewport();
    syncAria();
    save();
  });

  /* ---------- minimize button ---------- */
  const minBtn = document.createElement("button");
  minBtn.type = "button";
  minBtn.className = "music-player__min";
  header.appendChild(minBtn);

  // Stop the header's drag handler from swallowing the click
  minBtn.addEventListener("pointerdown", (e) => e.stopPropagation());

  const setCollapsed = (collapsed) => {
    player.classList.toggle("is-collapsed", collapsed);
    minBtn.textContent = collapsed ? "+" : "–";
    minBtn.setAttribute("aria-label", collapsed ? "Expand music player" : "Minimize music player");
    minBtn.setAttribute("aria-expanded", String(!collapsed));
    grip.style.display = collapsed ? "none" : "";
    fitInViewport();
    save();
  };

  minBtn.addEventListener("click", () => setCollapsed(!player.classList.contains("is-collapsed")));

  /* ---------- initial state ---------- */
  setWidth(Number(saved.width) || (window.innerWidth <= 600 ? 190 : BASE));

  // On phones, start minimized the first time so it doesn't cover content
  const startCollapsed = saved.collapsed ?? window.innerWidth <= 600;
  setCollapsed(Boolean(startCollapsed));
  syncAria();

  window.addEventListener("resize", () => {
    setWidth(parseFloat(player.style.width) || BASE);
    fitInViewport();
    syncAria();
  });
})();

/* ==========================================================
   BACK TO TOP BUTTON
   (.back-to-top is already styled in your CSS but nothing
   was creating it.)
   ========================================================== */
(() => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "back-to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.textContent = "\u2191";
  document.body.appendChild(btn);

  const toggle = () => btn.classList.toggle("is-visible", window.scrollY > 600);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();

  btn.addEventListener("click", () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
})();
})();