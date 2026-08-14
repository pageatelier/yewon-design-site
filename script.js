/* =========================================================
   YEWON INTERIOR — unified interactions
========================================================= */

/* MOBILE MENU */
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#mobile-menu");
const menuClose = document.querySelector(".menu-close");

function setMenu(open){
  if(!menu || !menuToggle) return;
  menu.classList.toggle("is-open", open);
  menu.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
}

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

menuClose?.addEventListener("click", () => setMenu(false));
menu?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", e => {
  if(e.key === "Escape") setMenu(false);
});


/* REVEAL */
const revealItems = document.querySelectorAll(".reveal");

if("IntersectionObserver" in window){
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:.1});

  revealItems.forEach(el => revealObserver.observe(el));
}else{
  revealItems.forEach(el => el.classList.add("is-visible"));
}


/* HERO VIDEO ROTATION */
const desktopSlider = document.querySelector(".hero-slider-desktop");
const mobileSlider = document.querySelector(".hero-slider-mobile");
const currentEl = document.querySelector(".hero-current");
let cleanupHero = null;

function isMobile(){
  return window.matchMedia("(max-width:820px)").matches;
}

function initHero(){
  if(cleanupHero) cleanupHero();

  const activeSlider = isMobile() ? mobileSlider : desktopSlider;
  const inactiveSlider = isMobile() ? desktopSlider : mobileSlider;
  if(!activeSlider) return;

  inactiveSlider?.querySelectorAll("video").forEach(video => {
    video.pause();
    video.currentTime = 0;
    video.classList.remove("is-active");
  });

  const videos = [...activeSlider.querySelectorAll("video")];
  let index = 0;

  function show(next){
    index = (next + videos.length) % videos.length;

    videos.forEach((video, i) => {
      const active = i === index;
      video.classList.toggle("is-active", active);
      if(!active){
        video.pause();
        video.currentTime = 0;
      }
    });

    if(currentEl){
      currentEl.textContent = String(index + 1).padStart(2, "0");
    }

    const activeVideo = videos[index];
    activeVideo.currentTime = 0;
    activeVideo.play().catch(() => {});
  }

  function next(){
    show(index + 1);
  }

  videos.forEach(video => video.addEventListener("ended", next));
  show(0);

  cleanupHero = () => {
    videos.forEach(video => {
      video.pause();
      video.removeEventListener("ended", next);
    });
  };
}

initHero();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initHero, 180);
});


/* PROJECT SLIDERS */
document.querySelectorAll("[data-project-slider]").forEach((slider, sliderIndex) => {
  const slides = [...slider.querySelectorAll(".project-slide")];
  const dots = [...slider.querySelectorAll(".project-dots button")];
  const prev = slider.querySelector(".project-prev");
  const next = slider.querySelector(".project-next");

  if(slides.length < 2) return;

  let index = 0;
  let timer = null;
  let startX = 0;
  const interval = 4300 + sliderIndex * 350;

  function show(newIndex){
    index = (newIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  function stop(){
    if(timer){
      clearInterval(timer);
      timer = null;
    }
  }

  function start(){
    stop();
    timer = setInterval(() => show(index + 1), interval);
  }

  prev?.addEventListener("click", e => {
    e.stopPropagation();
    show(index - 1);
    start();
  });

  next?.addEventListener("click", e => {
    e.stopPropagation();
    show(index + 1);
    start();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", e => {
      e.stopPropagation();
      show(i);
      start();
    });
  });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  slider.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    stop();
  }, {passive:true});

  slider.addEventListener("touchend", e => {
    const delta = e.changedTouches[0].clientX - startX;
    if(Math.abs(delta) > 45){
      show(delta < 0 ? index + 1 : index - 1);
    }
    start();
  }, {passive:true});

  if("IntersectionObserver" in window){
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting) start();
        else stop();
      });
    }, {threshold:.15});

    observer.observe(slider);
  }else{
    start();
  }

  show(0);
});


/* TAB VISIBILITY */
document.addEventListener("visibilitychange", () => {
  const slider = isMobile() ? mobileSlider : desktopSlider;
  const activeVideo = slider?.querySelector(".hero-video.is-active");
  if(!activeVideo) return;

  if(document.hidden){
    activeVideo.pause();
  }else{
    activeVideo.play().catch(() => {});
  }
});
