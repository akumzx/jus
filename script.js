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
})();