# Cesar Francisco | Personal Portfolio
A responsive personal portfolio for **Cesar Francisco** (Software Engineer) built with HTML, CSS, Bootstrap 5, and vanilla JavaScript (no jQuery). It showcases his professional journey, skills, projects, and certificates.

## Features
- **Responsive sticky navbar** — collapsible on mobile, with a built-in light/night theme switch
- **Light / Night theme** — toggle with a soft page crossfade, press ripple, and `localStorage` persistence
- **Hero section** — animated typewriter intro, "Download CV", GitHub, and social links
- **About section** — info cards describing background, a personal touch, and professional profile
- **Professional skills roadmap** — a timeline of core skills with the experience behind each one
- **Technology stacks grid** — cards for the tools and frameworks used throughout the journey
- **Projects & mini projects** — shows "full" projects plus smaller experiments, each with a live demo or repository link
- **Certificate carousel** — 29 certificates with clickable thumbnails, auto-play, and keyboard/touch navigation
- **Contact section** — a demo contact form plus GitHub, LinkedIn, and email links
- **Back-to-top button** — appears on scroll
- **Accessibility** — keyboard navigation, ARIA labels, and `prefers-reduced-motion` support

## Technologies
- HTML5, CSS3
- Bootstrap 5.3 (CSS + JS bundle)
- Font Awesome 5
- Vanilla JavaScript (no jQuery)

## Sections
1. Hero / About
2. About info cards
3. Professional Skills (roadmap timeline)
4. Technology Stacks
5. Projects (full) + Mini Projects
6. Certificates
7. Contact

## Project structure
```
portfolio/
├── index.html
└── assets/
    ├── css/
    │   └── style.css
    ├── images/
    │   ├── certificates/      # certificate carousel slides & thumbnails (29)
    │   ├── profile_picture/   # profile photos (light & night variants)
    │   ├── projects/          # project screenshots
    │   ├── skills/            # technology stack icons
    │   └── logo.png           # site icon
    └── js/
        └── script.js          # theme, typewriter, carousel, tooltips, navbar, back-to-top
```

## JavaScript features (`assets/js/script.js`)
- Light/night theme switch with `localStorage` persistence
- Typewriter effect in the hero intro
- Certificate carousel with auto-play and synced clickable thumbnails
- Project tooltips
- Active-section highlighting & navbar UX
- Back-to-top button that appears on scroll
- Auto-updating footer year

## Running locally
No build step, dependencies, or server required — it's a static site. Just open `index.html` directly in your browser.

## Note
- The contact form is a **demo only** — it is not configure yet and need a connection to a backend or form service before expecting submissions.