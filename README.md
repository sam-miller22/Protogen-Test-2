# Simple Home Page

This is a tiny static home page with a purple → teal gradient background, a "Hello, world!" intro, a circular photo placeholder, and a `Contact me` button that currently does nothing.

Files added:
- `index.html` — the page markup
- `styles.css` — styles for the page
- `assets/me.svg` — a placeholder SVG you can replace with your photo

How to open locally (macOS / zsh):

1. In Terminal, change to the project folder:

```bash
cd /path/to/project
```

2. Open the page in your default browser:

```bash
open index.html
```

Replace the photo:
- Swap `assets/me.svg` with your own image (keep the filename the same), or update the `src` in `index.html` to point to your file. For best results, use a square image so the circular crop looks right.

Notes:
- The `Contact me` button is intentionally inert. If you want it to open an email or a contact form, tell me how you'd like it to behave and I can add that.
