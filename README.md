# DOPPIO

DOPPIO is a concept website for a coffee house that doesn't exist, the size of a Starbucks with the heart of a Napoli bar: **everything comes in twos.**

Every coffee is pulled as a doppio. Your name gets written on the cup properly, or spelled wrong on purpose if you miss the other place. And the second cup is *sospeso*: paid forward and left on the wall for whoever walks in next, like the old habit in Napoli.

Five pages, matcha milk, olive and one loud pink, and a lot of things that move.

---

## the pages

### `index.html` · home
| section | what happens |
|---|---|
| **hero** | a glass fills up twice (shot 01, shot 02), then DOPPIO pours in letter by letter and the second P lands late with a bounce. A rotating stamp spins faster when you scroll, and a shelf of glasses follows the mouse. Click a glass and it takes you to its card on the counter. |
| **today's special** | a pinned flap board: MATCHA MATCHA MATCHA flips letter by letter through the drinks as you scroll. The glass gets thrown out and a new one is thrown in. |
| **pulled twice** | an olive half and a pink half slide in from opposite sides and lock together, and the glass drops in between with a clink. |
| **the counter** | a pinned horizontal shop. The product cards lean with your scroll speed and the cups spin in as they arrive. It ends on a macro photo and a pink half with a cornetto cut open. |
| **what's your name?** | type your name and the barista writes it on the cup in marker. Turn on *spell it like the other place* to get it misspelled. *order two* sends the second cup to a stranger with a "paid forward" stamp, and the name always shrinks to fit the cup. |
| **iced amber latte** | one pinned section in two acts. Act 1: the faded name repeated, the cup and counting stats. Keep scrolling and it all flies away: six ingredient squares come out of the cup and callout lines draw to where each one sits. |

### `menu.html` · menu / prices
- **four posters**, dealt from a single pile: Double dose, Double Matcha, Double Cold, Double sweet. On hover the halves open and the glass lifts.
- **four boards** of product cards, with a sticky size switch: *doppio / doppio doppio / please stop*. Prices roll like a till, the cups grow and a "+2 shots" note appears.
- **+ add two**: two cut-outs fly in an arc to the tray counter in the header.
- **the tray**: pinned. The receipt prints out of a little printer as you scroll, with every line ×2, a *+1 sospeso, for a stranger: on us* line, a total and a barcode.

### `sospeso.html` · the second cup
- **halftone hero**: the photo is redrawn live as coffee dots on a canvas. The dots grow in as a wave and swell under the cursor like a lens. The hand is mirrored so it offers you the cup.
- **how it works**: three photos, with a tiny cup that hops from one to the next along a dashed line as you scroll.
- **the wall**: sospeso tickets pinned up, swinging when you hover. Leave one (it drops in with a bounce) or take one (it tears off and falls). The counter in the hero keeps track.
- **a napoli habit**: the story of caffè sospeso, beside a halftone espresso glass.
- **what a second cup does**: the cup lands, arrows shoot outward and labels pop.

### `room.html` · the room
- **"the room."**: the full stop drops like a drop of coffee and ripples, and a café table seen from above turns like a record as you scroll.
- **good morning**: drag the sun from 6:00 to midnight. The greeting flips (*morning, afternoon, evening, night*), the colour changes (night is olive, with a moon) and so does what's on: breakfast, lunch, aperitivo, last doppio. It starts at Milan's real time.
- **the floor**: a floor plan that draws itself. All 40 seats are clickable and one can be yours for twenty minutes. The four zones point to their photos with callout lines.
- **visit**: the address, a little map with a pulsing pin, the hours and whether it's open right now.

### `about.html` · about
- **DŌPPIŌ**: a frosted-glass poster. Two lids drop onto the O's (two cups seen from above) and lift when your cursor comes close. On scroll the steam clears and the photo comes into focus.
- **why two?**: two black-and-white flash cards of the founders that shuffle on click.
- **how we got here**: a sticky year that rolls digit by digit like an odometer, 2019 → 2026.
- **say hi, twice**: a newsletter form that stores nothing, the contacts, and a big signature.

---

## design

| | |
|---|---|
| **palette** | matcha milk `#eef2c9` · olive `#2f3d12` for every giant word · pink `#ec8aa0` / `#d9667f` as the only loud colour |
| **type** | [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) (condensed, heavy) · [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) italic · [DM Mono](https://fonts.google.com/specimen/DM+Mono) · [Caveat](https://fonts.google.com/specimen/Caveat) for the barista marker · [Pinyon Script](https://fonts.google.com/specimen/Pinyon+Script) for the signature |
| **moodboard** | `VIBES/`: each section is built from one specific reference (coffee posters, café web mockups, an Instagram grid, a halftone dairy site) |
| **details** | the cursor is a coffee bean with a label, toasts are printed like receipts, the loader is a glass filling up, the favicon is two cups seen from above |

---

## tech

Plain HTML, CSS and JavaScript, with no build step and no framework.

- [GSAP 3.12.5](https://gsap.com/) + ScrollTrigger for every animation, pin and scrub
- [Lenis 1.1.13](https://github.com/darkroomengineering/lenis) for smooth scrolling
- `<canvas>` for the halftone dots, inline SVG for the floor plan, the map and the arrows
- `localStorage` (prefix `dp-`) remembers your name, tray, size, seat and the tickets you left, only in your own browser
- `prefers-reduced-motion` is respected: everything still works, it just doesn't move

```
DOPPIO/
├── index.html · menu.html · sospeso.html · room.html · about.html
├── css/   style.css (shared) + one file per page
├── js/    main.js (shared engine: loader, cursor, toasts, slots, easter eggs)
│          data.js (the menu, sizes, the wall, the day, the floor)
│          + one file per page
├── img/   photos per page, see img/README.md
├── reel/  doppio-reel.mp4
└── VIBES/ the moodboard
```

### run it locally
You can open `index.html` directly, but a tiny local server is closer to how it runs online:

```bash
python3 -m http.server 5562
```

then open [localhost:5562](http://localhost:5562).

### photos
Every image is a slot: drop a file into `img/` with the right name and it shows up. The full list of names is in **[img/README.md](img/README.md)**. In the console, `doppio.missing()` tells you which ones are still empty.

---

## easter eggs
- **konami code** (↑ ↑ ↓ ↓ ← → ← → B A): the night shift. Same café, after closing.
- type **decaf**, **single**, **sugar** or **meow** anywhere on the page
- switch tab and come back: *your coffee is getting cold ☕*
- open the console and type `doppio.help()`

---

## credits
A concept, not a real business: DOPPIO, corso doppio 22, Livia and Ottavio are all invented. The moodboard images in `VIBES/` and the photos belong to their authors and are used only as references for a portfolio piece.

Concept, design & code by **ghostly.grl ♥**

```
 *    /\_/\      +
     ( o.o )   <3  ghostly.grl
 +    > ^ <   ☕     *
```
