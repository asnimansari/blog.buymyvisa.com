/**
 * Path builders for the illustrated scenes. Every scene is drawn on a 1600×600 canvas
 * (viewBox "0 0 1600 600"); the ground line sits around y=470.
 */
export const W = 1600;
export const H = 600;

type Pt = readonly [number, number];

const r = (n: number) => Math.round(n * 10) / 10;

/** A smooth line through the points (Catmull-Rom → cubic Béziers), without the leading M. */
function smooth(points: readonly Pt[]): string {
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r(c1[0])},${r(c1[1])} ${r(c2[0])},${r(c2[1])} ${r(p2[0])},${r(p2[1])}`;
  }
  return d;
}

/** A filled ridge: a smooth curve through the points, closed down to the bottom of the canvas. */
export function ridge(points: readonly Pt[], bottom = H): string {
  const first = points[0]!;
  const last = points[points.length - 1]!;
  return `M${first[0]},${bottom} L${r(first[0])},${r(first[1])}${smooth(points)} L${last[0]},${bottom} Z`;
}

/** A rolling ridge across the full width: `n` humps between heights `lo` and `hi` (smaller y = taller). */
export function rolling(seed: number, n: number, lo: number, hi: number, bottom = H): string {
  const rand = prng(seed);
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const x = -60 + ((W + 120) * i) / n;
    pts.push([x, hi + (lo - hi) * rand()]);
  }
  return ridge(pts, bottom);
}

/** A limestone karst tower: steep, slightly bulging sides and a rounded, lumpy crown. */
export function karst(x: number, base: number, w: number, h: number, lean = 0): string {
  const top = base - h;
  return (
    `M${x},${base}` +
    ` C${x - w * 0.08},${base - h * 0.45} ${x + w * 0.02 + lean},${top + h * 0.18} ${x + w * 0.22 + lean},${top + h * 0.06}` +
    ` C${x + w * 0.4 + lean},${top - h * 0.03} ${x + w * 0.62 + lean},${top + h * 0.02} ${x + w * 0.8 + lean},${top + h * 0.1}` +
    ` C${x + w * 1.02 + lean},${top + h * 0.25} ${x + w * 1.08},${base - h * 0.4} ${x + w},${base} Z`
  );
}

/** A flat-topped monolith (Sigiriya): sheer sides, a slight overhang and a level summit. */
export function mesa(x: number, base: number, w: number, h: number): string {
  const top = base - h;
  return (
    `M${x},${base}` +
    ` C${x + w * 0.04},${base - h * 0.5} ${x + w * 0.02},${top + h * 0.25} ${x + w * 0.12},${top + h * 0.06}` +
    ` Q${x + w * 0.18},${top} ${x + w * 0.3},${top} L${x + w * 0.74},${top + h * 0.01}` +
    ` Q${x + w * 0.9},${top + h * 0.02} ${x + w * 0.94},${top + h * 0.16}` +
    ` C${x + w * 1.02},${top + h * 0.4} ${x + w * 0.98},${base - h * 0.3} ${x + w * 1.04},${base} Z`
  );
}

/** A snowy peak and its snow cap (two paths). */
export function peak(x: number, base: number, w: number, h: number): { rock: string; snow: string } {
  const tx = x + w * 0.48;
  const ty = base - h;
  const rock = `M${x},${base} L${x + w * 0.3},${base - h * 0.55} L${x + w * 0.38},${base - h * 0.62} L${tx},${ty} L${x + w * 0.66},${base - h * 0.58} L${x + w * 0.78},${base - h * 0.5} L${x + w},${base} Z`;
  const sy = base - h * 0.62;
  const snow = `M${x + w * 0.36},${sy} L${tx},${ty} L${x + w * 0.64},${base - h * 0.6} L${x + w * 0.6},${sy + h * 0.08} L${x + w * 0.53},${sy + h * 0.02} L${x + w * 0.47},${sy + h * 0.1} L${x + w * 0.42},${sy + h * 0.03} Z`;
  return { rock, snow };
}

/** Deterministic pseudo-random numbers (mulberry32), so builds are reproducible. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Star positions for the night sky, `height` units tall from `top`. */
export function stars(
  seed: number,
  count: number,
  height = 330,
  top = 0,
): { x: number; y: number; r: number; d: number }[] {
  const rand = prng(seed);
  return Array.from({ length: count }, () => ({
    x: r(rand() * W),
    y: r(top + rand() * height),
    r: r(0.8 + rand() * 1.6),
    d: r(2 + rand() * 4),
  }));
}

/** Jungle tufts along a karst's crown (circles), matching `karst()`'s geometry. */
export function karstTufts(
  x: number,
  base: number,
  w: number,
  h: number,
  lean = 0,
): { cx: number; cy: number; rx: number; ry: number }[] {
  const top = base - h;
  const rand = prng(Math.round(x * 7 + h));
  return [0.1, 0.24, 0.38, 0.52, 0.66, 0.8, 0.92].map((t) => {
    const size = w * (0.07 + rand() * 0.04);
    return {
      cx: r(x + w * t + lean * (1 - t)),
      cy: r(top + h * (0.07 + 0.16 * Math.abs(t - 0.48)) + rand() * 5),
      rx: r(size * 1.3),
      ry: r(size * 0.75),
    };
  });
}
