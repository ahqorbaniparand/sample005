(function () {
  const track = document.getElementById("carouselTrack");
  const dotsContainer = document.getElementById("dotsContainer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  const slides = Array.from(track.children);
  const totalSlides = slides.length;

  let currentIndex = 0;
  let visibleSlides = 3;
  const gap = 24;

  function getVisibleSlides() {
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 992) return 2;
    return 3;
  }

  // این تابع هر بار که صدا زده می‌شود، عرض واقعی را محاسبه می‌کند
  function getSlideWidth() {
    const containerWidth = track.parentElement.getBoundingClientRect().width;
    const visible = getVisibleSlides();
    visibleSlides = visible;
    const gapsCount = visible - 1;
    const totalGap = gapsCount * gap;
    let width = (containerWidth - totalGap) / visible;

    // اگر به هر دلیل width صفر یا نامعتبر شد، از عرض اولین کارت استفاده کن
    if (!width || width <= 0 || isNaN(width)) {
      const firstCard = slides[0];
      if (firstCard) {
        width = firstCard.getBoundingClientRect().width + gap;
      } else {
        width = 300;
      }
    }
    return width;
  }

  function applyTransform() {
    const slideWidth = getSlideWidth(); // هر بار از DOM می‌خوانیم
    const offset = currentIndex * (slideWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
  }

  function updateSlideStyles() {
    const slideWidth = getSlideWidth();
    slides.forEach((card) => {
      card.style.flex = `0 0 ${slideWidth}px`;
    });
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    const totalDots = Math.max(1, totalSlides - visibleSlides + 1);
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.className = "dot" + (i === currentIndex ? " active" : "");
      dot.dataset.index = i;
      dot.addEventListener("click", function () {
        goTo(parseInt(this.dataset.index));
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsContainer.children;
    const totalDots = dots.length;
    if (currentIndex >= totalDots) {
      currentIndex = totalDots - 1;
    }
    for (let i = 0; i < totalDots; i++) {
      dots[i].classList.toggle("active", i === currentIndex);
    }
  }

  function goTo(index) {
    const visible = getVisibleSlides();
    visibleSlides = visible;
    const maxIndex = Math.max(0, totalSlides - visibleSlides);
    if (index < 0) index = 0;
    if (index > maxIndex) index = maxIndex;
    currentIndex = index;

    // ترتیب اجرا: اول استایل کارت‌ها، بعد حرکت، بعد دات‌ها
    updateSlideStyles();
    applyTransform();
    updateDots();
  }

  function next() {
    const maxIndex = Math.max(0, totalSlides - visibleSlides);
    if (currentIndex < maxIndex) {
      goTo(currentIndex + 1);
    } else {
      goTo(0);
    }
  }

  function prev() {
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    } else {
      const maxIndex = Math.max(0, totalSlides - visibleSlides);
      goTo(maxIndex);
    }
  }

  let resizeTimeout = null;

  function handleResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newVisible = getVisibleSlides();
      if (visibleSlides !== newVisible) {
        visibleSlides = newVisible;
        buildDots();
      }
      goTo(currentIndex);
      resizeTimeout = null;
    }, 150);
  }

  function init() {
    visibleSlides = getVisibleSlides();
    updateSlideStyles();
    buildDots();
    goTo(0); // حرکت به اولین اسلاید با عرض واقعی

    // اطمینان از بارگذاری کامل تصاویر
    setTimeout(() => {
      goTo(currentIndex);
    }, 200);

    // اطمینان از بارگذاری کامل فونت‌ها و استایل‌ها
    window.addEventListener("load", function () {
      goTo(currentIndex);
    });

    prevBtn.addEventListener("click", function (e) {
      e.preventDefault();
      prev();
    });
    nextBtn.addEventListener("click", function (e) {
      e.preventDefault();
      next();
    });

    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
