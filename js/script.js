document.addEventListener("DOMContentLoaded", () => {
  /*
  |--------------------------------------------------------------------------
  | DOM REFERENCES
  |--------------------------------------------------------------------------
  */

  const root = document.documentElement;

  const themeToggleButtons = document.querySelectorAll("[data-theme-toggle]");

  const mobileMenu = document.getElementById("mobileMenu");

  const menuOpenButton = document.getElementById("menuOpen");

  const menuCloseButton = document.getElementById("menuClose");

  const navigationLinks = document.querySelectorAll(
    ".nav a, .sidebar a, .mobile-menu a",
  );

  const sections = document.querySelectorAll("section[id], footer[id]");

  /*
  |--------------------------------------------------------------------------
  | THEME
  |--------------------------------------------------------------------------
  */

  const THEME_KEY = "portfolio-theme";

  const THEMES = {
    LIGHT: "light",
    DARK: "dark",
  };

  function getInitialTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === THEMES.LIGHT || savedTheme === THEMES.DARK) {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? THEMES.DARK
      : THEMES.LIGHT;
  }

  function setTheme(theme) {
    root.dataset.theme = theme;

    localStorage.setItem(THEME_KEY, theme);

    themeToggleButtons.forEach((button) => {
      const isDark = theme === THEMES.DARK;

      button.setAttribute("aria-pressed", String(isDark));

      button.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode",
      );
    });
  }

  function toggleTheme() {
    const currentTheme = root.dataset.theme;

    const nextTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;

    setTheme(nextTheme);
  }

  setTheme(getInitialTheme());

  themeToggleButtons.forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });

  /*
  |--------------------------------------------------------------------------
  | MOBILE MENU
  |--------------------------------------------------------------------------
  */

  function openMobileMenu() {
    if (!mobileMenu) return;

    mobileMenu.classList.add("open");

    document.body.classList.add("menu-open");
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;

    mobileMenu.classList.remove("open");

    document.body.classList.remove("menu-open");
  }

  menuOpenButton?.addEventListener("click", openMobileMenu);

  menuCloseButton?.addEventListener("click", closeMobileMenu);

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu?.classList.contains("open")) {
      closeMobileMenu();
    }
  });

  /*
  |--------------------------------------------------------------------------
  | ACTIVE NAVIGATION
  |--------------------------------------------------------------------------
  */
  if (sections.length && navigationLinks.length) {
    let isProgrammaticScroll = false;

    let scrollTimeout;

    function setActiveLink(id) {
      navigationLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    }

    function updateActiveSection() {
      if (isProgrammaticScroll) return;

      /*
  |--------------------------------------------------------------------------
  | TOP OF PAGE
  |--------------------------------------------------------------------------
  */

      if (window.scrollY <= 10) {
        setActiveLink(sections[0].id);
        return;
      }

      /*
  |--------------------------------------------------------------------------
  | CURRENT SECTION
  |--------------------------------------------------------------------------
  */

      const scrollPosition = window.scrollY + 180;

      let currentSection = sections[0];

      sections.forEach((section) => {
        if (scrollPosition >= section.offsetTop) {
          currentSection = section;
        }
      });

      if (currentSection) {
        setActiveLink(currentSection.id);
      }
    }
    window.addEventListener("scroll", updateActiveSection, {
      passive: true,
    });

    navigationLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href || !href.startsWith("#")) {
          return;
        }

        const target = document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        const targetId = target.id;

        setActiveLink(targetId);

        isProgrammaticScroll = true;

        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(() => {
          isProgrammaticScroll = false;

          setActiveLink(targetId);
        }, 700);
      });
    });

    updateActiveSection();
  }
});
