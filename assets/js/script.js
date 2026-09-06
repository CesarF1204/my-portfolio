/* ==========================================================================
    Cesar Francisco | Portfolio — main scripts
    Vanilla JavaScript only (no jQuery). Runs after the DOM is ready.
    Handles: typewriter, certificate carousel + thumbnails, project tooltips,
    navbar UX, and active-section highlighting.
    ========================================================================== */

(function () {
    "use strict";

    /* ---------------------------- Theme switch --------------------------- */
    function initThemeSwitch() {
        let themeStorageKey = "portfolio-theme";
        let button = document.querySelector(".theme-switch");
        let profileImage = document.querySelector(".profile-image");
        if (!button) return;

        let reduceMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

        // Soft full-page wash that helps light/night colors crossfade together.
        function runThemeFade(isLight) {
            if (reduceMotionMq.matches) return;
            let overlay = document.createElement("div");
            overlay.className = "theme-fade";
            overlay.style.setProperty(
                "--theme-fade-color",
                isLight ? "rgba(249, 250, 251, 0.6)" : "rgba(11, 17, 32, 0.6)"
            );
            document.body.appendChild(overlay);
            overlay.addEventListener("animationend", function () {
                overlay.remove();
            }, { once: true });
        }

        // Small expanding glow that confirms the press on the switch itself.
        function runSwitchRipple() {
            if (reduceMotionMq.matches || !button.animate) return;
            button.animate(
                [
                    { boxShadow: "0 0 0 0 rgba(125, 211, 252, 0.45)" },
                    { boxShadow: "0 0 0 18px rgba(125, 211, 252, 0)" }
                ],
                { duration: 520, easing: "ease-out" }
            );
        }

        function updateTheme(theme) {
            let isLight = theme === "light";
            document.documentElement.setAttribute("data-theme", isLight ? "light" : "night");
            if (profileImage) {
                profileImage.src = profileImage.getAttribute(isLight ? "data-light-src" : "data-night-src");
            }
            button.setAttribute("aria-pressed", String(isLight));
            button.setAttribute("aria-label", isLight ? "Switch to night mode" : "Switch to light mode");
            localStorage.setItem(themeStorageKey, isLight ? "light" : "night");
        }

        updateTheme(document.documentElement.getAttribute("data-theme") || "light");

        button.addEventListener("click", function () {
            let currentTheme = document.documentElement.getAttribute("data-theme");
            let isLight = currentTheme === "light";
            runThemeFade(!isLight);
            runSwitchRipple();
            updateTheme(isLight ? "night" : "light");
        });
    }

    /* --------------------------- Typewriter ------------------------------ */
    // Original classic TypeWriter: types into a nested <span class="txt">.
    function TypeWriter(element, words, wait) {
        this.element = element;
        this.words = words;
        this.wait = parseInt(wait, 10) || 1000;
        this.wordIndex = 0;
        this.text = "";
        this.isDeleting = false;
        this.type();
    }

    TypeWriter.prototype.type = function () {
        let current = this.words[this.wordIndex % this.words.length];

        this.text = this.isDeleting
            ? current.substring(0, this.text.length - 1)
            : current.substring(0, this.text.length + 1);

        this.element.innerHTML = '<span class="txt">' + this.text + '</span>';

        let speed = 100;
        if (this.isDeleting) {
            speed = speed / 2; // deleting is faster
        }

        if (!this.isDeleting && this.text === current) {
            // Whole word typed: pause, then delete it.
            speed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.text === "") {
            // Fully deleted: move on to the next word.
            this.isDeleting = false;
            this.wordIndex++;
            speed = 500;
        }

        let self = this;
        window.setTimeout(function () {
            self.type();
        }, speed);
    };

    function initTypewriter() {
        let el = document.querySelector(".txt-type");
        if (!el) return;

        let words = [];
        try {
            words = JSON.parse(el.getAttribute("data-words"));
        } catch (e) {
            words = ["a Creator"];
        }

        new TypeWriter(el, words, el.getAttribute("data-wait"));
    }

    /* ----------------------- Certificate carousel ------------------------ */
    // The carousel is intentionally initialized here (instead of via
    // data-bs-ride) so that our full configuration — especially wrap=true
    // and pause=false — is applied. Bootstrap's auto-init from data-bs-ride
    // would read data-bs-* attributes and ignore this JS config, which could
    // leave the slideshow pausing on hover or stopping on the last slide.
    //
    // Behavior:
    //   interval: 1500  -> advance every 1.5 second
    //   wrap: true      -> last certificate loops back to the first
    //   pause: false    -> never pause the automatic slideshow (even on hover)
    //   keyboard: true  -> Left/Right arrow keys step through certificates
    //   touch: true     -> swipe support on touch devices
    function initCertificateCarousel() {
        let el = document.getElementById("myCarousel");
        if (!el || !window.bootstrap || !window.bootstrap.Carousel) return;

        let carousel = window.bootstrap.Carousel.getOrCreateInstance(el, {
            interval: 1500,
            wrap: true,
            pause: false,
            keyboard: true,
            touch: true
        });

        // Guarantee the slideshow is running. Some Bootstrap builds only
        // auto-start when data-bs-ride="carousel" is present, so we cycle
        // explicitly and also re-trigger after any slide transition to keep
        // the interval alive indefinitely (last -> first included).
        carousel.cycle();

        // --- Thumbnail pagination (6 per page) ---
        let thumbnailsPerPage = 6;
        let thumbnails = Array.prototype.slice.call(
            document.querySelectorAll(".cert-indicators [data-bs-target]")
        );
        let totalPages = Math.ceil(thumbnails.length / thumbnailsPerPage);
        let currentPage = 0;

        function showThumbnailPage(page) {
            thumbnails.forEach(function (thumb, index) {
                let start = page * thumbnailsPerPage;
                let end = start + thumbnailsPerPage;
                if (index >= start && index < end) {
                    thumb.classList.remove("thumbnail-hidden");
                } else {
                    thumb.classList.add("thumbnail-hidden");
                }
            });
            currentPage = page;
        }

        // Show the first page of thumbnails initially.
        showThumbnailPage(0);

        el.addEventListener("slid.bs.carousel", function (event) {
            // Keep the auto-advance alive after every manual or auto transition.
            // Calling cycle() is safe even while already cycling.
            carousel.cycle();

            // Switch thumbnail page when the active certificate moves outside
            // the current group of six (e.g. 6 -> 7 changes page 0 -> 1,
            // and 7 -> 6 changes page 1 -> 0).
            if (event.to !== undefined) {
                let newPage = Math.floor(event.to / thumbnailsPerPage);
                if (newPage !== currentPage && newPage < totalPages) {
                    showThumbnailPage(newPage);
                }

                // Explicitly synchronize the active thumbnail
                // with the currently displayed certificate.
                thumbnails.forEach(function (thumb, index) {
                    if (index === event.to) {
                        thumb.classList.add('active');
                        thumb.setAttribute('aria-current', 'true');
                    } else {
                        thumb.classList.remove('active');
                        thumb.removeAttribute('aria-current');
                    }
                });
            }
        });
    }
    /* --------------------------- Project tooltip ------------------------- */
    let tooltip = null;

    function getTooltip() {
        if (!tooltip) {
            tooltip = document.createElement("div");
            tooltip.className = "tooltip-box";
            tooltip.setAttribute("role", "tooltip");
            document.body.appendChild(tooltip);
        }
        return tooltip;
    }

    function showTooltip(target) {
        let title = target.getAttribute("data-original-title") || target.getAttribute("title") || "";
        if (!title) return;

        let box = getTooltip();
        box.textContent = title;
        box.classList.add("show");

        let rect = target.getBoundingClientRect();
        let boxW = box.offsetWidth || 260;
        let top = rect.top - box.offsetHeight - 10;
        let left = rect.left + (rect.width - boxW) / 2;

        if (top < 8) top = rect.bottom + 10; // flip below when there is no room above
        left = Math.max(8, Math.min(left, window.innerWidth - boxW - 8));

        box.style.top = top + "px";
        box.style.left = left + "px";

        window.clearTimeout(showTooltip._hideTimer);
        showTooltip._hideTimer = window.setTimeout(function () {
            box.classList.remove("show");
        }, 2500);
    }

    function hideTooltip() {
        let box = getTooltip();
        box.classList.remove("show");
        window.clearTimeout(showTooltip._hideTimer);
    }

    function initTooltips() {
        document.querySelectorAll("[data-original-title]").forEach(function (tile) {
            tile.addEventListener("mouseenter", function () { showTooltip(tile); });
            tile.addEventListener("mouseleave", hideTooltip);
            tile.addEventListener("focusin", function () { showTooltip(tile); });
            tile.addEventListener("focusout", hideTooltip);
        });

        window.addEventListener("scroll", hideTooltip, { passive: true });
        window.addEventListener("resize", hideTooltip);
    }

    /* ------------------------- Navbar mobile close ------------------------ */
    function initNavbar() {
        let nav = document.getElementById("mainNav");
        if (!nav) return;

        nav.querySelectorAll(".nav-link").forEach(function (link) {
            link.addEventListener("click", function () {
                if (window.bootstrap && nav.classList.contains("show")) {
                    bootstrap.Collapse.getOrCreateInstance(nav).hide();
                }
            });
        });
    }

    /* -------------------------- Back to top ----------------------------- */
    function initBackToTop() {
        let button = document.querySelector(".back-to-top");
        if (!button) return;

        function updateVisibility() {
            button.classList.toggle("show", window.scrollY > 300);
        }

        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.addEventListener("scroll", updateVisibility, { passive: true });
        updateVisibility();
    }

    document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(
        '.site-navbar .nav-link[href^="#"]'
    );

    const sections = document.querySelectorAll("section[id]");

    if (!navLinks.length || !sections.length) return;

    function setActiveLink(id) {
        navLinks.forEach((link) => {
            const targetId = link.getAttribute("href").replace("#", "");

            if (targetId === id) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            } else {
                link.classList.remove("active");
                link.removeAttribute("aria-current");
            }
        });
    }

    let pendingSectionId = null;

    // Activate the clicked link immediately and protect it during smooth scroll.
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            const id = link.getAttribute("href").replace("#", "");

            pendingSectionId = id;
            setActiveLink(id);
        });
    });

    // Use document position instead of intersection ratio so the last section
    // remains active when scrolling reaches the bottom of the page.
    function updateActiveSection() {
        const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
        const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        const isAtPageBottom = window.scrollY >= pageHeight - window.innerHeight - 1;

        if (pendingSectionId) {
            const pendingSection = document.getElementById(pendingSectionId);

            const pendingSectionIndex = Array.from(sections).indexOf(pendingSection);
            const isLastSection = pendingSectionIndex === sections.length - 1;
            const hasReachedHeader = pendingSection &&
                Math.abs(pendingSection.getBoundingClientRect().top - headerHeight) <= 2;

            if (pendingSection && !hasReachedHeader && !(isLastSection && isAtPageBottom)) {
                return;
            }

            pendingSectionId = null;
        }

        if (isAtPageBottom) {
            setActiveLink(sections[sections.length - 1].id);
            return;
        }

        const currentSection = Array.from(sections)
            .filter((section) => section.getBoundingClientRect().top <= headerHeight + 1)
            .pop();

        if (currentSection) setActiveLink(currentSection.id);
    }

    let scrollFrame = null;
    function scheduleActiveSectionUpdate() {
        if (scrollFrame !== null) return;

        scrollFrame = window.requestAnimationFrame(() => {
            updateActiveSection();
            scrollFrame = null;
        });
    }

    window.addEventListener("scroll", scheduleActiveSectionUpdate, { passive: true });
    window.addEventListener("resize", scheduleActiveSectionUpdate);
    window.addEventListener("wheel", () => {
        pendingSectionId = null;
    }, { passive: true });
    window.addEventListener("touchstart", () => {
        pendingSectionId = null;
    }, { passive: true });
    updateActiveSection();

    // Set initial active link
    const currentHash = window.location.hash.replace("#", "");
        if (currentHash) setActiveLink(currentHash);
    });

    /* ----------------------- Copyright year ---------------------- */
    function updateCopyrightYear() {
        // Display the current calendar year in the footer
        let now = new Date();
        let el = document.getElementById("current-year");
        if (el) el.textContent = now.getFullYear();
    }

    /* ----------------------- Work experience years ---------------------- */
    function updateWorkYears() {
        // Calculate completed years since September 27, 2021
        let startDate = new Date(2021, 8, 27); // September 27, 2021
        let now = new Date();
        let years = now.getFullYear() - startDate.getFullYear();

        // Subtract one year if the anniversary hasn't occurred yet this year
        if (
            now.getMonth() < startDate.getMonth() ||
            (now.getMonth() === startDate.getMonth() && now.getDate() < startDate.getDate())
        ) {
            years--;
        }

        let el = document.getElementById("work-year");
        if (el) el.textContent = years;
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    /* ------------------------------ Boot --------------------------------- */
    function init() {
        initThemeSwitch();
        initTypewriter();
        initCertificateCarousel();
        initTooltips();
        initNavbar();
        initBackToTop();
        updateCopyrightYear();
        updateWorkYears();
    }
})();