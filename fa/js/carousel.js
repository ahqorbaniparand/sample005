(function() {
  // ===== گرفتن المان‌ها =====
  const track = document.getElementById("carouselTrack");
  const dotsContainer = document.getElementById("dotsContainer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // بررسی وجود المان‌ها
  if (!track || !dotsContainer || !prevBtn || !nextBtn) {
    console.warn("❌ عناصر کروسل پیدا نشدند!");
    return;
  }

  // ===== گرفتن کارت‌ها =====
  let slides = Array.from(track.children);
  let totalSlides = slides.length;

  if (totalSlides === 0) {
    console.warn("❌ هیچ کارتی در کروسل وجود ندارد!");
    return;
  }

  // ===== تشخیص راست‌چین =====
  const isRTL = document.documentElement.getAttribute("dir") === "rtl";

  // ===== متغیرها =====
  let currentIndex = 0;
  let visibleSlides = 3;
  const gap = 24; // هماهنگ با CSS
  let isAnimating = false;
  let timeoutId = null;

  // ===== تعداد اسلایدهای قابل مشاهده =====
  function getVisibleSlides() {
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 992) return 2;
    return 3;
  }

  // ===== محاسبه عرض هر کارت =====
  function getSlideWidth() {
    const containerWidth = track.parentElement.getBoundingClientRect().width;
    const visible = getVisibleSlides();
    visibleSlides = visible;
    const totalGap = (visible - 1) * gap;
    let width = (containerWidth - totalGap) / visible;
    if (!width || width <= 0 || isNaN(width)) {
      width = 300;
    }
    return width;
  }

  // ===== به‌روزرسانی استایل کارت‌ها =====
  function updateSlideStyles() {
    const slideWidth = getSlideWidth();
    slides.forEach((card) => {
      card.style.flex = `0 0 ${slideWidth}px`;
      card.style.minWidth = `${slideWidth}px`;
      card.style.maxWidth = `${slideWidth}px`;
    });
  }

  // ===== حرکت به اسلاید مورد نظر =====
  function applyTransform() {
    const slideWidth = getSlideWidth();
    const offset = currentIndex * (slideWidth + gap);
    // در RTL از مقدار مثبت استفاده می‌کنیم
    const translateValue = isRTL ? offset : -offset;
    track.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    track.style.transform = `translateX(${translateValue}px)`;
  }

  // ===== ساخت دات‌ها =====
  function buildDots() {
    dotsContainer.innerHTML = "";
    const totalDots = Math.max(1, totalSlides - visibleSlides + 1);
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.className = "dot" + (i === currentIndex ? " active" : "");
      dot.dataset.index = i;
      dot.setAttribute("aria-label", `رفتن به اسلاید ${i + 1}`);
      dot.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(this.dataset.index);
        goTo(index);
      });
      dotsContainer.appendChild(dot);
    }
  }

  // ===== به‌روزرسانی دات‌ها =====
  function updateDots() {
    const dots = dotsContainer.children;
    const totalDots = dots.length;

    const expectedDots = Math.max(1, totalSlides - visibleSlides + 1);
    if (totalDots !== expectedDots) {
      buildDots();
      return;
    }

    for (let i = 0; i < totalDots; i++) {
      if (i === currentIndex) {
        dots[i].classList.add("active");
      } else {
        dots[i].classList.remove("active");
      }
    }
  }

  // ===== حرکت به اسلاید =====
  function goTo(index) {
    if (isAnimating) return;

    const visible = getVisibleSlides();
    visibleSlides = visible;
    const maxIndex = Math.max(0, totalSlides - visibleSlides);

    if (index < 0) index = 0;
    if (index > maxIndex) index = maxIndex;

    if (index === currentIndex) return;

    isAnimating = true;
    currentIndex = index;

    updateSlideStyles();
    applyTransform();
    updateDots();

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      isAnimating = false;
      timeoutId = null;
    }, 550);
  }

  // ===== بعدی =====
  function next() {
    if (isAnimating) return;
    const maxIndex = Math.max(0, totalSlides - visibleSlides);
    if (currentIndex < maxIndex) {
      goTo(currentIndex + 1);
    } else {
      goTo(0);
    }
  }

  // ===== قبلی =====
  function prev() {
    if (isAnimating) return;
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    } else {
      const maxIndex = Math.max(0, totalSlides - visibleSlides);
      goTo(maxIndex);
    }
  }

  // ===== تغییر اندازه =====
  let resizeTimeout = null;
  function handleResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const newVisible = getVisibleSlides();
      if (visibleSlides !== newVisible) {
        visibleSlides = newVisible;
        buildDots();
      }
      updateSlideStyles();
      applyTransform();
      updateDots();
      resizeTimeout = null;
    }, 200);
  }

  // ===== راه‌اندازی =====
  function init() {
    track.style.display = "flex";
    track.style.flexWrap = "nowrap";
    track.style.width = "100%";

    visibleSlides = getVisibleSlides();
    updateSlideStyles();
    buildDots();

    setTimeout(() => {
      currentIndex = 0;
      applyTransform();
      updateDots();
    }, 100);

    // دکمه‌ها
    prevBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      prev();
    });

    nextBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      next();
    });

    window.addEventListener("resize", handleResize);

    // کیبورد (جهت‌ها در RTL برعکس)
    document.addEventListener("keydown", function(e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (isRTL) {
          if (e.key === "ArrowLeft") next();
          else prev();
        } else {
          if (e.key === "ArrowLeft") prev();
          else next();
        }
      }
    });

    // لمس (جهت‌ها در RTL برعکس)
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener("touchstart", function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener("touchend", function(e) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (isRTL) {
          if (diff > 0) prev();
          else next();
        } else {
          if (diff > 0) next();
          else prev();
        }
      }
    }, { passive: true });

    window.addEventListener("load", function() {
      setTimeout(() => {
        updateSlideStyles();
        applyTransform();
        updateDots();
      }, 300);
    });

    console.log("✅ کروسل با موفقیت راه‌اندازی شد!");
  }

  // ===== اجرا =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();