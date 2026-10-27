const faq = [
  {
    question: "What does Grid and Pit cover?",
    parts: [
      { text: "Grid and Pit covers Formula 1 for fans in the United States: news, the driver market, teams, results, standings, rules explainers and race times in ET, CT, MT and PT, plus hubs for Las Vegas, Miami, Austin and Cadillac." },
    ],
  },
  {
    question: "Is Grid and Pit affiliated with Formula 1?",
    parts: [
      { text: "No. Grid and Pit is independent and is not affiliated with, endorsed by or connected to Formula 1, the FIA, any team or any driver. The names are used only to describe the subject of the reporting." },
    ],
  },
  {
    question: "Why are race times given in four time zones?",
    parts: [
      { text: "Official timetables list local track time. We convert each session to Eastern, Central, Mountain and Pacific time and account for daylight saving changes. The times are in the " },
      { text: "Race Times", href: "/topics/race-times/" },
      { text: " section." },
    ],
  },
  {
    question: "How are stories sourced?",
    parts: [
      { text: "Every published article lists public sources, and results are checked against the official classification. Team statements are reported as the team's own account, and driver market reports are attributed to the outlet that published them. The rule is on " },
      { text: "Sources & Ethics", href: "/sources-ethics/" },
      { text: "." },
    ],
  },
  {
    question: "How do I contact Grid and Pit?",
    parts: [
      { text: "Send a message through the " },
      { text: "contact form", href: "/contact/" },
      { text: ". We do not publish a street address. A message is emailed to the site owner only to respond and is not sold." },
    ],
  },
];

export function faqAnswerText(item) {
  return item.parts.map((part) => part.text).join("");
}

export default faq;
