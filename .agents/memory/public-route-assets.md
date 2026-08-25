---
name: Public route asset resolution
description: Relative browser assets must resolve from the site root when the app is served at a nested public beat URL.
---

Use a root document base for the single-page app so scripts, worklets, and WASM continue to load from `/` on nested routes such as `/beat/:slug`.

**Why:** Without an explicit base, browser-relative asset URLs resolve beneath `/beat/`, return the HTML shell, and prevent public playback from initializing.

**How to apply:** When adding another nested client route, verify both its page load and every runtime asset request in a real browser.