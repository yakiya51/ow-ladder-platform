const OW_MAPS = [
  // Control
  "OASIS",
  "ILIOS",
  "NEPAL",
  "LIJIANG_TOWER",
  "BUSAN",

  // Escort
  "HAVANA",
  "JUNKERTOWN",
  "DORADO",
  "RIALTO",
  "WATCHPOINT_GIBRALTAR",
  "BLIZZARD_WORLD",
  "HOLLYWOOD",
  "KINGS_ROW",
  "NUMBANI",
  "ROUTE_66",
  "MIDTOWN",
  "COLOSSEO",
  "CIRCUIT_ROYAL",
] as const;

const OW_HEROES = [
  // Tanks
  "REINHARDT",
  "SIGMA",
  "ZARYA",
  "DVA",
  "DOOMFIST",
  "DOMINA",
  "JUNKER_QUEEN",
  "ORISA",
  "WINSTON",
  "WRECKING_BALL",
  "HAZARD",
  "MAUGA",
  "RAMATTRA",

  // Damage
  "ANRAN",
  "TRACER",
  "WIDOWMAKER",
  "HANZO",
  "JUNKRAT",
  "TORBJORN",
  "SYMMETRA",
  "BASTION",
  "SOMBRA",
  "REAPER",
  "MCCREE",
  "PHARAH",
  "CASSIDY",
  "ASHE",
  "GENJI",
  "MEI",
  "ECHO",
  "EMRE",
  "FREJA",
  "SOJOURN",
  "SOLDIER76",
  "VENDETTA",
  "VENTURE",

  // Supports
  "MERCY",
  "LUCIO",
  "JUNO",
  "ILLARI",
  "JETPACK_CAT",
  "ANA",
  "WUYANG",
  "ZENYATTA",
  "LIFEWEAVER",
  "MOIRA",
  "BAPTISTE",
  "MIZUKI",
  "BRIGITTE",
  "KIRIKO",
] as const;

export { OW_HEROES, OW_MAPS };
export type OwHero = (typeof OW_HEROES)[number];
export type OwMap = (typeof OW_MAPS)[number];
