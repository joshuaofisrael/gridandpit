import fs from "node:fs";

// Figures read from Formula 1 classifications and circuit pages, and from one FIA
// timing sheet, on 21 November 2026. The page and the CSV files both use this module.

export const races = JSON.parse(fs.readFileSync(new URL("./records-races.json", import.meta.url), "utf8"));

export const checkedOn = "2026-11-21";

export const youngest = [
  {
    rank: 1,
    driver: "Kimi Antonelli",
    season: 2026,
    years: 20,
    days: 68,
    sourceName: "Formula 1, youngest world champions",
    sourceUrl:
      "https://www.formula1.com/en/latest/article/f1s-youngest-world-champions-as-antonelli-smashes-record.4otUr4h4wmWd6VmIEaNjzV",
    sourceDate: "2026-11-03",
  },
  {
    rank: 2,
    driver: "Sebastian Vettel",
    season: 2010,
    years: 23,
    days: 133,
    sourceName: "Formula 1, youngest world champions",
    sourceUrl:
      "https://www.formula1.com/en/latest/article/f1s-youngest-world-champions-as-antonelli-smashes-record.4otUr4h4wmWd6VmIEaNjzV",
    sourceDate: "2026-11-03",
  },
  {
    rank: 3,
    driver: "Lewis Hamilton",
    season: 2008,
    years: 23,
    days: 300,
    sourceName: "Formula 1, youngest world champions",
    sourceUrl:
      "https://www.formula1.com/en/latest/article/f1s-youngest-world-champions-as-antonelli-smashes-record.4otUr4h4wmWd6VmIEaNjzV",
    sourceDate: "2026-11-03",
  },
  {
    rank: 4,
    driver: "Fernando Alonso",
    season: 2005,
    years: 24,
    days: 57,
    sourceName: "Formula 1, youngest world champions",
    sourceUrl:
      "https://www.formula1.com/en/latest/article/f1s-youngest-world-champions-as-antonelli-smashes-record.4otUr4h4wmWd6VmIEaNjzV",
    sourceDate: "2026-11-03",
  },
  {
    rank: 5,
    driver: "Max Verstappen",
    season: 2021,
    years: 24,
    days: 73,
    sourceName: "Formula 1, youngest world champions",
    sourceUrl:
      "https://www.formula1.com/en/latest/article/f1s-youngest-world-champions-as-antonelli-smashes-record.4otUr4h4wmWd6VmIEaNjzV",
    sourceDate: "2026-11-03",
  },
];

export const circuits = [
  {
    circuit: "Las Vegas Strip Circuit",
    hub: "/hubs/las-vegas/",
    lengthKm: "6.201",
    turns: 17,
    laps: 50,
    distanceKm: "309.958",
    lapRecord: "1:33.365",
    driver: "Max Verstappen",
    year: 2025,
    guideUrl:
      "https://www.formula1.com/en/latest/article/circuit-guide-everything-you-need-to-know-about-the-las-vegas-strip-circuit.1W9ULMy0aEkvfsJ9tRzItg",
    guideDate: "2026-11-19",
    pageUrl: "https://www.formula1.com/en/racing/2026/las-vegas",
    timingUrl: "https://www.fia.com/sites/default/files/2025_22_usa_f1_r0_timing_racefastestlaps_v01.pdf",
  },
  {
    circuit: "Miami International Autodrome",
    hub: "/hubs/miami/",
    lengthKm: "5.412",
    turns: 19,
    laps: 57,
    distanceKm: "308.326",
    lapRecord: "1:29.708",
    driver: "Max Verstappen",
    year: 2023,
    guideUrl:
      "https://www.formula1.com/en/latest/article/circuit-guide-everything-you-need-to-know-about-the-miami-international-autodrome.zMEQ1nU4xZKuvc9EsGXDr",
    guideDate: "2026-04-30",
    pageUrl: "https://www.formula1.com/en/racing/2026/miami",
    timingUrl: "",
  },
  {
    circuit: "Circuit of The Americas",
    hub: "/hubs/austin/",
    lengthKm: "5.513",
    turns: 20,
    laps: 56,
    distanceKm: "308.432",
    lapRecord: "1:36.169",
    driver: "Charles Leclerc",
    year: 2019,
    guideUrl:
      "https://www.formula1.com/en/latest/article/circuit-guide-everything-you-node-to-know-about-the-circuit-of-the-americas.3OjhBbugiQRmN4FnlpBtBc",
    guideDate: "2026-10-22",
    pageUrl: "https://www.formula1.com/en/racing/2026/united-states",
    timingUrl: "",
  },
];

export function ageLabel(row) {
  return `${row.years} years and ${row.days} days`;
}

export function seasonRollups(list = races) {
  const seasons = [...new Set(list.map((race) => race.season))].sort((a, b) => a - b);
  return seasons.map((season) => {
    const rows = list.filter((race) => race.season === season);
    const poleWins = rows.filter((race) => race.pole === race.winner).length;
    return {
      season,
      races: rows.length,
      poleWins,
      complete: season !== 2026,
    };
  });
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function toCsv(rows, columns) {
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((column) => csvCell(row[column])).join(","));
  return `${lines.join("\n")}\n`;
}

const youngestRows = youngest.map((row) => ({
  rank: row.rank,
  driver: row.driver,
  season: row.season,
  age: ageLabel(row),
  source: row.sourceName,
  source_url: row.sourceUrl,
  source_date: row.sourceDate,
}));

const raceRows = races.map((race) => ({
  season: race.season,
  round: race.round,
  race: race.race,
  date: race.date,
  weekend_as_printed: race.weekend,
  pole: race.pole,
  winner: race.winner,
  pole_to_win: race.pole === race.winner ? "yes" : "no",
  qualifying_url: race.qualifyingUrl,
  race_url: race.raceUrl,
}));

const seasonRows = seasonRollups().map((season) => ({
  season: season.season,
  races_counted: season.races,
  pole_wins: season.poleWins,
  full_season: season.complete ? "yes" : "no",
}));

const circuitRows = circuits.map((circuit) => ({
  circuit: circuit.circuit,
  length_km: circuit.lengthKm,
  turns: circuit.turns,
  laps: circuit.laps,
  race_distance_km: circuit.distanceKm,
  lap_record: circuit.lapRecord,
  driver: circuit.driver,
  year: circuit.year,
  guide_url: circuit.guideUrl,
  guide_date: circuit.guideDate,
  page_url: circuit.pageUrl,
  timing_url: circuit.timingUrl,
}));

export const records = {
  checkedOn,
  youngest,
  races,
  seasons: seasonRollups(),
  circuits,
  csv: {
    youngest: toCsv(youngestRows, ["rank", "driver", "season", "age", "source", "source_url", "source_date"]),
    races: toCsv(raceRows, [
      "season",
      "round",
      "race",
      "date",
      "weekend_as_printed",
      "pole",
      "winner",
      "pole_to_win",
      "qualifying_url",
      "race_url",
    ]),
    seasons: toCsv(seasonRows, ["season", "races_counted", "pole_wins", "full_season"]),
    circuits: toCsv(circuitRows, [
      "circuit",
      "length_km",
      "turns",
      "laps",
      "race_distance_km",
      "lap_record",
      "driver",
      "year",
      "guide_url",
      "guide_date",
      "page_url",
      "timing_url",
    ]),
  },
};

export default records;
