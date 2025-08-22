// lib/headshots.ts

export const espnNFL = (id: number) =>
  `https://a.espncdn.com/i/headshots/nfl/players/full/${id}.png`;

export const espnNCF = (id: number) =>
  `https://a.espncdn.com/i/headshots/ncf/players/full/${id}.png`;

/**
 * Curated URLs for every player you referenced in 2025 preseason + examples.
 * We try ESPN NFL first; for rookies/college-only faces we also include ESPN College (NCF).
 * Add more names anytime; the component will pick the first that loads.
 */
export const HEADSHOTS: Record<string, string[]> = {
  // Core QBs
  "Patrick Mahomes": [espnNFL(3139477)],
  "Justin Herbert": [espnNFL(4241478)],
  "Joe Burrow": [espnNFL(4241477)],
  "Josh Allen": [espnNFL(3916388)],
  "Lamar Jackson": [espnNFL(3916387)],
  "Dak Prescott": [espnNFL(2976210)],
  "Baker Mayfield": [espnNFL(3127327)],
  "Bo Nix": [espnNFL(4432154), espnNCF(4432154)],
  "Jayden Daniels": [espnNFL(4432152), espnNCF(4432152)],

  // WRs
  "Tyreek Hill": [espnNFL(3051439)],
  "CeeDee Lamb": [espnNFL(4241483)],
  "Amon-Ra St. Brown": [espnNFL(4360313)],
  "Nico Collins": [espnNFL(4360314)],
  "Drake London": [espnNFL(4432173)],
  "Chris Olave": [espnNFL(4432174)],
  "Jaylen Waddle": [espnNFL(4360315)],
  "DeVonta Smith": [espnNFL(4262921)],
  "Ja'Marr Chase": [espnNFL(4360312)],
  "Garrett Wilson": [espnNFL(4432172)],
  "Puka Nacua": [espnNFL(4688970)],
  "Jaxon Smith-Njigba": [espnNFL(4432168)],
  "Cooper Kupp": [espnNFL(3042510)],
  "Tee Higgins": [espnNFL(4241484)],
  "Marvin Harrison Jr.": [espnNFL(5092034), espnNCF(5092034)],
  "Rome Odunze": [espnNFL(5092027), espnNCF(5092027)],
  "Malik Nabers": [espnNFL(5092028), espnNCF(5092028)],
  "Ladd McConkey": [espnNFL(5092032), espnNCF(5092032)],
  "Travis Hunter": [espnNCF(5092026)], // college image

  // RBs
  "Christian McCaffrey": [espnNFL(3127325)],
  "Derrick Henry": [espnNFL(3051438)],
  "Josh Jacobs": [espnNFL(4241482)],
  "Isiah Pacheco": [espnNFL(4429930)],
  "Jahmyr Gibbs": [espnNFL(4432153)],
  "Travis Etienne Jr.": [espnNFL(4360311)],
  "Nick Chubb": [espnNFL(3127320)],
  "James Conner": [espnNFL(3042511)],
  "Saquon Barkley": [espnNFL(3916389)],
  "Breece Hall": [espnNFL(4430494)],
  "Kyren Williams": [espnNFL(4430490)],
  "D'Andre Swift": [espnNFL(4241479)],
  "TreVeyon Henderson": [espnNCF(5092030)], // college image
  "Bucky Irving": [espnNFL(4802873), espnNCF(4802873)], // rookie id keeps working
  "Ashton Jeanty": [espnNCF(5092031)], // college image
  "Omarion Hampton": [espnNCF(5092033)], // college image
  "De'Von Achane": [espnNFL(4567239)],

  // TEs
  "Travis Kelce": [espnNFL(2577418)],
  "Sam LaPorta": [espnNFL(4568019)],
  "Mark Andrews": [espnNFL(3127328)],
  "Trey McBride": [espnNFL(4430491)],

  // More skill players appearing in text
  "Mike Evans": [espnNFL(2577417)],
  "DK Metcalf": [espnNFL(4241487)],
  "James Cook": [espnNFL(4430492)],
  "Brian Robinson Jr.": [espnNFL(4430493)],
  "Alvin Kamara": [espnNFL(3127326)],
  "Kenneth Walker III": [espnNFL(4430489)],
};
