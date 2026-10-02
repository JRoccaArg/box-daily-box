// Coordinates stay in the centreline's own SVG space (before any transform).
export const CIRCUITS = {
  brianza: { finish: { x: 300, y: 96 }, baseLapMs: 83000 },
  sepang: { finish: { x: 265, y: 332 }, baseLapMs: 99500 },
  monaco: {
    // Control line on Boulevard Albert Ier; the SVG starts here, towards Sainte Dévote.
    finish: { x: 167.2, y: 123.7 },
    baseLapMs: 72200,
    // Mirabeau Haute approach, then the approach to the first Piscine chicane.
    sectorTargets: [{ x: 613, y: 88 }, { x: 257.1, y: 70.6 }],
    sectorTimeEnds: [.268, .734, 1],
    // Reference range: FIA 2026 Monaco qualifying, 1:12.051–1:16.061.
    // https://www.fia.com/events/fia-formula-one-world-championship/season-2026/monaco-grand-prix/qualifying-classification
  },
};
