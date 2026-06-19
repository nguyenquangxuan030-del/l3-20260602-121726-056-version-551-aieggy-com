import { H as Hls } from "./hls-dru42stk.js";

const root = document.body.dataset.root || ".";
const joinUrl = (path) => `${root}/${path}`.replace(/\/\.\//g, "/").replace(/\/+/g, "/").replace(/^\.\//, "");

function setupMobileMenu() {
  const button = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    nav.classList.toggle("open");
    button.classList.toggle("open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  if (!slides.length) return;
  let index = 0;
  let timer = null;
  const show = (target) => {
    index = (target + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === index));
    dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
  };
  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5600);
  };
  const stop = () => {
    if (timer) window.clearInterval(timer);
  };
  prev?.addEventListener("click", () => {
    show(index - 1);
    start();
  });
  next?.addEventListener("click", () => {
    show(index + 1);
    start();
  });
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      show(dotIndex);
      start();
    });
  });
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function setupSearch() {
  const input = document.querySelector("[data-search-input]");
  const panel = document.querySelector("[data-search-results]");
  if (!input || !panel || !Array.isArray(window.movieSearchIndex)) return;
  const render = (items) => {
    if (!items.length) {
      panel.innerHTML = '<div class="search-empty">未找到相关影片</div>';
      panel.classList.add("open");
      return;
    }
    panel.innerHTML = items.map((item) => {
      const href = joinUrl(item.url);
      const meta = [item.year, item.region, item.genre].filter(Boolean).join(" · ");
      return `<a href="${href}"><strong>${item.title}</strong><span>${meta}</span></a>`;
    }).join("");
    panel.classList.add("open");
  };
  input.addEventListener("input", () => {
    const value = input.value.trim().toLowerCase();
    if (!value) {
      panel.classList.remove("open");
      panel.innerHTML = "";
      return;
    }
    const results = window.movieSearchIndex.filter((item) => {
      return [item.title, item.year, item.region, item.genre, item.category].join(" ").toLowerCase().includes(value);
    }).slice(0, 12);
    render(results);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-search-box]")) {
      panel.classList.remove("open");
    }
  });
}

function setupPlayers() {
  document.querySelectorAll("[data-player]").forEach((video) => {
    const button = video.parentElement?.querySelector("[data-play-button]");
    const source = video.dataset.source;
    let loaded = false;
    const load = () => {
      if (!source) return;
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (Hls && Hls.isSupported()) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }
      video.controls = true;
      button?.classList.add("hidden");
      video.play().catch(() => {
        button?.classList.remove("hidden");
      });
    };
    button?.addEventListener("click", load);
    video.addEventListener("click", () => {
      if (!loaded) load();
    });
  });
}

setupMobileMenu();
setupHero();
setupSearch();
setupPlayers();
