# edupanel-vanilla

A lightweight, zero-dependency vanilla JavaScript and HTML5 interactive gamification panel designed for classroom displays and touch kiosks.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 / CSS3](https://img.shields.io/badge/HTML5-CSS3-orange)](https://developer.mozilla.org/en-US/docs/Web/HTML)

## Installation

Clone the repository directly:

```bash
git clone https://github.com/DiaztMF/edupanel-vanilla.git
cd edupanel-vanilla
```

No package manager or build step is required.

## Quick Start

Open `index.html` directly in any modern web browser or serve it using a local static file server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js npx
npx serve .
```

Visit [http://localhost:8080](http://localhost:8080) in your browser. For interactive classroom displays, enter fullscreen mode (`F11`).

## What is edupanel-vanilla?

`edupanel-vanilla` is the standalone, dependency-free edition of the EduPanel classroom learning suite. Implemented with clean ES6 JavaScript, HTML5 Canvas, and modern CSS variables, it runs on low-powered school PCs, smart TVs, and offline Interactive Flat Panels without Node.js or bundle compilation.

## Why edupanel-vanilla?

School computer laboratories and classroom smart displays frequently operate in air-gapped, offline environments with restricted administrative access. `edupanel-vanilla` eliminates build tools, bundlers, and npm dependencies, delivering instant interactive learning games out of the box.

## API / Routes

### Core Data & Runtime Modules
- `data.js`: Holds curriculum questions, category arrays, and scoring weights.
- `app.js` / `app-v2.js`: Main state loop handling timer countdowns, touch event listeners, and score tallies.
- `styles.css`: High-contrast display variables, touch animations, and fluid sizing.

## Examples

Customizing classroom quiz datasets inside `data.js`:

```javascript
const customQuestions = [
  {
    category: "Matematika",
    question: "Berapakah hasil dari 15 x 12?",
    options: ["180", "170", "160", "190"],
    answer: 0
  }
];
```

## Architecture & Development Guides

- Zero Dependencies: Pure Vanilla JS, HTML5, and CSS3.
- Hardware Compatibility: Verified on 1080p and 4K interactive school flat panels.
- Asset Assets: Pre-bundled school and departmental branding assets.

## License

MIT License. See [LICENSE](LICENSE) for full details.