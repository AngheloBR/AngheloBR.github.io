# anghelobr.github.io

Personal site of Jaren Bailon (@AngheloBR): Linux server hardening service + public labs and notes.

## Structure

```
index.html            Home (EN/ES, dark/light). Hero with a Three.js scene, diff of what changes, process, pricing, labs, about.
lab-*.html            Labs (Spanish). debian-13-sources.html follows the same layout.
_archive/             Pages kept out of the site (Jekyll ignores _folders on GitHub Pages).
assets/site.css       Shared tokens (colors, type), reset, nav, buttons, footer.
assets/home.css       Home-only sections and the 3D scene shell.
assets/lab.css        Article styles: header, content, code, callouts, side index, prev/next.
assets/site.js        Theme toggle, mobile menu, copy buttons, scroll reveal.
assets/home.js        Spanish copy + language toggle, lab filters.
assets/lab.js         Builds the sticky "On this page" index from h2 headings.
assets/scene.js       The perimeter: server starts on stock config (attackers get in), "Harden this server" builds the shell, then packets bounce. HUD log + stock/hardened switch.
assets/vendor/        three.r128.min.js (vendored, no CDN dependency).
```

## Adding a lab

1. Copy any `lab-00x-*.html`, keep the `<head>` and nav/footer, write the content inside `.content`.
2. Add a card in `index.html` under `#labsGrid` (with `data-tags`) and its Spanish strings in `assets/home.js`.

## Design tokens

Graphite background, LED amber accent (`--amber`), green/red reserved for allow/deny.
Type: Bricolage Grotesque (display), IBM Plex Sans (body), IBM Plex Mono (data). Fonts load from Google Fonts.
