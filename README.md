# Creative Programming

[Live demo](https://creative-programing-1.vercel.app/)

This is my Canvas API playground. Every sketch here exists because I wanted to understand one specific thing — how particles behave when a pull force and a push force fight over them, what a letter looks like once you read it back as pixels, how you turn an FFT into something worth looking at. Nothing here is a product and nothing is finished, which is the point: it's where I learn by making the thing rather than reading about it. Drawing to a canvas is the part of web work that interests me most right now, and I'm a fan of KLSR-style audio+visual work — where the sound and the image are built together instead of one decorating the other. This repo is me collecting the pieces I'd need to work that way.

## What's inside

Every sketch is a React component with a `<canvas>` and a `useEffect`. Grouped by what I was actually learning:

**Shapes and composition**

- [page1](creative_coding/src/components/page1/index.tsx) — the plain 2D context: arcs, rects, and a 5×5 grid where each cell randomly gets an inner square.
- [page2](creative_coding/src/components/page2/index.tsx) — rects and arcs scattered around a circle, each one rotated and scaled off its own angle.
- [drawing1](creative_coding/src/components/drawing1/index.tsx) — skewed rectangles in riso ink colors, clipped inside a triangle, stacked with overlay and color-burn blending. Seeded, so any output can be reproduced.

**Particles and forces**

- [page3](creative_coding/src/components/page3/index.tsx) — 100 bouncing agents; a line is drawn between any two that get close enough, thicker the closer they are.
- [page6](creative_coding/src/components/page6/index.tsx) — 500 agents pinned to a home position and dragged off it by 3D noise, same proximity lines.
- [drawing8](creative_coding/src/components/drawing8/index.tsx) — particles laid out on concentric rings, each pulled back toward its home position and pushed away from the cursor, with per-particle damping.
- [drawing9](creative_coding/src/components/drawing9/index.tsx) / [drawing10](creative_coding/src/components/drawing10/index.tsx) — the same rig, with a colormap driven by how far a particle has been displaced, sorted so the displaced ones draw on top.

**Curves and noise**

- [page4](creative_coding/src/components/page4/index.tsx) — a grid of line segments rotated and scaled by 3D noise, with a Tweakpane panel for grid size, frequency, amplitude and speed.
- [drawing2](creative_coding/src/components/drawing2/index.tsx) — draggable control points with a quadratic curve running through their midpoints. Click empty canvas to add another point.
- [drawing3](creative_coding/src/components/drawing3/index.tsx) / [drawing4](creative_coding/src/components/drawing4/index.tsx) — rows of noise-displaced points strung together with quadratic curves and a magma colormap. `drawing4` is one row of 6000 points and looks nothing like `drawing3`, which was the discovery.

**Type**

- [page5](creative_coding/src/components/page5/index.tsx) — draws a letter to an offscreen canvas, reads it back pixel by pixel, and rebuilds it as a grid of ASCII glyphs. Press any key to swap the letter.

**Audio-reactive** — Web Audio `AnalyserNode`, 4096-point FFT. Click anywhere to start and stop the track.

- [drawing5](creative_coding/src/components/drawing5/index.tsx) — 50 concentric rings of 10 arcs, each arc's thickness driven by its own frequency bin.
- [drawing6](creative_coding/src/components/drawing6/index.tsx) — 20 rings, each with a random number of slices.
- [drawing7](creative_coding/src/components/drawing7/index.tsx) — 10 rings, with bins split into bass, mid and high bands; the band decides how far each arc sweeps.

All three run on *Machine (Instrumental version)* by FLAMEBOY — royalty-free and licensed through [Artlist](https://artlist.io/royalty-free-music/song/machine-instrumental-version/6001260), so nothing here gets copyright-claimed.

**Image-sampled particles**

- [drawing11](creative_coding/src/components/drawing11/index.tsx) — the ring particle system again, except each particle takes its color and radius from the pixel underneath it in

**Exporting** — most sketches listen for `Cmd/Ctrl + S` to export the current frame, and `Cmd/Ctrl + A` to toggle recording: it captures the canvas at 30fps and converts the webm to mp4 in the browser with ffmpeg.wasm. Click the canvas first so it has focus.

## Demos







https://github.com/user-attachments/assets/3593cebe-fa27-4063-8681-d80060f6b8f5

https://github.com/user-attachments/assets/8ed6e38d-cc75-4d5d-b812-caa9b01f8204
<img width="2100" height="2100" alt="288177" src="https://github.com/user-attachments/assets/3ce43766-c352-48d1-8101-6a9fab6daebc" />
<img width="2100" height="2100" alt="2026 07 08-10 12 45" src="https://github.com/user-attachments/assets/caba6770-85ea-444e-93a8-3e37f4858fec" />
<img width="2100" height="2100" alt="2026 07 10-10 35 19" src="https://github.com/user-attachments/assets/128aa4eb-1d04-4294-86d6-0f3c541d10c7" />
<img width="2100" height="2100" alt="63873" src="https://github.com/user-attachments/assets/4c2f1c67-44c0-4f23-9feb-e07b229a3784" />
<img width="2100" height="2100" alt="453475 (2)" src="https://github.com/user-attachments/assets/ab130013-30f9-43c5-9ba3-bd4a4e20d834" />




## Stack & how to run

Plain Canvas 2D API — no WebGL, no p5. Next.js is only a host for the sketches.

- **Next.js** (pages router), **React** and **TypeScript**
- **canvas-sketch** and **canvas-sketch-util** for the render loop, seeded random, noise and math helpers
- **Web Audio API** for the audio-reactive sketches
- **tweakpane** for live controls, **riso-colors**, **colormap**, **color-interpolate** and **eases** for color and easing
- **@ffmpeg/ffmpeg** for the in-browser mp4 export
- **Sass modules** for the little layout there is, **Biome** for lint and formatting

```bash
cd creative_coding
pnpm install
pnpm dev
```

Every sketch has its own route under `/sketches`, named after its component — `/sketches/page1`, `/sketches/drawing11`, and so on. A navbar on each one numbers them 1 to 17: `page1` to `page6` are 1–6, `drawing1` to `drawing11` are 7–17. Hover a number to see which component it is.

---

More of my work: [matejforejt.com](https://matejforejt.com)
