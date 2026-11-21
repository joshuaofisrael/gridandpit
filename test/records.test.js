import assert from "node:assert/strict";
import { test } from "node:test";
import { ageLabel, circuits, races, records, seasonRollups, youngest } from "../lib/records.js";

test("pole to win counts match the classifications read on 21 November 2026", () => {
  const seasons = seasonRollups();
  const find = (year) => seasons.find((season) => season.season === year);
  assert.deepEqual(
    seasons.map((season) => [season.season, season.poleWins, season.races]),
    [
      [2024, 12, 24],
      [2025, 16, 24],
      [2026, 14, 20],
    ],
  );
  assert.equal(find(2024).complete, true);
  assert.equal(find(2026).complete, false);
  assert.equal(races.length, 68);
});

test("every race row names a pole and a winner and links a Formula 1 classification", () => {
  for (const race of races) {
    assert.ok(race.pole);
    assert.ok(race.winner);
    assert.match(race.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(race.qualifyingUrl, /^https:\/\/www\.formula1\.com\/en\/results\/\d{4}\/races\/\d+\/.+\/qualifying$/);
    assert.match(race.raceUrl, /^https:\/\/www\.formula1\.com\/en\/results\/\d{4}\/races\/\d+\/.+\/race-result$/);
  }
});

test("youngest ages are the five Formula 1 printed, and circuit rows keep their sources", () => {
  assert.equal(ageLabel(youngest[0]), "20 years and 68 days");
  assert.deepEqual(
    youngest.map((row) => [row.driver, row.years, row.days]),
    [
      ["Kimi Antonelli", 20, 68],
      ["Sebastian Vettel", 23, 133],
      ["Lewis Hamilton", 23, 300],
      ["Fernando Alonso", 24, 57],
      ["Max Verstappen", 24, 73],
    ],
  );
  assert.equal(circuits.length, 3);
  assert.equal(circuits[0].lapRecord, "1:33.365");
  assert.ok(circuits[0].timingUrl.startsWith("https://www.fia.com/"));
  for (const circuit of circuits) {
    assert.match(circuit.guideUrl, /^https:\/\/www\.formula1\.com\//);
    assert.match(circuit.pageUrl, /^https:\/\/www\.formula1\.com\//);
  }
});

test("csv downloads are the same rows as the page data", () => {
  assert.equal(records.csv.races.trim().split("\n").length, races.length + 1);
  assert.equal(records.csv.seasons.trim().split("\n").length, 4);
  assert.match(records.csv.races, /2026,18,United States,2026-10-25,,Kimi Antonelli,Kimi Antonelli,yes,/);
  assert.match(records.csv.youngest, /Kimi Antonelli,2026,20 years and 68 days/);
  assert.match(records.csv.circuits, /Las Vegas Strip Circuit,6.201,17,50,309.958,1:33.365,Max Verstappen,2025/);
});
