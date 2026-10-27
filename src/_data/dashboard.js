// Every figure on /data/ is copied from a published story or a source that story cites.
// The build rejects a row with no source URL.

const figures = [
  {
    "id": "d-kimi-antonelli",
    "label": "Kimi Antonelli",
    "value": 365,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "d-george-russell",
    "label": "George Russell",
    "value": 242,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "d-lewis-hamilton",
    "label": "Lewis Hamilton",
    "value": 241,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "d-max-verstappen",
    "label": "Max Verstappen",
    "value": 236,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "d-charles-leclerc",
    "label": "Charles Leclerc",
    "value": 233,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "d-lando-norris",
    "label": "Lando Norris",
    "value": 211,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "d-oscar-piastri",
    "label": "Oscar Piastri",
    "value": 144,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "d-isack-hadjar",
    "label": "Isack Hadjar",
    "value": 105,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "d-liam-lawson",
    "label": "Liam Lawson",
    "value": 77,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "d-pierre-gasly",
    "label": "Pierre Gasly",
    "value": 42,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "t-mercedes",
    "label": "Mercedes",
    "value": 607,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 team standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/team",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "t-ferrari",
    "label": "Ferrari",
    "value": 474,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 team standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/team",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "t-red-bull",
    "label": "Red Bull",
    "value": 355,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 team standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/team",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "t-mclaren",
    "label": "McLaren",
    "value": 355,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 team standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/team",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "t-racing-bulls",
    "label": "Racing Bulls",
    "value": 102,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 team standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/team",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "t-alpine",
    "label": "Alpine",
    "value": 69,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 team standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/team",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "t-haas",
    "label": "Haas",
    "value": 30,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 team standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/team",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "t-audi",
    "label": "Audi",
    "value": 23,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 team standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/team",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "t-williams",
    "label": "Williams",
    "value": 12,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 team standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/team",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "independent"
  },
  {
    "id": "lead",
    "label": "Antonelli lead over Russell after Austin",
    "value": 123,
    "unit": "points",
    "asOf": "2026-10-25",
    "sourceName": "Formula 1, 2026 driver standings",
    "sourceUrl": "https://www.formula1.com/en/results/2026/drivers",
    "articleSlug": "2026-10-27-f1-standings-after-austin",
    "basis": "desk-sum",
    "note": "Grid and Pit arithmetic: 365 minus 242."
  },
  {"id": "t-aston-martin", "label": "Aston Martin", "value": 7, "unit": "points", "asOf": "2026-10-25", "sourceName": "Formula 1, 2026 team standings", "sourceUrl": "https://www.formula1.com/en/results/2026/team", "articleSlug": "2026-10-27-f1-standings-after-austin", "basis": "independent"},
  {"id": "t-cadillac", "label": "Cadillac", "value": 0, "unit": "points", "asOf": "2026-10-25", "sourceName": "Formula 1, 2026 team standings", "sourceUrl": "https://www.formula1.com/en/results/2026/team", "articleSlug": "2026-10-27-f1-standings-after-austin", "basis": "independent"}
];

const charts = [
  {
    "id": "drivers",
    "title": "Drivers' standings, top ten, after Austin",
    "lede": "Points after the United States Grand Prix, from the official standings table.",
    "scale": "max",
    "figureIds": [
      "d-kimi-antonelli",
      "d-george-russell",
      "d-lewis-hamilton",
      "d-max-verstappen",
      "d-charles-leclerc",
      "d-lando-norris",
      "d-oscar-piastri",
      "d-isack-hadjar",
      "d-liam-lawson",
      "d-pierre-gasly"
    ]
  },
  {
    "id": "teams",
    "title": "Constructors' standings after Austin",
    "lede": "Team points after the United States Grand Prix.",
    "scale": "max",
    "figureIds": [
      "t-mercedes",
      "t-ferrari",
      "t-red-bull",
      "t-mclaren",
      "t-racing-bulls",
      "t-alpine",
      "t-haas",
      "t-audi",
      "t-williams",
      "t-aston-martin",
      "t-cadillac"
    ]
  }
];

const tileIds = ["d-kimi-antonelli", "d-george-russell", "lead", "t-mercedes", "t-ferrari"];

export default {
  updated: "2026-10-27",
  figures,
  charts,
  tileIds,
};
