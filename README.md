# evil-martians-login-form
Title & Pitch: “Evil Martians Frontend Engineer — Accessible Login Demo”
About: One-paragraph summary of the purpose (mocked login SPA with email/password, UX/accessibility focus, light/dark mode).
Live Demo / Repo: Links to the GitHub Pages deployment and repo.
Tech Stack: Plain HTML/CSS/JS (no UI lib), mocked fetch() for authentication.
Features:
Email/password form with validation and error summary
Mocked server request with latency
Success state with dynamic welcome text and subtitle update
Light/dark theme toggle with persisted preference and logo swap
Accessible focus states, ARIA, keyboard friendly controls
Running Locally:
Prereq: modern browser
Steps: git clone …, cd …, open index.html (or npx serve .).
Structure:
index.html — markup and regions
styles.css — theming, layout, dark/light variables
app.js — validation, mock fetch, UI state, theme toggling
images/ — background-image.png, logo-light.png, logo-dark.png
Configuration:
Theme persists via localStorage
Logo swaps based on theme (light/dark assets)
Accessibility Notes:
Keyboard navigation, focus outlines
ARIA roles/labels, aria live notifications
Error summary and field level validation

